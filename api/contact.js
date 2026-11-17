const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // Keep as is
    }
  }

  const { name, email, phone, message } = body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'nexvedatechnologies@gmail.com';
  const pass = (process.env.SMTP_PASS || 'kwla kwnu gwkg vvjk').replace(/\s+/g, '');
  const contactEmail = process.env.CONTACT_EMAIL || 'nexvedatechnologies@gmail.com';

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"Nexveda Website" <${user}>`,
      to: contactEmail,
      replyTo: email,
      subject: `New Website Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log(`Email successfully sent via SMTP to ${contactEmail}`);
    return res.status(200).json({ success: true, message: 'Thanks! Your message has been sent successfully.' });
  } catch (err) {
    console.error('SMTP error on Vercel:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message: ' + err.message });
  }
};
