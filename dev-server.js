process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason instanceof Error ? reason.message : reason);
});

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

let sqlite3 = null;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (e) {
  console.warn('Optional sqlite3 module not available:', e.message);
}

let Pool = null;
try {
  Pool = require('pg').Pool;
} catch (e) {
  console.warn('Optional pg module not available:', e.message);
}

const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const contactEmail = process.env.CONTACT_EMAIL || 'nexvedatechnologies@gmail.com';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Hide framework fingerprint
app.disable('x-powered-by');

// Enable trust proxy only when explicitly behind a reverse proxy (e.g. Cloudflare / Nginx)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Security helpers
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHeaderControls(value) {
  return String(value ?? '').replace(/[\r\n\0]+/g, ' ').trim();
}

// In-memory sliding-window rate limiter (zero external dependencies)
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (now >= entry.resetAt) {
        hits.delete(key);
      }
    }
  }, Math.min(windowMs, 60_000));
  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(clientIp);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(clientIp, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({ success: false, message });
    }

    return next();
  };
}

const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many requests. Please wait a few minutes and try again.'
});

const contactRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many contact submissions from your IP. Please try again in 15 minutes.'
});

// Configure SMTP Transporter (for Gmail or custom SMTP)
let smtpTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_gmail_app_password_here') {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
    },
  });
  console.log('Email Service: Configured via SMTP');
} else if (resend) {
  console.log('Email Service: Configured via Resend API');
} else {
  console.warn('Email Service: Disabled (SMTP credentials or RESEND_API_KEY not configured in .env)');
}

// Database Setup (Supports PostgreSQL & SQLite)
let dbType = process.env.DB_TYPE || 'sqlite';
let pgPool = null;
let sqliteDb = null;

const pgHost = process.env.DB_HOST || process.env.PG_HOST;
const pgUser = process.env.DB_USER || process.env.PG_USER;
const pgPass = process.env.DB_PASSWORD || process.env.PG_PASSWORD;
const rawPgDbName = process.env.DB_NAME || process.env.PG_DATABASE || 'nexveda';
const pgDbName = /^[a-zA-Z0-9_]{1,63}$/.test(rawPgDbName) ? rawPgDbName : 'nexveda';
const pgPort = parseInt(process.env.DB_PORT || process.env.PG_PORT || '5432', 10);
const connectionString = process.env.DATABASE_URL;

function initSqlite() {
  if (!sqlite3) {
    console.log('SQLite module not available, running without persistent database.');
    return;
  }
  dbType = 'sqlite';
  const dbPath = process.env.DB_PATH || './data/nexveda.db';
  try {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch (dirErr) {
    console.warn('Could not create DB directory, SQLite will use memory:', dirErr.message);
  }

  try {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.warn('SQLite disk open error, falling back to memory database:', err.message);
        sqliteDb = new sqlite3.Database(':memory:');
      }

      sqliteDb.run(`CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, (createErr) => {
        if (createErr) {
          console.warn('Failed to create SQLite table:', createErr.message);
        } else {
          console.log('Connected to SQLite Database');
        }
      });
    });
  } catch (initErr) {
    console.warn('SQLite init error:', initErr.message);
  }
}

if ((connectionString || pgHost) && process.env.DB_TYPE !== 'sqlite' && Pool) {
  dbType = 'postgres';

  async function initPostgres() {
    try {
      if (!connectionString && pgHost) {
        const adminPool = new Pool({
          host: pgHost,
          port: pgPort,
          user: pgUser,
          password: pgPass,
          database: 'postgres',
          ssl: false
        });

        try {
          const res = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [pgDbName]);
          if (res.rowCount === 0) {
            await adminPool.query(`CREATE DATABASE "${pgDbName}"`);
            console.log(`PostgreSQL database "${pgDbName}" created successfully.`);
          }
        } catch (dbCreateErr) {
          console.warn('Database auto-creation note:', dbCreateErr.message);
        } finally {
          await adminPool.end().catch(() => {});
        }
      }

      pgPool = new Pool(connectionString ? {
        connectionString,
        ssl: process.env.PG_SSL === 'false' ? false : { rejectUnauthorized: false }
      } : {
        host: pgHost,
        port: pgPort,
        user: pgUser,
        password: pgPass,
        database: pgDbName,
        ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
      });

      await pgPool.query(`CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      console.log(`Connected to PostgreSQL Database "${pgDbName}" (Table: submissions ready)`);
    } catch (err) {
      console.error('PostgreSQL setup/connection error:', err.message);
      console.log('Falling back to SQLite database...');
      initSqlite();
    }
  }

  initPostgres();
} else {
  initSqlite();
}

// Helper function to save submission
async function saveSubmission(name, email, phone, message) {
  try {
    if (dbType === 'postgres' && pgPool) {
      const query = 'INSERT INTO submissions (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING id';
      await pgPool.query(query, [name, email, phone || '', message]);
    } else if (sqliteDb) {
      await new Promise((resolve) => {
        const insertSql = 'INSERT INTO submissions (name, email, phone, message) VALUES (?, ?, ?, ?)';
        sqliteDb.run(insertSql, [name, email, phone || '', message], function (err) {
          if (err) console.warn('SQLite save warning:', err.message);
          resolve(this ? this.lastID : null);
        });
      });
    } else {
      console.log('Lead received (in-memory mode)');
    }
  } catch (err) {
    console.warn('saveSubmission warning:', err.message);
  }
}

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' https://images.unsplash.com data: blob:",
      "connect-src 'self' https://formsubmit.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'"
    ].join('; ')
  );

  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

// Strict Path Guard: block path traversal, dotfiles, backend code, and database files
const BLOCKED_EXACT_PATHS = new Set([
  '/dev-server.js',
  '/server.js',
  '/package.json',
  '/package-lock.json',
  '/README.md',
  '/.env',
  '/.gitignore'
]);

app.use((req, res, next) => {
  let decodedPath = req.path;
  try {
    decodedPath = decodeURIComponent(req.path);
  } catch {
    return res.status(400).json({ success: false, message: 'Bad request.' });
  }

  if (
    decodedPath.includes('..') ||
    decodedPath.includes('\0') ||
    /(^|\/)\.[^/]+/.test(decodedPath) ||
    /^\/(data|node_modules)(\/|$)/i.test(decodedPath) ||
    /\.(db|sqlite|sqlite3|log|env|md|bak|sql)$/i.test(decodedPath) ||
    BLOCKED_EXACT_PATHS.has(decodedPath)
  ) {
    return res.status(404).send('Not Found');
  }

  return next();
});

// Restricted CORS for API endpoints
const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin/non-CORS requests (no Origin header)
    if (!origin) return callback(null, true);

    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow local development origins
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 600
};

app.use('/api', cors(corsOptions), apiRateLimiter);

// Strict JSON & URL-encoded payload size limits
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// Whitelist static public assets only (never expose root server files or DB directory)
const PUBLIC_STATIC_FILES = new Set([
  '/index.html',
  '/styles.css',
  '/script.js',
  '/policy.css',
  '/privacy-policy.html',
  '/refund-policy.html',
  '/terms-and-conditions.html',
  '/robots.txt',
  '/sitemap.xml',
  '/site.webmanifest'
]);

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(Array.from(PUBLIC_STATIC_FILES), (req, res) => {
  const safeRelative = req.path.replace(/^\/+/, '');
  res.sendFile(path.join(__dirname, safeRelative));
});

const staticOpts = { dotfiles: 'deny', index: false, maxAge: '1h' };
app.use('/images', express.static(path.join(__dirname, 'images'), staticOpts));
app.use('/assets', express.static(path.join(__dirname, 'assets'), staticOpts));

app.post('/api/contact', contactRateLimiter, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, message: 'Invalid request payload.' });
  }

  const { name, email, phone, message, website } = req.body;

  // Honeypot check: bots filling hidden field get silent success without touching DB/SMTP
  if (typeof website === 'string' && website.trim().length > 0) {
    return res.json({ success: true, message: 'Thanks! Your message has been sent successfully.' });
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  }

  if (phone !== undefined && phone !== null && typeof phone !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
  }

  const cleanName = stripHeaderControls(name);
  const cleanEmail = stripHeaderControls(email);
  const cleanPhone = stripHeaderControls(phone || '');
  const cleanMessage = message.replace(/\0/g, '').trim();

  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters.' });
  }

  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  if (cleanEmail.length > 254 || !emailPattern.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  if (cleanPhone.length > 30 || (cleanPhone && !/^[0-9+\-()\s.]+$/.test(cleanPhone))) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
  }

  if (cleanMessage.length < 5 || cleanMessage.length > 5000) {
    return res.status(400).json({ success: false, message: 'Message must be between 5 and 5000 characters.' });
  }

  try {
    await saveSubmission(cleanName, cleanEmail, cleanPhone, cleanMessage);
  } catch (dbErr) {
    console.warn('Database save warning (proceeding with email dispatch):', dbErr.message);
  }

  const safeHtmlBody = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(cleanPhone || 'N/A')}</p>
    <p><strong>Message:</strong><br/>${escapeHtml(cleanMessage).replace(/\n/g, '<br/>')}</p>
  `;

  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: `"Nexveda Website" <${process.env.SMTP_USER || contactEmail}>`,
        to: contactEmail,
        replyTo: cleanEmail,
        subject: `New Website Inquiry from ${cleanName}`,
        html: safeHtmlBody,
      });
      console.log('Email successfully sent via SMTP');
    } catch (mailErr) {
      console.error('SMTP email error:', mailErr.message);
    }
  } else if (resend) {
    try {
      await resend.emails.send({
        from: 'Nexveda Contact <onboarding@resend.dev>',
        to: [contactEmail],
        reply_to: cleanEmail,
        subject: `New Website Inquiry from ${cleanName}`,
        html: safeHtmlBody,
      });
      console.log('Email successfully sent via Resend');
    } catch (mailErr) {
      console.error('Resend email error:', mailErr.message);
    }
  }

  return res.json({ success: true, message: 'Thanks! Your message has been sent successfully.' });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// 404 fallback
app.use((_req, res) => {
  res.status(404).send('Not Found');
});

// Safe global error handler (never expose stack traces or internal details)
app.use((err, _req, res, _next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed.' });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Malformed JSON body.' });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request payload is too large.' });
  }
  console.error('Unhandled server error:', err ? err.message : 'Unknown error');
  return res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}
