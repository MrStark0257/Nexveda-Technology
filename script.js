/* ==========================================================================
   LENIS BUTTERY SMOOTH SCROLL ENGINE
   ========================================================================== */
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window && window.innerWidth <= 1024);

if (window.Lenis) {
  // On mobile/touch devices, native hardware-accelerated momentum scrolling is smoother and battery-efficient
  if (!isTouchDevice) {
    window._lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      syncTouch: false
    });

    function raf(time) {
      window._lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth scroll for internal anchor links using Lenis or native smooth scroll
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href !== '#' && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (window._lenis) {
            window._lenis.scrollTo(target, { offset: -80, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
  });
}

/* ==========================================================================
   MAGNETIC BUTTONS PHYSICS (DESKTOP ONLY)
   ========================================================================== */
if (!isTouchDevice) {
  document.querySelectorAll('.btn, .btn-primary-pill, .btn-nav-primary, .float-btn, .est-option-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

const body = document.body;
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const progressBar = document.getElementById('scrollProgress');
const scrollTopBtn = document.getElementById('scrollTop');
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');
const counters = document.querySelectorAll('[data-count]');
const revealElements = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contactForm');
const formMessage = document.querySelector('.form-message');
const themeToggle = document.getElementById('themeToggle');

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */
const savedTheme = localStorage.getItem('nexveda_theme');
if (savedTheme === 'light') {
  body.classList.add('light-theme');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('nexveda_theme', isLight ? 'light' : 'dark');
  });
}

/* ==========================================================================
   DYNAMIC GLOWING LIGHT BEAMS & DENSE IRIDESCENT STREAM CANVAS (HERO BACKGROUND)
   ========================================================================== */
const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let isHeroVisible = true;
  let animFrameId = null;

  function resizeCanvas() {
    width = heroCanvas.width = heroCanvas.offsetWidth || window.innerWidth;
    height = heroCanvas.height = heroCanvas.offsetHeight || window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  window.addEventListener('mousemove', (e) => {
    if (!isHeroVisible) return;
    const rect = heroCanvas.getBoundingClientRect();
    targetMouseX = e.clientX - rect.left;
    targetMouseY = e.clientY - rect.top;
  }, { passive: true });

  // High-tech iridescent light stream colors
  const colorPalette = [
    { start: 'rgba(56, 189, 248, ', end: 'rgba(37, 99, 235, ' },    // Cyan to Electric Blue
    { start: 'rgba(14, 165, 233, ', end: 'rgba(29, 78, 216, ' },   // Sky Blue to Royal Blue
    { start: 'rgba(59, 130, 246, ', end: 'rgba(99, 102, 241, ' },   // Royal Blue to Indigo
    { start: 'rgba(52, 211, 153, ', end: 'rgba(6, 182, 212, ' },    // Emerald Mint to Cyan
    { start: 'rgba(56, 189, 248, ', end: 'rgba(14, 165, 233, ' },   // Light Cyan Accent
    { start: 'rgba(255, 255, 255, ', end: 'rgba(56, 189, 248, ' }   // Pure White Highlight
  ];

  // Stream fibers scaled for mobile vs desktop for optimal battery and 60 FPS
  const isMobileScreen = window.innerWidth < 768;
  const fiberCount = isMobileScreen ? 35 : 100;
  const fibers = [];

  for (let i = 0; i < fiberCount; i++) {
    const isGlowBeam = i % 10 === 0;
    const isUltraThin = i % 3 === 0;

    fibers.push({
      bandOffset: (Math.random() - 0.35) * (isMobileScreen ? 450 : 800),
      progress: Math.random(),
      length: isGlowBeam ? (isMobileScreen ? 500 : 950) : (isMobileScreen ? 300 : 550),
      width: isGlowBeam ? Math.random() * 10 + 4 : (isUltraThin ? Math.random() * 1 + 0.5 : Math.random() * 3 + 1.2),
      speed: Math.random() * 0.0022 + 0.0007,
      opacity: isGlowBeam ? Math.random() * 0.22 + 0.1 : Math.random() * 0.6 + 0.2,
      colors: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      waveFreq: Math.random() * 0.004 + 0.002,
      waveAmp: Math.random() * (isMobileScreen ? 12 : 18) + 5,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Floating embers / particle sparks flowing along the stream
  const sparkCount = isMobileScreen ? 15 : 45;
  const sparks = [];
  for (let i = 0; i < sparkCount; i++) {
    sparks.push({
      x: Math.random() * (width || window.innerWidth),
      y: Math.random() * (height || window.innerHeight),
      vx: -(Math.random() * 1.2 + 0.4),
      vy: Math.random() * 1.2 + 0.4,
      radius: Math.random() * 2.2 + 0.7,
      alpha: Math.random() * 0.65 + 0.2,
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)].start
    });
  }

  let time = 0;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    } else if (isHeroVisible && !animFrameId) {
      animFrameId = requestAnimationFrame(renderBeams);
    }
  });

  function renderBeams() {
    if (!isHeroVisible) {
      animFrameId = null;
      return;
    }

    time += 1;
    ctx.clearRect(0, 0, width, height);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    const isLight = body.classList.contains('light-theme');
    ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';

    // Interactive Mouse Spotlight
    if (!isLight && mouseX > 0 && mouseY > 0) {
      const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300);
      mouseGlow.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
      mouseGlow.addColorStop(0.5, 'rgba(37, 99, 235, 0.05)');
      mouseGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseGlow;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 300, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main Diagonal Stream Band coordinates:
    const startX = width * 0.92;
    const startY = -140;
    const endX = -180;
    const endY = height * 1.2;
    const totalDist = Math.hypot(endX - startX, endY - startY);

    const normDx = (endX - startX) / totalDist;
    const normDy = (endY - startY) / totalDist;
    const perpX = -normDy;
    const perpY = normDx;

    const parallaxX = (mouseX / (width || 1) - 0.5) * 45;
    const parallaxY = (mouseY / (height || 1) - 0.5) * 45;

    fibers.forEach((fiber) => {
      fiber.progress += fiber.speed;
      if (fiber.progress > 1.3) {
        fiber.progress = -0.3;
      }

      const currDist = fiber.progress * totalDist;
      const baseX = startX + normDx * currDist + perpX * fiber.bandOffset + parallaxX;
      const baseY = startY + normDy * currDist + perpY * fiber.bandOffset + parallaxY;

      const wave = Math.sin(time * fiber.waveFreq + fiber.phase) * fiber.waveAmp;
      const x1 = baseX + perpX * wave;
      const y1 = baseY + perpY * wave;

      const x2 = x1 + normDx * fiber.length;
      const y2 = y1 + normDy * fiber.length;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      const alphaMult = isLight ? 0.35 : 1;
      gradient.addColorStop(0, fiber.colors.start + '0)');
      gradient.addColorStop(0.3, fiber.colors.start + (fiber.opacity * alphaMult) + ')');
      gradient.addColorStop(0.7, fiber.colors.end + (fiber.opacity * 0.85 * alphaMult) + ')');
      gradient.addColorStop(1, fiber.colors.end + '0)');

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = fiber.width;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Render Floating Spark Embers
    sparks.forEach((spark) => {
      spark.x += spark.vx;
      spark.y += spark.vy;

      if (spark.x < -20 || spark.y > height + 20) {
        spark.x = Math.random() * width + 100;
        spark.y = Math.random() * (height * 0.6) - 50;
      }

      ctx.beginPath();
      ctx.arc(spark.x + parallaxX * 0.4, spark.y + parallaxY * 0.4, spark.radius, 0, Math.PI * 2);
      ctx.fillStyle = spark.color + (spark.alpha * (isLight ? 0.4 : 1)) + ')';
      ctx.fill();
    });

    animFrameId = requestAnimationFrame(renderBeams);
  }

  // IntersectionObserver to pause canvas animation when off-screen
  const canvasObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isHeroVisible = entry.isIntersecting;
      if (isHeroVisible && !animFrameId) {
        animFrameId = requestAnimationFrame(renderBeams);
      }
    });
  }, { threshold: 0.05 });
  canvasObserver.observe(heroCanvas);
}

/* Nav scroll state with requestAnimationFrame throttling */
let isScrollingTick = false;
window.addEventListener('scroll', () => {
  if (!isScrollingTick) {
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = `${scrollPercent}%`;
      if (scrollTopBtn) scrollTopBtn.classList.toggle('show', scrollTop > 400);
      if (header) header.classList.toggle('scrolled', scrollTop > 12);
      isScrollingTick = false;
    });
    isScrollingTick = true;
  }
}, { passive: true });

const navBackdrop = document.getElementById('navBackdrop');

function closeMobileMenu() {
  if (!navLinks) return;
  navLinks.classList.remove('open');
  if (menuToggle) {
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  if (navBackdrop) navBackdrop.classList.remove('open');
  document.body.classList.remove('menu-open');
}

function openMobileMenu() {
  if (!navLinks) return;
  navLinks.classList.add('open');
  if (menuToggle) {
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
  }
  if (navBackdrop) navBackdrop.classList.add('open');
  document.body.classList.add('menu-open');
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navLinks.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMobileMenu());
  });

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeMobileMenu);
  }

  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMobileMenu();
    }
  });
}

// Touch flip support for process cards
const processCards = document.querySelectorAll('.process-card.flip-card');
processCards.forEach((card) => {
  card.addEventListener('click', (e) => {
    // Only toggle on touch/mobile or when card itself is clicked
    if (window.innerWidth <= 992 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0) {
      card.classList.toggle('flipped');
    }
  });
});

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    const startPos = window.pageYOffset || document.documentElement.scrollTop;
    if (startPos === 0) return;
    const duration = Math.min(Math.max(startPos * 0.4, 600), 1200);
    const startTime = performance.now();

    function easeOutQuart(t) {
      const p = t - 1;
      return 1 - p * p * p * p;
    }

    function scrollStep(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      window.scrollTo(0, startPos * (1 - easedProgress));

      if (progress < 1) {
        requestAnimationFrame(scrollStep);
      }
    }

    requestAnimationFrame(scrollStep);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.portfolio-card').forEach((card) => {
      const role = card.dataset.designRole;
      if (filter === 'all') {
        // Show all standard cards and the master design card; hide sub design cards
        card.style.display = role === 'sub' ? 'none' : '';
      } else if (filter === 'design') {
        // In design filter, hide the master card and reveal the 2 specialized cards
        if (role === 'master') {
          card.style.display = 'none';
        } else if (role === 'sub') {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      } else {
        // Standard categories
        card.style.display = card.dataset.category === filter ? '' : 'none';
      }
    });
  });
});

// "Explore Work ↗" button on Master Branding Card triggers the Branding & Design filter tab
document.querySelectorAll('.design-filter-trigger').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const designBtn = document.querySelector('.filter-btn[data-filter="design"]');
    if (designBtn) {
      designBtn.click();
      const portfolioGrid = document.querySelector('.portfolio-grid');
      if (portfolioGrid) {
        portfolioGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });
});

const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = Math.round(target * progress);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const target = entry.target;
      if (target.dataset.count) {
        animateCounter(target);
        observer.unobserve(target);
      }

      if (target.classList.contains('reveal')) {
        target.classList.add('is-visible');
      }
    }
  });
}, { threshold: 0.18 });

counters.forEach((counter) => observer.observe(counter));
revealElements.forEach((element) => observer.observe(element));

/* ==========================================================================
   INSTANTANEOUS SCROLL APPEARANCE
   ========================================================================== */
// Make all reveal blocks instantaneously visible without scroll lag
document.querySelectorAll('.reveal, .section-heading, .portfolio-card, .service-card, .process-card, .stat-card').forEach((el) => {
  el.style.opacity = '1';
  el.style.transform = 'none';
});

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    if (!name || !email || !message) {
      formMessage.textContent = 'Please fill out all required fields.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formMessage.textContent = 'Please enter a valid email address.';
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';
    }
    formMessage.textContent = '';

    try {
      // 1. Try local or Vercel serverless API first
      let apiSucceeded = false;
      try {
        const localRes = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, message })
        });
        if (localRes.ok) {
          const localData = await localRes.json();
          if (localData.success) {
            apiSucceeded = true;
            formMessage.style.color = '#10b981';
            formMessage.textContent = localData.message || 'Thanks! Your message has been sent successfully.';
            contactForm.reset();
          }
        }
      } catch (localErr) {
        console.log('Local/Vercel API not reachable, falling back to static service...');
      }

      if (apiSucceeded) {
        return;
      }

      // 2. Fallback to FormSubmit (for static GitHub Pages hosting)
      const response = await fetch('https://formsubmit.co/ajax/nexvedatechnologies@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || 'N/A',
          message,
          _subject: `New Inquiry from ${name} - Nexveda Technologies`,
          _captcha: 'false',
          _template: 'table'
        })
      });

      const result = await response.json();

      if (response.ok && (result.success === 'true' || result.success === true)) {
        formMessage.style.color = '#10b981';
        formMessage.textContent = 'Thanks! Your message has been sent successfully.';
        contactForm.reset();
      } else if (result.message && result.message.toLowerCase().includes('activation')) {
        formMessage.style.color = '#f59e0b';
        formMessage.textContent = 'Form activation link sent! Please check nexvedatechnologies@gmail.com and click "Activate Form" once.';
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.warn('Form submission error, falling back to mailto:', error);
      const mailtoUrl = `mailto:nexvedatechnologies@gmail.com?subject=${encodeURIComponent('Inquiry from ' + name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`)}`;
      window.location.href = mailtoUrl;
      formMessage.style.color = '#38bdf8';
      formMessage.textContent = 'Opening your mail application to send your inquiry directly...';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
}

document.querySelectorAll('.btn').forEach((button) => {
  button.addEventListener('mousemove', (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    button.style.setProperty('--x', `${x}px`);
    button.style.setProperty('--y', `${y}px`);
  });
});

const heroFrameEl = document.querySelector('.hero-frame');
if (heroFrameEl) {
  heroFrameEl.addEventListener('mousemove', (event) => {
    const rect = heroFrameEl.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroFrameEl.style.transform = `perspective(1200px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
  });

  heroFrameEl.addEventListener('mouseleave', () => {
    heroFrameEl.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
}

/* ==========================================================================
   SANCHIT SHARMA BIO POP-UP MODAL (AI GRAPHIC DESIGNER & FRONTEND WEB DESIGNER)
   ========================================================================== */
const sanchitProfileData = {
  name: "SANCHIT SHARMA",
  role: "AI GRAPHIC DESIGNER × FRONTEND WEB DESIGNER",
  location: "Kullu, Himachal Pradesh, India",
  phone: "+91 8988113310",
  email: "sanchitsharma217@gmail.com",
  portfolioWebUrl: "https://sanchitsharma217-arch.github.io/Sanchit-Portfolio/",
  avatarUrl: "assets/images/sanchit-sharma.jpg",
  summary: "Creative designer working at the intersection of AI, graphic design, and frontend development. Experienced with AI-generated visuals, Photoshop, thumbnails, and web interfaces, with a focus on original visual concepts and digital experiences. Constantly learning, experimenting, and building across design and web.",
  skillsDesign: ["Photoshop (Compositing & Retouching)", "AI Asset Collection (Generative Artwork)", "YouTube Thumbnail Design", "Visual Branding & Storytelling", "Poster Artwork & Image Manipulation"],
  skillsTech: ["Frontend Web Design", "HTML5 & CSS3", "Dynamic Scroll Animations", "Responsive Interfaces", "Web Graphics Optimization"],
  projects: [
    { title: "Havenix — Architecture Studio Website", desc: "Frontend web project featuring a live website and modern interactive web experience." },
    { title: "Photoshop Artworks & Compositing", desc: "Digital image retouching, photo compositing, poster artwork, creative visual storytelling, and image manipulation." },
    { title: "AI Asset Collection & Generative Art", desc: "AI-generated visuals, 3D conceptual assets, sci-fi renders, and custom generative artwork for digital media." },
    { title: "YouTube Thumbnails & Content Branding", desc: "High-CTR gaming and tech thumbnails, content branding, and visual hooks designed for strong click-through potential." }
  ],
  education: {
    degree: "Bachelor of Technology (B.Tech) in Computer Science Engineering",
    college: "Indo Global College of Engineering",
    graduated: "July 2025",
    cgpa: "7.0 / 10.0"
  },
  strengths: ["Creative Problem Solving", "Visual Storytelling", "Attention to Detail", "Client Collaboration", "Adaptability"],
  languages: ["English (Professional Working)", "Hindi (Native Speaker)"]
};

const teamModal = document.getElementById('teamModal');
const teamModalOverlay = document.getElementById('teamModalOverlay');
const teamModalClose = document.getElementById('teamModalClose');
const teamModalContent = document.getElementById('teamModalContent');
const sanchitBioBtn = document.getElementById('sanchitBioBtn');

function openSanchitModal() {
  const data = sanchitProfileData;

  const skillsDesignHtml = data.skillsDesign.map(s => `<span class="modal-chip modal-chip-design">${s}</span>`).join('');
  const skillsTechHtml = data.skillsTech.map(s => `<span class="modal-chip">${s}</span>`).join('');
  
  const projectsHtml = data.projects.map(p => `
    <div class="modal-project-item">
      <h6>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        ${p.title}
      </h6>
      <p>${p.desc}</p>
    </div>
  `).join('');

  const strengthsHtml = data.strengths.map(s => `
    <span class="modal-chip modal-chip-strength">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ${s}
    </span>
  `).join('');

  const languagesHtml = data.languages.join(' • ');

  teamModalContent.innerHTML = `
    <div class="modal-header-box">
      <div class="modal-avatar-frame">
        <img src="${data.avatarUrl}" alt="${data.name}" class="modal-avatar-img" />
      </div>
      <div class="modal-header-info">
        <span class="modal-role-badge">${data.role}</span>
        <h2>${data.name}</h2>
        <div class="modal-contact-row">
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${data.location}
          </span>
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <a href="tel:${data.phone.replace(/[^0-9+]/g,'')}">${data.phone}</a>
          </span>
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><polyline points="2,4 12,13 22,4"></polyline></svg>
            <a href="mailto:${data.email}">${data.email}</a>
          </span>
        </div>
      </div>
    </div>

    <!-- Live Official Web Portfolio Showcase Banner -->
    <div class="modal-drive-banner">
      <div class="drive-banner-info">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span><strong>Live Web &amp; Design Portfolio:</strong> Explore Interactive Web Projects, AI Visuals &amp; Artworks</span>
      </div>
      <a href="${data.portfolioWebUrl}" target="_blank" rel="noopener" class="btn-drive-link">
        <span>Visit Web Portfolio</span>
      </a>
    </div>

    <div class="modal-section-body">
      <div>
        <div class="modal-block-title">Professional Summary</div>
        <p class="modal-summary-text">${data.summary}</p>
      </div>

      <div class="modal-skills-box">
        <div class="modal-block-title">Technical &amp; Design Skills</div>
        <div class="modal-skills-group">
          <h5>GRAPHIC DESIGN &amp; CREATIVE TOOLS</h5>
          <div class="modal-chips-wrap">${skillsDesignHtml}</div>
        </div>
        <div class="modal-skills-group">
          <h5>TECHNICAL &amp; CORE COMPETENCIES</h5>
          <div class="modal-chips-wrap">${skillsTechHtml}</div>
        </div>
      </div>

      <div>
        <div class="modal-block-title">Key Projects &amp; Creative Portfolio</div>
        ${projectsHtml}
      </div>

      <div>
        <div class="modal-block-title">Education</div>
        <div class="modal-edu-card">
          <div class="modal-edu-info">
            <h6>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              ${data.education.degree}
            </h6>
            <span>${data.education.college} • Graduated: ${data.education.graduated}</span>
          </div>
          <span class="modal-edu-badge">CGPA: ${data.education.cgpa}</span>
        </div>
      </div>

      <div>
        <div class="modal-block-title">Strengths &amp; Languages</div>
        <div class="modal-chips-wrap" style="margin-bottom:0.8rem;">${strengthsHtml}</div>
        <div class="modal-languages-row">
          <strong>Languages:</strong> ${languagesHtml}
        </div>
      </div>
    </div>
  `;

  if (teamModal) {
    teamModal.classList.add('active');
    teamModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window._lenis) window._lenis.stop();
  }
}

function closeTeamModal() {
  if (teamModal) {
    teamModal.classList.remove('active');
    teamModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window._lenis) window._lenis.start();
  }
}

if (sanchitBioBtn) {
  sanchitBioBtn.addEventListener('click', openSanchitModal);
}

/* ==========================================================================
   MEET PAVAGADHI BIO POP-UP MODAL (WEB DEVELOPER & ANIMATOR • FOUNDER)
   ========================================================================== */
const meetProfileData = {
  name: "MEET PAVAGADHI",
  role: "WEB DEVELOPER AND ANIMATOR • FOUNDER",
  location: "Gujarat, India",
  phone: "+91 9824999054",
  email: "haneypavagadhi1234@gmail.com",
  resumePdfUrl: "assets/resumes/meet-pavagadhi-resume.pdf",
  avatarUrl: "images/meet-pavagadhi.jpg",
  summary: "Hi, I'm Meet — a developer and designer specializing in 3D animation, game development, web design, and graphic design. With expertise in Blender, Maya, and Adobe Creative Suite, I create engaging visuals, interactive experiences, and high-performance digital products. Passionate about turning ideas into impactful results through creativity, technical precision, and attention to detail.",
  skillsDesign: ["Web Design", "Design Thinking", "Wireframe Creation", "3D Animation (Blender, Maya, 3ds Max, Cinema 4D)", "Graphic Design (Photoshop, Illustrator)", "Video Editing (Premiere Pro, After Effects)"],
  skillsTech: ["Front End Coding (HTML, CSS, JS)", "React & Angular", "Unity & Unreal Engine", "API Integration & WebSockets", "Responsive UX/UI Architecture"],
  experience: [
    { title: "3D Animation Specialist", subtitle: "Freelancer • 2021 - Present", desc: "Created high-quality 3D animations for games, films, and advertisements. Skilled in Maya, Blender, 3ds Max, Cinema 4D, character modeling, rigging, and Unity/Unreal integration." },
    { title: "Web Developer", subtitle: "Freelancer • 2022 - Present", desc: "Designed & developed responsive web platforms using HTML, CSS, JavaScript, React, and Angular for clients including FETC, Parikshaa, Zclick Media, and Gym Systems." },
    { title: "Graphic Design & Video Editing", subtitle: "Z click Media & Freelance • 2021 - 2026", desc: "Crafted marketing materials, social posts, banners, and video edits using Photoshop, Illustrator, Premiere Pro, and After Effects." }
  ],
  education: [
    { degree: "B.Sc. Information & Technology", institution: "Veer Narmad South Gujarat University", years: "2019 - 2022" },
    { degree: "3D Animation Specialization", institution: "Sanju Design Factory", years: "2021 - 2022" },
    { degree: "Game Development Engineering", institution: "Online Platform", years: "2020 - 2022" }
  ],
  strengths: ["Creative & Technical Synergy", "3D Asset Optimization", "Full-Stack Web Engineering", "Problem Solving"],
  languages: ["English (Professional)", "Gujarati (Native)", "Hindi (Fluent)"]
};

const meetBioBtn = document.getElementById('meetBioBtn');

function openMeetModal() {
  const data = meetProfileData;

  const skillsDesignHtml = data.skillsDesign.map(s => `<span class="modal-chip modal-chip-design">${s}</span>`).join('');
  const skillsTechHtml = data.skillsTech.map(s => `<span class="modal-chip">${s}</span>`).join('');
  
  const expHtml = data.experience.map(e => `
    <div class="modal-project-item">
      <h6>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        ${e.title}
        <span style="font-size:0.75rem; font-weight:600; color:#38bdf8; margin-left:auto;">${e.subtitle}</span>
      </h6>
      <p>${e.desc}</p>
    </div>
  `).join('');

  const eduHtml = data.education.map(ed => `
    <div class="modal-edu-card" style="margin-bottom:0.6rem;">
      <div class="modal-edu-info">
        <h6>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          ${ed.degree}
        </h6>
        <span>${ed.institution}</span>
      </div>
      <span class="modal-edu-badge">${ed.years}</span>
    </div>
  `).join('');

  const strengthsHtml = data.strengths.map(s => `
    <span class="modal-chip modal-chip-strength">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ${s}
    </span>
  `).join('');

  const languagesHtml = data.languages.join(' • ');

  teamModalContent.innerHTML = `
    <div class="modal-header-box">
      <div class="modal-avatar-frame">
        <img src="${data.avatarUrl}" alt="${data.name}" class="modal-avatar-img" />
      </div>
      <div class="modal-header-info">
        <span class="modal-role-badge">${data.role}</span>
        <h2>${data.name}</h2>
        <div class="modal-contact-row">
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${data.location}
          </span>
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <a href="tel:${data.phone.replace(/[^0-9+]/g,'')}">${data.phone}</a>
          </span>
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><polyline points="2,4 12,13 22,4"></polyline></svg>
            <a href="mailto:${data.email}">${data.email}</a>
          </span>
        </div>
      </div>
    </div>

    <!-- Official PDF Resume Download Banner -->
    <div class="modal-drive-banner">
      <div class="drive-banner-info">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <polyline points="9 15 12 18 15 15"></polyline>
        </svg>
        <span><strong>Official Resume Document:</strong> Download Meet Pavagadhi's complete PDF CV</span>
      </div>
      <a href="${data.resumePdfUrl}" target="_blank" download class="btn-drive-link">
        <span>Download PDF Resume</span>
      </a>
    </div>

    <div class="modal-section-body">
      <div>
        <div class="modal-block-title">Profile &amp; Executive Summary</div>
        <p class="modal-summary-text">${data.summary}</p>
      </div>

      <div class="modal-skills-box">
        <div class="modal-block-title">Core Skills &amp; Technical Capabilities</div>
        <div class="modal-skills-group">
          <h5>WEB &amp; GAME DEVELOPMENT</h5>
          <div class="modal-chips-wrap">${skillsTechHtml}</div>
        </div>
        <div class="modal-skills-group">
          <h5>3D ANIMATION &amp; CREATIVE DESIGN</h5>
          <div class="modal-chips-wrap">${skillsDesignHtml}</div>
        </div>
      </div>

      <div>
        <div class="modal-block-title">Professional Experience</div>
        ${expHtml}
      </div>

      <div>
        <div class="modal-block-title">Education &amp; Specialization</div>
        ${eduHtml}
      </div>

      <div>
        <div class="modal-block-title">Strengths &amp; Languages</div>
        <div class="modal-chips-wrap" style="margin-bottom:0.8rem;">${strengthsHtml}</div>
        <div class="modal-languages-row">
          <strong>Languages:</strong> ${languagesHtml}
        </div>
      </div>
    </div>
  `;

  if (teamModal) {
    teamModal.classList.add('active');
    teamModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window._lenis) window._lenis.stop();
  }
}

if (sanchitBioBtn) {
  sanchitBioBtn.addEventListener('click', openSanchitModal);
}

if (meetBioBtn) {
  meetBioBtn.addEventListener('click', openMeetModal);
}


if (teamModalOverlay) teamModalOverlay.addEventListener('click', closeTeamModal);
if (teamModalClose) teamModalClose.addEventListener('click', closeTeamModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && teamModal && teamModal.classList.contains('active')) {
    closeTeamModal();
  }
});

/* ==========================================================================
   INTERACTIVE CUSTOM GLOWING MAGNETIC CURSOR (DESKTOP ONLY)
   ========================================================================== */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (cursorDot && cursorRing) {
  if (!isTouchDevice && window.matchMedia('(hover: hover)').matches) {
    let mouseX = -100, mouseY = -100;
    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function renderCursor() {
      dotX += (mouseX - dotX) * 0.5;
      dotY += (mouseY - dotY) * 0.5;
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    const hoverables = document.querySelectorAll('a, button, input, textarea, select, label, .portfolio-card, .service-card, .process-card, .est-option-btn');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hovering');
        cursorRing.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hovering');
        cursorRing.classList.remove('hovering');
      });
    });

    window.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      ripple.style.position = 'fixed';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.style.width = '10px';
      ripple.style.height = '10px';
      ripple.style.borderRadius = '50%';
      ripple.style.border = '2px solid #38bdf8';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '9999';
      ripple.style.transform = 'translate(-50%, -50%) scale(1)';
      ripple.style.transition = 'transform 0.5s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.5s ease';
      document.body.appendChild(ripple);

      setTimeout(() => {
        ripple.style.transform = 'translate(-50%, -50%) scale(5)';
        ripple.style.opacity = '0';
      }, 10);

      setTimeout(() => ripple.remove(), 550);
    });
  } else {
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }
}


/* ==========================================================================
   3D CARD HOVER PERSPECTIVE TILT (DESKTOP ONLY)
   ========================================================================== */
if (!isTouchDevice) {
  const tiltCards = document.querySelectorAll('.portfolio-card, .service-card, .process-card-front, .stat-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ==========================================================================
   PORTFOLIO CASE STUDY POP-UP MODAL LOGIC
   ========================================================================== */
const caseModal = document.getElementById('caseModal');
const caseModalOverlay = document.getElementById('caseModalOverlay');
const caseModalClose = document.getElementById('caseModalClose');
const caseModalContent = document.getElementById('caseModalContent');

const caseStudiesData = {
  'VERDORA Botanical Living': {
    category: 'E-Commerce & Botanical Living',
    title: 'VERDORA — Premium Botanical Living Experience',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    description: 'An editorial, nature-inspired e-commerce storefront crafted for rare botanical specimens, indoor/outdoor greenery, and architectural plant styling. Engineered with sub-second page transitions, dynamic inventory filtering, and an organic visual design system.',
    metric: '🌿 100/100 Core Web Vitals & Sub-Second Page Response',
    tech: ['React', 'Tailwind CSS', 'Vite', 'HTML5', 'Modern CSS Grid'],
    liveUrl: 'https://sanchitsharma217-arch.github.io/verdora/',
    repoUrl: 'https://github.com/sanchitsharma217-arch/verdora'
  },
  'HAVENIX Architecture Studio': {
    category: 'Architecture & Spatial Design',
    title: 'HAVENIX — International Architecture Studio',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    description: 'An international architecture portfolio showcasing monolithic residential and civic structures. Features editorial typography, high-contrast imagery, smooth transitions, and a clean minimalist layout communicating spatial rigor.',
    metric: '🏛️ Monolithic Editorial UX with 60fps Smooth Transitions',
    tech: ['HTML5', 'Modern CSS', 'JavaScript', 'Responsive Grid'],
    liveUrl: 'https://sanchitsharma217-arch.github.io/Havenix/',
    repoUrl: 'https://github.com/sanchitsharma217-arch/Havenix'
  },
  'AuraVoyage Luxury Travel': {
    category: 'Hospitality & Luxury Travel',
    title: 'AuraVoyage — Luxury Tours & Fine Dining Booking',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
    description: 'A bespoke luxury hospitality and travel portal offering curated world tours, 5-star resort reservations, reserved fine dining, and gourmet travel refreshment hampers with an intuitive interactive booking flow.',
    metric: '✈️ Interactive Itinerary Planning & Sub-Second Booking Flows',
    tech: ['React', 'Vite', 'JavaScript', 'Tailwind CSS', 'Interactive UI'],
    liveUrl: 'https://sanchitsharma217-arch.github.io/AuraVoyage/',
    repoUrl: 'https://github.com/sanchitsharma217-arch/AuraVoyage'
  },
  'PayPulse Global': {
    category: 'Fintech & Payments',
    title: 'PayPulse Global Enterprise Gateway',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
    description: 'PayPulse is a next-generation multi-currency payment platform engineered for cross-border SaaS companies. We architected a microservices backend capable of handling 50k+ transactions per minute with sub-50ms gateway latency.',
    metric: '⚡ 4.2x Faster Checkout Velocity & 99.99% Gateway Uptime',
    tech: ['React', 'TypeScript', 'Node.js', 'Express', 'Redis', 'PostgreSQL', 'Stripe API']
  },
  'NEXUS FLOW PRO Algo System': {
    category: 'Fintech & Quantitative Trading',
    title: 'NEXUS FLOW PRO — Algorithmic Execution System',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
    description: 'An institutional-grade algorithmic execution engine engineered in Pine Script v6. Eliminates common market traps through multi-timeframe trend alignment (200 EMA Macro filter + HTF confirmation), mathematical anti-chop detection (ADX, Choppiness Index, Market Efficiency Ratio), persistent dynamic S/R barriers, and zero-delay automated JSON webhooks for bot execution.',
    metric: '🛡️ Anti-Chop Guard, Dynamic S/R Barriers & Real-Time JSON Webhooks',
    tech: ['Pine Script v6', 'TradingView Engine', 'JSON Webhooks', 'Risk & Break-Even Engine', 'Quant Logic']
  },
  'CloudMint SaaS Portal': {
    category: 'SaaS Platform',
    title: 'CloudMint Subscription Management Portal',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    description: 'Complete user account, onboarding flow, and automated invoice management solution serving over 10,000 active SaaS subscribers.',
    metric: '🚀 10,000+ Active Users & Automated Stripe Webhooks',
    tech: ['Next.js', 'Node.js', 'SQLite', 'Tailwind', 'REST API']
  },
  'Branding, 3D Ads & UI Design Systems': {
    category: 'Branding & Design Systems',
    title: 'Branding, 3D Ads & UI Design Systems',
    image: 'images/wanderly-travel-ui-system.jpg',
    gallery: [
      { src: 'images/sneaker-commercial-ad.jpg', title: 'FAST & WILD — Sneaker 3D Typography Commercial Ad (Photoshop)' },
      { src: 'images/wanderly-travel-ui-system.jpg', title: 'WANDERLY — Travel & Adventure Platform Brand & Editorial UI (Figma)' },
      { src: 'images/allo-jute-bag-infographic.jpg', title: 'Allo Kitchenware — Eco Jute Bag Feature Infographic (Amazon A+)' },
      { src: 'images/aurora-drive-brand-system.jpg', title: 'AURORA DRIVE — Luxury Automotive Brand Identity & Fleet UI (Figma)' }
    ],
    description: 'An expansive creative showcase combining high-energy 3D commercial advertising, Amazon A+ e-commerce marketing infographics, and full-scale Figma web design systems engineered with comprehensive typography scales, color tokens, and responsive UI components.',
    metric: '🎨 Dual-Discipline: High-Impact 3D Product Ads + Scalable Figma Design Systems',
    tech: ['Adobe Photoshop', 'Figma', '3D Typography', 'Amazon A+ Layouts', 'Brand Guidelines', 'Design Tokens']
  },
  'Commercial Product Ads & D2C Creatives': {
    category: 'Commercial Art & D2C Graphics',
    title: 'Commercial 3D Product Campaigns & Marketplace Infographics',
    image: 'images/sneaker-commercial-ad.jpg',
    gallery: [
      { src: 'images/sneaker-commercial-ad.jpg', title: 'FAST & WILD — Sneaker 3D Kinetic Typography Action Ad' },
      { src: 'images/allo-jute-bag-infographic.jpg', title: 'Allo Kitchenware — Eco Jute Bag Feature Callouts (Amazon A+)' }
    ],
    description: 'Commercial art direction tailored for high-conversion retail advertising. Features kinetic 3D typography for athletic footwear ("FAST & WILD") with explosive spatial composition, alongside a clean Amazon A+ marketplace infographic for Allo Kitchenware highlighting bottle holders, insulated lining, and organic jute textures.',
    metric: '🚀 High-Impact Visual Hierarchy & E-Commerce Conversion Optimization',
    tech: ['Adobe Photoshop', '3D Typography', 'Photo Manipulation', 'Amazon A+ Content', 'Product Retouching', 'Visual Hierarchy']
  },
  'AURORA & WANDERLY — Brand Systems & Web UI': {
    category: 'Web Graphic Design & Brand Systems',
    title: 'AURORA DRIVE & WANDERLY — Comprehensive Brand & UI Systems',
    image: 'images/aurora-drive-brand-system.jpg',
    gallery: [
      { src: 'images/aurora-drive-brand-system.jpg', title: 'AURORA DRIVE — Luxury Car Rental Brand Identity & Desktop/Mobile UI' },
      { src: 'images/wanderly-travel-ui-system.jpg', title: 'WANDERLY — Travel & Adventure Platform Brand Identity & Editorial UI' }
    ],
    description: 'Two flagship Figma design systems crafted with bespoke brand identities. AURORA DRIVE establishes a luxury automotive aesthetic with champagne gold palettes, Playfair typography, fleet cards, and mobile booking flows. WANDERLY crafts a human, vibrant travel discovery experience with ocean teal accents, torn paper textures, compass motifs, and modular travel itinerary components.',
    metric: '💎 Complete Multi-Device UI Kits, Design Tokens & Brand Style Guides',
    tech: ['Figma', 'UI/UX Design', 'Design Systems', 'Typography Hierarchies', 'Color Token Systems', 'Mobile Prototyping']
  },
  'Apex Vision Brand Identity': {
    category: 'Branding & Design System',
    title: 'Apex Vision Vector Brand System',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=900&q=80',
    description: 'Comprehensive visual branding package including scalable vector icon sets, dark/light design system guidelines, typography scales, and promotional media kit.',
    metric: '🎨 Complete Design System Token Guidelines',
    tech: ['Figma', 'Illustrator', 'Design Tokens', 'CSS Variables']
  },
  'Veloce Fintech Portal': {
    category: 'Fintech & Trading',
    title: 'Veloce High-Frequency Trading Interface',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80',
    description: 'High-speed web dashboard for financial traders featuring real-time candle charts, order book feeds, and sub-millisecond websocket updates.',
    metric: '📈 99.99% Live Service Uptime',
    tech: ['React', 'TypeScript', 'WebSockets', 'Canvas API']
  }
};

function openCaseStudy(title) {
  const data = caseStudiesData[title] || {
    category: 'Featured Work',
    title: title,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    description: 'A custom high-performance web development project built by Nexveda Technologies.',
    metric: '⭐ 100/100 Core Web Vitals & Premium Glass UI',
    tech: ['React', 'Node.js', 'HTML5', 'CSS3']
  };

  const techChips = data.tech.map((t) => `<span class="modal-chip modal-chip-design">${t}</span>`).join(' ');

  let mediaHtml = '';
  if (data.gallery && data.gallery.length > 0) {
    mediaHtml = `
      <div class="case-media-gallery">
        <div class="gallery-main-view">
          <img id="galleryMainImg" src="${data.gallery[0].src}" alt="${data.gallery[0].title}" />
          <div class="gallery-caption" id="galleryCaption">${data.gallery[0].title}</div>
        </div>
        ${data.gallery.length > 1 ? `
          <div class="gallery-thumbnails">
            ${data.gallery.map((item, idx) => `
              <button type="button" class="gallery-thumb-btn ${idx === 0 ? 'active' : ''}" data-src="${item.src}" data-caption="${item.title}" title="${item.title}">
                <img src="${item.src}" alt="${item.title}" />
                <span class="thumb-index">#${idx + 1}</span>
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  } else {
    mediaHtml = `
      <div class="case-media">
        <img src="${data.image}" alt="${data.title}" />
      </div>
    `;
  }

  if (caseModalContent) {
    caseModalContent.innerHTML = `
      <div class="case-modal-inner">
        <span class="summary-badge">${data.category}</span>
        <h2>${data.title}</h2>
        <div class="case-modal-grid">
          ${mediaHtml}
          <div class="case-details">
            <p>${data.description}</p>
            <div class="case-meta">
              <div class="meta-block">
                <strong>Impact &amp; Key Metric:</strong>
                <span>${data.metric}</span>
              </div>
              <div class="meta-block">
                <strong>Technologies Used:</strong>
                <div class="tech-chips-row">${techChips}</div>
              </div>
            </div>
            <div class="case-actions" style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap; margin-top: 1.5rem;">
              ${data.liveUrl ? `
                <a href="${data.liveUrl}" target="_blank" rel="noopener" class="btn btn-secondary-pill" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399;">
                  <span>Launch Live Demo ↗</span>
                </a>
              ` : ''}
              ${data.repoUrl ? `
                <a href="${data.repoUrl}" target="_blank" rel="noopener" class="btn btn-secondary-pill" style="border-color: rgba(56, 189, 248, 0.3);">
                  <span>GitHub Repo ↗</span>
                </a>
              ` : ''}
              <a href="#contact" class="btn btn-primary-pill" onclick="closeCaseModal()">
                <span>Inquire About Similar Build</span>
                <svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind gallery thumbnail switching
    caseModalContent.querySelectorAll('.gallery-thumb-btn').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        caseModalContent.querySelectorAll('.gallery-thumb-btn').forEach((b) => b.classList.remove('active'));
        thumb.classList.add('active');
        const mainImg = caseModalContent.querySelector('#galleryMainImg');
        const caption = caseModalContent.querySelector('#galleryCaption');
        if (mainImg) {
          mainImg.style.opacity = '0.3';
          mainImg.src = thumb.dataset.src;
          mainImg.onload = () => { mainImg.style.opacity = '1'; };
        }
        if (caption) {
          caption.textContent = thumb.dataset.caption;
        }
      });
    });
  }

  if (caseModal) {
    caseModal.classList.add('active');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window._lenis) window._lenis.stop();
  }
}

function closeCaseModal() {
  if (caseModal) {
    caseModal.classList.remove('active');
    caseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window._lenis) window._lenis.start();
  }
}

// Bind case study links
document.querySelectorAll('.portfolio-card .btn-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const cardTitle = link.closest('.portfolio-card')?.querySelector('h3')?.textContent?.trim();
    if (cardTitle) {
      openCaseStudy(cardTitle);
    }
  });
});

// Also allow clicking directly on the image holder to open case study
document.querySelectorAll('.portfolio-card .portfolio-img-holder').forEach((holder) => {
  holder.style.cursor = 'pointer';
  holder.addEventListener('click', (e) => {
    if (e.target.closest('.design-filter-trigger')) return;
    const cardTitle = holder.closest('.portfolio-card')?.querySelector('h3')?.textContent?.trim();
    if (cardTitle) {
      openCaseStudy(cardTitle);
    }
  });
});

if (caseModalOverlay) caseModalOverlay.addEventListener('click', closeCaseModal);
if (caseModalClose) caseModalClose.addEventListener('click', closeCaseModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && caseModal && caseModal.classList.contains('active')) {
    closeCaseModal();
  }
});

/* ==========================================================================
   INTERACTIVE GLOBAL CONSTELLATION MESH CANVAS BACKGROUND
   ========================================================================== */
const globalCanvas = document.getElementById('globalCanvas');
if (globalCanvas) {
  const gCtx = globalCanvas.getContext('2d');
  let gWidth = 0, gHeight = 0;
  let gMouseX = -1000, gMouseY = -1000;

  function resizeGlobalCanvas() {
    gWidth = globalCanvas.width = window.innerWidth;
    gHeight = globalCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeGlobalCanvas, { passive: true });
  resizeGlobalCanvas();

  window.addEventListener('mousemove', (e) => {
    gMouseX = e.clientX;
    gMouseY = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    gMouseX = -1000;
    gMouseY = -1000;
  });

  // Create Constellation Nodes scaled for mobile vs desktop
  const isMobileScreen = window.innerWidth < 768;
  const nodeCount = isMobileScreen 
    ? 22 
    : Math.min(Math.floor((window.innerWidth * window.innerHeight) / 18000), 75);
  const nodes = [];

  const blueShades = [
    'rgba(56, 189, 248, ',  // Cyan Accent
    'rgba(37, 99, 235, ',   // Electric Blue
    'rgba(96, 165, 250, ',  // Sky Blue
    'rgba(0, 242, 254, '    // Neon Aqua
  ];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * (gWidth || window.innerWidth),
      y: Math.random() * (gHeight || window.innerHeight),
      vx: (Math.random() - 0.5) * (isMobileScreen ? 0.4 : 0.7),
      vy: (Math.random() - 0.5) * (isMobileScreen ? 0.4 : 0.7),
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.45 + 0.2,
      color: blueShades[Math.floor(Math.random() * blueShades.length)]
    });
  }

  const connectDist = isMobileScreen ? 85 : 140;
  const mouseRadius = 200;
  let gAnimId = null;

  function animateGlobalConstellation() {
    if (document.hidden) {
      gAnimId = null;
      return;
    }

    gCtx.clearRect(0, 0, gWidth, gHeight);

    const isLight = document.body.classList.contains('light-theme');
    const alphaMultiplier = isLight ? 0.35 : 1;

    // Update & Draw Nodes
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];

      // Update position
      n1.x += n1.vx;
      n1.y += n1.vy;

      // Bounce off screen boundaries
      if (n1.x < 0 || n1.x > gWidth) n1.vx *= -1;
      if (n1.y < 0 || n1.y > gHeight) n1.vy *= -1;

      // Mouse attraction physics
      const dxMouse = gMouseX - n1.x;
      const dyMouse = gMouseY - n1.y;
      const distMouse = Math.hypot(dxMouse, dyMouse);

      if (distMouse < mouseRadius) {
        const pull = (1 - distMouse / mouseRadius) * 0.035;
        n1.x += dxMouse * pull;
        n1.y += dyMouse * pull;

        // Draw glowing laser line tether to mouse cursor
        const laserAlpha = (1 - distMouse / mouseRadius) * 0.6 * alphaMultiplier;
        gCtx.beginPath();
        gCtx.moveTo(n1.x, n1.y);
        gCtx.lineTo(gMouseX, gMouseY);
        gCtx.strokeStyle = `rgba(0, 242, 254, ${laserAlpha})`;
        gCtx.lineWidth = 1.2;
        gCtx.stroke();
      }

      // Draw node dot
      gCtx.beginPath();
      gCtx.arc(n1.x, n1.y, n1.radius * (distMouse < mouseRadius ? 1.5 : 1), 0, Math.PI * 2);
      gCtx.fillStyle = n1.color + (n1.baseAlpha * alphaMultiplier) + ')';
      gCtx.fill();

      // Connect Node Pairs
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectDist) {
          const lineAlpha = (1 - dist / connectDist) * 0.28 * alphaMultiplier;
          gCtx.beginPath();
          gCtx.moveTo(n1.x, n1.y);
          gCtx.lineTo(n2.x, n2.y);
          gCtx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          gCtx.lineWidth = 0.8;
          gCtx.stroke();
        }
      }
    }

    gAnimId = requestAnimationFrame(animateGlobalConstellation);
  }

  gAnimId = requestAnimationFrame(animateGlobalConstellation);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !gAnimId) {
      gAnimId = requestAnimationFrame(animateGlobalConstellation);
    }
  });
}

/* ==========================================================================
   THREE.JS DENSE PREMIUM 3D SCENE — REFERENCE-MATCHED (PERFORMANCE-OPTIMIZED)
   Packed wireframes, glass code cubes, floating symbols, node connections
   ========================================================================== */
const bg3dCanvas = document.getElementById('bg3dCanvas');
if (bg3dCanvas && window.THREE) {
  const isMobile3D = window.innerWidth < 768 || isTouchDevice;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 32;

  const renderer = new THREE.WebGLRenderer({ 
    canvas: bg3dCanvas, 
    alpha: true, 
    antialias: !isMobile3D,
    powerPreference: isMobile3D ? 'low-power' : 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(isMobile3D ? 1 : Math.min(window.devicePixelRatio, 1.75));

  // ── STUDIO 3-POINT LIGHTING FOR CHROME & CRYSTAL (Matching Reference) ──
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  // Pure White Key Light for gleaming reflections on chrome and crystal facets
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
  dirLight1.position.set(28, 32, 24);
  scene.add(dirLight1);

  // Cool Platinum Fill Light
  const dirLight2 = new THREE.DirectionalLight(0xd1d5db, 1.4);
  dirLight2.position.set(-22, -18, 12);
  scene.add(dirLight2);

  // Subtle Chromatic Prismatic Backlight
  const dirLight3 = new THREE.DirectionalLight(0x818cf8, 1.1);
  dirLight3.position.set(10, -20, -15);
  scene.add(dirLight3);

  // Interactive Cursor Light (pure white specular gleam glides over facets)
  const mouseCrystalLight = new THREE.PointLight(0xffffff, 2.8, 55);
  mouseCrystalLight.position.set(14.8, 3.2, 16);
  scene.add(mouseCrystalLight);

  // ── OPTICAL REFRACTIVE CRYSTAL SHADER WITH CHROMATIC DISPERSION (Exact Reference Match) ──
  const crystalVS = `
    varying vec3 vNormal;
    varying vec3 vViewPos;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vViewPos = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;

  const crystalFS = `
    varying vec3 vNormal;
    varying vec3 vViewPos;
    uniform float opacity;

    void main() {
      vec3 n = normalize(vNormal);
      vec3 v = normalize(vViewPos);
      float fresnel = clamp(1.0 - abs(dot(v, n)), 0.0, 1.0);
      float fTerm = pow(fresnel, 2.2);
      
      // Prismatic Rainbow Dispersion (Red, Green, Blue Chromatic Aberration Split on facets)
      float r = pow(clamp(1.0 - abs(dot(v, n + vec3(0.07, -0.02, 0.0))), 0.0, 1.0), 2.1);
      float g = pow(clamp(1.0 - abs(dot(v, n + vec3(-0.02, 0.05, 0.0))), 0.0, 1.0), 1.9);
      float b = pow(clamp(1.0 - abs(dot(v, n + vec3(-0.05, -0.03, 0.06))), 0.0, 1.0), 2.3);
      vec3 rainbow = vec3(r, g, b);

      // Studio physical specular highlights (razor-sharp diamond sheen)
      vec3 lightDir1 = normalize(vec3(0.65, 0.85, 0.75));
      vec3 halfVec1 = normalize(lightDir1 + v);
      float spec1 = pow(max(dot(n, halfVec1), 0.0), 54.0);

      vec3 lightDir2 = normalize(vec3(-0.55, -0.45, 0.65));
      vec3 halfVec2 = normalize(lightDir2 + v);
      float spec2 = pow(max(dot(n, halfVec2), 0.0), 36.0);

      // Deep glass clarity (diamond body with rainbow dispersion rims)
      vec3 baseGlass = mix(vec3(0.04, 0.06, 0.09), vec3(0.88, 0.92, 0.98), fTerm * 0.45);
      vec3 finalCol = mix(baseGlass, rainbow * 1.6, fTerm * 0.72);
      finalCol += vec3(1.0, 1.0, 1.0) * spec1 * 0.95;
      finalCol += vec3(0.85, 0.92, 1.0) * spec2 * 0.50;

      gl_FragColor = vec4(finalCol, clamp(opacity + fTerm * 0.65, 0.0, 0.96));
    }
  `;

  const matCrystalGlass = new THREE.ShaderMaterial({
    vertexShader: crystalVS,
    fragmentShader: crystalFS,
    uniforms: {
      opacity: { value: 0.32 }
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  // Razor-sharp silver facet outline wireframe
  const matCrystalWire = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });

  // ── UNIFIED 3D HERO CLUSTER & AMBIENT GROUPS ──
  const heroCluster = new THREE.Group();
  scene.add(heroCluster);

  const ambientGroup = new THREE.Group();
  scene.add(ambientGroup);

  // Helper to create glowing glass sculpture with silver contour
  function createGlassMeshWithGlow(geometry, glassShaderMat = matCrystalGlass, wireMat = matCrystalWire) {
    const group = new THREE.Group();
    const bodyMesh = new THREE.Mesh(geometry, glassShaderMat);
    group.add(bodyMesh);

    if (wireMat) {
      const wireMesh = new THREE.Mesh(geometry.clone(), wireMat);
      wireMesh.scale.setScalar(1.004);
      group.add(wireMesh);
    }
    return group;
  }

  // ══════════════════════════════════════════════════════════════
  // HERO CENTERPIECE: FACETED REFRACTIVE DIAMOND POLYHEDRON (Top Right)
  // ══════════════════════════════════════════════════════════════
  const diamondGroup = new THREE.Group();

  // Outer Diamond Polyhedron (Faceted cut crystal)
  const outerDiamondGeo = new THREE.IcosahedronGeometry(6.2, 0);
  const outerDiamondMesh = new THREE.Mesh(outerDiamondGeo, matCrystalGlass);
  diamondGroup.add(outerDiamondMesh);

  const outerDiamondWire = new THREE.Mesh(outerDiamondGeo.clone(), matCrystalWire);
  outerDiamondWire.scale.setScalar(1.004);
  diamondGroup.add(outerDiamondWire);

  // Inner Nested Polyhedron (Visible through transparent crystal facets)
  const innerDiamondGeo = new THREE.IcosahedronGeometry(3.1, 0);
  const innerDiamondMat = new THREE.MeshPhongMaterial({
    color: 0x94a3b8,
    emissive: 0x1e293b,
    specular: 0xffffff,
    shininess: 180,
    transparent: true,
    opacity: 0.48
  });
  const innerDiamondMesh = new THREE.Mesh(innerDiamondGeo, innerDiamondMat);
  const innerDiamondWire = new THREE.Mesh(innerDiamondGeo.clone(), new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.75
  }));
  innerDiamondWire.scale.setScalar(1.01);
  const innerDiamondGroup = new THREE.Group();
  innerDiamondGroup.add(innerDiamondMesh);
  innerDiamondGroup.add(innerDiamondWire);
  diamondGroup.add(innerDiamondGroup);

  diamondGroup.position.set(14.8, 3.2, 0);
  diamondGroup.rotation.set(0.35, 0.55, 0.2);
  heroCluster.add(diamondGroup);

  // ══════════════════════════════════════════════════════════════
  // POLISHED CHROME OPEN FRAME CUBES (Architectural & Geometric)
  // ══════════════════════════════════════════════════════════════
  const matChrome = new THREE.MeshPhongMaterial({
    color: 0xd1d5db,
    emissive: 0x111827,
    specular: 0xffffff,
    shininess: 240
  });

  function createChromeCubeFrame(size = 3.6, thickness = 0.18) {
    const group = new THREE.Group();
    const half = size / 2;
    const cornerGeo = new THREE.BoxGeometry(thickness * 1.05, thickness * 1.05, thickness * 1.05);

    // 4 edges along Z
    const zGeo = new THREE.BoxGeometry(thickness, thickness, size);
    [[-half, -half, 0], [half, -half, 0], [-half, half, 0], [half, half, 0]].forEach(p => {
      const m = new THREE.Mesh(zGeo, matChrome);
      m.position.set(...p);
      group.add(m);
    });

    // 4 edges along X
    const xGeo = new THREE.BoxGeometry(size, thickness, thickness);
    [[0, -half, -half], [0, half, -half], [0, -half, half], [0, half, half]].forEach(p => {
      const m = new THREE.Mesh(xGeo, matChrome);
      m.position.set(...p);
      group.add(m);
    });

    // 4 edges along Y
    const yGeo = new THREE.BoxGeometry(thickness, size, thickness);
    [[-half, 0, -half], [half, 0, -half], [-half, 0, half], [half, 0, half]].forEach(p => {
      const m = new THREE.Mesh(yGeo, matChrome);
      m.position.set(...p);
      group.add(m);
    });

    // 8 Corner joints
    [
      [-half, -half, -half], [half, -half, -half],
      [-half, half, -half],  [half, half, -half],
      [-half, -half, half],  [half, -half, half],
      [-half, half, half],   [half, half, half]
    ].forEach(p => {
      const c = new THREE.Mesh(cornerGeo, matChrome);
      c.position.set(...p);
      group.add(c);
    });

    return group;
  }

  // Base isometric-style orientation matching the reference photo
  const isoRot = new THREE.Euler(0.42, 0.62, 0.12);

  // Cube Frame 1: Top-left
  const chromeCube1 = createChromeCubeFrame(4.2, 0.20);
  chromeCube1.position.set(3.8, 3.2, 1.2);
  chromeCube1.rotation.copy(isoRot);
  heroCluster.add(chromeCube1);

  // Cube Frame 2: Bottom-left
  const chromeCube2 = createChromeCubeFrame(3.8, 0.18);
  chromeCube2.position.set(1.0, -1.2, 1.8);
  chromeCube2.rotation.copy(isoRot);
  heroCluster.add(chromeCube2);

  // Cube Frame 3: Center-bottom
  const chromeCube3 = createChromeCubeFrame(3.6, 0.17);
  chromeCube3.position.set(7.5, -4.8, 0.6);
  chromeCube3.rotation.copy(isoRot);
  heroCluster.add(chromeCube3);

  // Cube Frame 4: Lower-right (below diamond)
  const chromeCube4 = createChromeCubeFrame(3.5, 0.16);
  chromeCube4.position.set(13.2, -3.8, -0.6);
  chromeCube4.rotation.copy(isoRot);
  heroCluster.add(chromeCube4);

  // ── FROSTED GLASS SOLID CUBE (Near Cube Frame 2/3) ──
  const frostedCubeGeo = new THREE.BoxGeometry(1.9, 1.9, 1.9);
  const frostedCubeMat = new THREE.MeshPhongMaterial({
    color: 0xf1f5f9,
    emissive: 0x1e293b,
    specular: 0xffffff,
    shininess: 160,
    transparent: true,
    opacity: 0.68
  });
  const frostedCubeMesh = new THREE.Mesh(frostedCubeGeo, frostedCubeMat);
  const frostedCubeWire = new THREE.Mesh(frostedCubeGeo.clone(), new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  }));
  frostedCubeWire.scale.setScalar(1.01);
  const frostedCubeGroup = new THREE.Group();
  frostedCubeGroup.add(frostedCubeMesh);
  frostedCubeGroup.add(frostedCubeWire);
  frostedCubeGroup.position.set(4.2, -4.2, 2.2);
  frostedCubeGroup.rotation.copy(isoRot);
  heroCluster.add(frostedCubeGroup);

  // ══════════════════════════════════════════════════════════════
  // FLOATING GLASS VOXELS / MICRO-CUBES (Isometric Diagonals)
  // ══════════════════════════════════════════════════════════════
  const voxelMat = new THREE.MeshPhongMaterial({
    color: 0xf8fafc,
    specular: 0xffffff,
    shininess: 140,
    transparent: true,
    opacity: 0.55
  });
  const voxelWireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.60
  });

  const floatingVoxels = [];
  const voxelPositions = [
    // Top-left diagonal stream
    [5.8, 6.2, 0.5, 0.55],
    [7.0, 7.5, -0.5, 0.48],
    [7.8, 8.2, -1.0, 0.38],
    [8.4, 9.0, -1.5, 0.35],
    // Between Cube 1 and Diamond
    [10.2, 4.8, 0.2, 0.45],
    [11.5, 5.8, -0.4, 0.40],
    [19.2, 8.8, -1.2, 0.48],
    // Mid diagonal stream
    [6.8, 0.5, 1.2, 0.50],
    [8.2, -0.8, 1.0, 0.42],
    [9.5, -1.8, 0.8, 0.46],
    // Inside/around Cube Frame 4
    [12.8, -2.2, 0.0, 0.45],
    [15.8, -2.8, -1.2, 0.50],
    [14.5, -5.8, -0.8, 0.42],
    // Bottom scattered voxels
    [2.2, -4.8, 1.8, 0.38],
    [5.5, -7.0, 1.2, 0.45],
    [9.0, -6.8, 0.5, 0.48],
    [11.2, -7.5, 0.0, 0.40],
    [17.0, -5.2, -1.5, 0.36],
    [17.8, -6.5, -2.0, 0.42],
    [18.5, -7.8, -2.5, 0.38]
  ];

  voxelPositions.forEach(([x, y, z, s]) => {
    const vGeo = new THREE.BoxGeometry(s, s, s);
    const vMesh = new THREE.Mesh(vGeo, voxelMat);
    const vWire = new THREE.Mesh(vGeo.clone(), voxelWireMat);
    vWire.scale.setScalar(1.02);
    const vGroup = new THREE.Group();
    vGroup.add(vMesh);
    vGroup.add(vWire);
    vGroup.position.set(x, y, z);
    vGroup.rotation.copy(isoRot);
    vGroup.userData = { baseY: y, speed: 0.3 + Math.random() * 0.4, rotOffset: Math.random() * Math.PI };
    heroCluster.add(vGroup);
    floatingVoxels.push(vGroup);
  });

  // ══════════════════════════════════════════════════════════════
  // SECTION OBJECTS — Spread across page height for smooth scrolling
  // ══════════════════════════════════════════════════════════════
  const sectionObjects = [];
  const sectionConfigs = [
    { geo: new THREE.IcosahedronGeometry(3.8, 1),    mat: matCrystalGlass, wire: matCrystalWire, pos: [-17, -28, -4] },
    { geo: new THREE.OctahedronGeometry(4.2, 0),     mat: matCrystalGlass, wire: matCrystalWire, pos: [17, -55, -2] },
    { geo: new THREE.TorusGeometry(4.8, 1.1, 16, 50),mat: matCrystalGlass, wire: matCrystalWire, pos: [-15, -90, -4] },
    { geo: new THREE.DodecahedronGeometry(4.0, 0),   mat: matCrystalGlass, wire: matCrystalWire, pos: [16, -125, -3] },
    { geo: new THREE.OctahedronGeometry(4.5, 1),     mat: matCrystalGlass, wire: matCrystalWire, pos: [-16, -155, -3] },
    { geo: new THREE.TorusKnotGeometry(3.5, 0.85, 80, 16), mat: matCrystalGlass, wire: matCrystalWire, pos: [15, -190, -2] },
    { geo: new THREE.IcosahedronGeometry(4.2, 2),    mat: matCrystalGlass, wire: matCrystalWire, pos: [-16, -220, -4] },
    { geo: new THREE.DodecahedronGeometry(4.8, 0),   mat: matCrystalGlass, wire: matCrystalWire, pos: [16, -255, -3] }
  ];

  sectionConfigs.forEach(cfg => {
    const meshGroup = createGlassMeshWithGlow(cfg.geo, cfg.mat, cfg.wire);
    meshGroup.position.set(...cfg.pos);
    ambientGroup.add(meshGroup);
    sectionObjects.push(meshGroup);
  });

  // ══════════════════════════════════════════════════════════════
  // AMBIENT GLASS CODE CUBES — Subtle, gentle background accents
  // ══════════════════════════════════════════════════════════════
  function createCodeCubeTexture(symbol, bgColor, textColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 120, 120);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  const cubeSymbols = [
    { sym: '{ }', pos: [7, 7, -6],    size: 1.3, rot: [0.3, 0.5, 0.1] },
    { sym: '</>', pos: [22, -6, -4],  size: 1.4, rot: [0.8, 0.2, 0.4] },
    { sym: '=>',  pos: [15, -8, -1],  size: 1.1, rot: [0.1, 0.9, 0.3] },
    { sym: '[ ]', pos: [-5, -6, -8],  size: 1.2, rot: [0.4, 0.7, 0.2] },
    // Scroll depth cubes
    { sym: '{ }', pos: [-12, -40, -4], size: 1.5, rot: [0.4, 0.5, 0.2] },
    { sym: '</>', pos: [14, -70, -3],  size: 1.4, rot: [0.2, 0.7, 0.5] },
    { sym: '[ ]', pos: [-8, -100, -5], size: 1.3, rot: [0.6, 0.3, 0.8] },
    { sym: '=>',  pos: [18, -130, -4], size: 1.2, rot: [0.1, 0.9, 0.4] },
    { sym: '{...}', pos: [-14, -160, -6],size: 1.5, rot: [0.7, 0.2, 0.6] }
  ];

  const codeCubes = [];
  cubeSymbols.forEach(cfg => {
    const tex = createCodeCubeTexture(cfg.sym, 'rgba(124, 58, 237, 0.22)', 'rgba(192, 132, 252, 0.85)');
    const mat = new THREE.MeshPhongMaterial({
      map: tex,
      transparent: true,
      opacity: 0.50,
      specular: 0x38bdf8,
      shininess: 140,
      side: THREE.DoubleSide
    });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size), mat);
    cube.position.set(...cfg.pos);
    cube.rotation.set(...cfg.rot);
    cube.userData = { baseY: cfg.pos[1], speed: 0.2 + Math.random() * 0.4, rotSpeed: 0.001 + Math.random() * 0.003 };
    ambientGroup.add(cube);
    codeCubes.push(cube);
  });

  // ══════════════════════════════════════════════════════════════
  // TWINKLING COSMIC STARFIELD (Multi-colored Glowing Gems)
  // ══════════════════════════════════════════════════════════════
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 220;
  const posArray = new Float32Array(particleCount * 3);
  const colorArray = new Float32Array(particleCount * 3);
  const starColors = [
    new THREE.Color(0x38bdf8), // cyan
    new THREE.Color(0xd946ef), // magenta
    new THREE.Color(0xa78bfa), // violet
    new THREE.Color(0x34d399), // emerald accent
    new THREE.Color(0xffffff)  // star white
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    posArray[i3]     = (Math.random() - 0.5) * 95;
    posArray[i3 + 1] = (Math.random() - 0.5) * 360;
    posArray[i3 + 2] = (Math.random() - 0.5) * 45;

    const chosenColor = starColors[Math.floor(Math.random() * starColors.length)];
    colorArray[i3]     = chosenColor.r;
    colorArray[i3 + 1] = chosenColor.g;
    colorArray[i3 + 2] = chosenColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  ambientGroup.add(particles);

  // ══════════════════════════════════════════════════════════════
  // MOUSE & SCROLL TRACKING
  // ══════════════════════════════════════════════════════════════
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let frameCount = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.02;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.02;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  // ══════════════════════════════════════════════════════════════
  // RENDER LOOP (Silky Smooth Parallax & Gentle Breathing Animation)
  // ══════════════════════════════════════════════════════════════
  let heroScrollY = 0;

  function render3dScene() {
    frameCount++;
    const time = frameCount * 0.01;

    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    // ── Unified Mouse Tilt for entire Hero Cluster ──
    heroCluster.rotation.x = targetY * 0.002;
    heroCluster.rotation.y = targetX * 0.002;

    // ── Diamond Crystal Polyhedron Rotations & Fluid Breathing ──
    diamondGroup.rotation.x += 0.0012;
    diamondGroup.rotation.y += 0.0018;
    diamondGroup.position.y = 3.2 + Math.sin(time * 0.5) * 0.35;

    // Inner Nested Polyhedron Layered Counter-Spin
    innerDiamondGroup.rotation.x -= 0.0022;
    innerDiamondGroup.rotation.y += 0.0028;

    // ── Polished Chrome Frame Cubes Subtle Hover Physics ──
    chromeCube1.position.y = 3.2 + Math.sin(time * 0.45) * 0.22;
    chromeCube2.position.y = -1.2 + Math.sin(time * 0.45 + 0.8) * 0.20;
    chromeCube3.position.y = -4.8 + Math.sin(time * 0.45 + 1.6) * 0.18;
    chromeCube4.position.y = -3.8 + Math.sin(time * 0.45 + 2.4) * 0.20;
    frostedCubeGroup.position.y = -4.2 + Math.sin(time * 0.45 + 1.2) * 0.18;

    // ── Floating Glass Voxels Smooth Drift ──
    floatingVoxels.forEach(v => {
      v.position.y = v.userData.baseY + Math.sin(time * v.userData.speed + v.userData.rotOffset) * 0.22;
    });

    // ── Interactive Mouse Light (Sharp specular gleam on crystal & chrome) ──
    mouseCrystalLight.position.x = 14.8 + targetX * 0.6;
    mouseCrystalLight.position.y = 3.2 - targetY * 0.6;

    // ── Section Object Rotations ──
    sectionObjects.forEach((obj, i) => {
      obj.rotation.x += 0.0015 + i * 0.0004;
      obj.rotation.y += 0.0012 + i * 0.0003;
    });

    // ── Code Cubes: Slow Hover Float + Rotation ──
    codeCubes.forEach((cube) => {
      cube.position.y = cube.userData.baseY + Math.sin(time * cube.userData.speed + cube.userData.speed) * 0.3;
      cube.rotation.x += cube.userData.rotSpeed * 0.6;
      cube.rotation.y += cube.userData.rotSpeed * 0.4;
    });

    // ── Cosmic Starfield Twinkle & Drift ──
    particles.rotation.y += 0.00018;
    particleMat.opacity = 0.55 + Math.sin(time * 1.6) * 0.15;

    // ── Camera: Mouse Tilt Inertia ──
    camera.position.x = targetX * 0.35;
    camera.position.y = -targetY * 0.35;
    camera.lookAt(scene.position);

    // ── Solution 1: Unified, Smooth & Gentle Parallax Scroll ──
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = window.innerHeight || 800;

    // Gentle upward drift for the hero cluster: max ~20 units with smooth lerp inertia
    const targetHeroY = (scrollY / heroHeight) * 20;
    heroScrollY += (targetHeroY - heroScrollY) * 0.08;
    heroCluster.position.y = heroScrollY;

    // Ambient background drift: very slow and subtle
    ambientGroup.position.y = (scrollY / heroHeight) * 10;

    // Soft fade as user scrolls past hero so 3D objects never distract from reading content
    if (bg3dCanvas) {
      const exitProgress = Math.min(1, Math.max(0, (scrollY - 80) / (heroHeight * 0.75)));
      // Dims from 0.95 in hero down to 0.25 subtle background ambiance
      bg3dCanvas.style.opacity = (0.95 - exitProgress * 0.70).toFixed(3);
    }

    renderer.render(scene, camera);

    if (!document.hidden) {
      sceneAnimId = requestAnimationFrame(render3dScene);
    } else {
      sceneAnimId = null;
    }
  }

  let sceneAnimId = requestAnimationFrame(render3dScene);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !sceneAnimId) {
      sceneAnimId = requestAnimationFrame(render3dScene);
    }
  });
}

/* ==========================================================================
   FAQ SMOOTH ACCORDION TOGGLE
   ========================================================================== */
(function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-summary');
    if (!trigger) return;

    trigger.addEventListener('click', () => toggleFaqItem(item, faqItems));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFaqItem(item, faqItems);
      }
    });
  });

  function toggleFaqItem(clickedItem, allItems) {
    const isOpen = clickedItem.classList.contains('is-open');

    // Close all other items smoothly
    allItems.forEach(otherItem => {
      if (otherItem !== clickedItem && otherItem.classList.contains('is-open')) {
        otherItem.classList.remove('is-open');
      }
    });

    // Toggle clicked item
    if (isOpen) {
      clickedItem.classList.remove('is-open');
    } else {
      clickedItem.classList.add('is-open');
    }
  }
})();

/* ==========================================================================
   PREVENT BACKGROUND SCROLL LEAK WHEN MODAL POPUP IS ACTIVE
   ========================================================================== */
document.addEventListener('wheel', (e) => {
  const activeModal = document.querySelector('.team-modal.active');
  if (!activeModal) return;

  // Prevent scrolling on the background overlay outside the modal container
  if (!e.target.closest('.team-modal-container')) {
    e.preventDefault();
  }
}, { passive: false });
