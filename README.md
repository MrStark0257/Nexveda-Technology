<div align="center">

# 🚀 Nexveda Technologies

### Modern Websites & Digital Solutions

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21+-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

<br />

**Nexveda Technologies** builds fast, scalable, and visually captivating websites and web applications tailored for startups, businesses, and modern brands.

<br />

[🌐 Live Site](https://nexvedatechnology.com/) • [💻 GitHub Repo](https://github.com/MrStark0257/Nexveda-Technology) • [✨ Features](#-key-features) • [🛠️ Tech Stack](#-technology-stack) • [🚀 Getting Started](#-getting-started) • [🔌 API Reference](#-api-reference)

---

</div>

## 🌟 Overview

The Nexveda Technologies platform is a high-performance, responsive corporate web experience crafted with cutting-edge web design aesthetics, smooth physics-driven scrolling, real-time 3D background visualizers, interactive cost calculators, and an enterprise-grade backend for contact form dispatch and lead storage.

---

## ✨ Key Features

- **🌐 Interactive 3D Canvas Background**: Powered by **Three.js**, featuring an ambient particle wavefield and dynamic iridescent lighting that tracks user cursor movement in real time.
- **🌀 Ultra-Smooth Scroll**: Integrated with **Lenis Smooth Scroll** for momentum-based inertial scrolling.
- **⚡ GSAP & ScrollTrigger Micro-Animations**: Fluid section transitions, kinetic text reveals, 3D card tilts, and stagger effects built with **GreenSock (GSAP 3.12)**.
- **🌓 Dynamic Theme Switcher**: Full Dark Mode and Light Mode support with persistent state stored in `localStorage`.
- **🎯 Custom Cursor & Micro-Interactions**: Magnetic cursor ring, dot tracking, and interactive button hover states.
- **👥 Dynamic Team Bios & Credential Modals**: Interactive modals detailing team members' technical proficiencies, live portfolio showcases, and project links.
- **📬 Resilient Dual-Mode Contact System**:
  - **Full-Stack Mode**: Submits via REST API (`/api/contact`), validates inputs, logs submissions into SQLite or PostgreSQL, and triggers automated email notifications via SMTP (Gmail) or Resend API.
  - **Static Mode (GitHub Pages)**: Gracefully detects non-server environments and seamlessly falls back to client-side `mailto:` dispatch.
- **🔍 SEO & Performance Optimized**: Semantic HTML5 markup, OpenGraph social preview tags, dynamic sitemap, and Google Fonts preconnections.

---

## 🛠️ Technology Stack

### Frontend
- **Markup & Layout**: Semantic HTML5, CSS3 (Modern Flexbox, CSS Grid, Glassmorphism, CSS Custom Properties)
- **3D Graphics & Animations**: [Three.js (r128)](https://threejs.org/), [GSAP (3.12.5)](https://greensock.com/), [ScrollTrigger](https://greensock.com/scrolltrigger/)
- **Scroll Engine**: [Lenis Smooth Scroll (v1.1.18)](https://github.com/darkroomengineering/lenis)
- **Typography**: Google Fonts (*Outfit*, *Plus Jakarta Sans*, *Montserrat*, *Inter*)

### Backend & Storage
- **Runtime & Server**: [Node.js](https://nodejs.org/), [Express.js (v4.21)](https://expressjs.com/)
- **Databases**:
  - **PostgreSQL** (Production database via `pg` pool + `DATABASE_URL`, e.g. Neon PostgreSQL with automatic `submissions` table creation)
  - **SQLite3** (Optional local fallback via `DB_TYPE=sqlite`, auto-provisions `data/nexveda.db`)
- **Security**: CSP headers, strict static asset whitelist, origin-restricted CORS (`ALLOWED_ORIGINS`), proxy-aware rate limiting (`TRUST_PROXY`), honeypot anti-bot field, and email HTML/header sanitization
- **Email Notifications**:
  - **Nodemailer** (SMTP support for Gmail and custom mail servers)
  - **Resend API** (Transactional email provider support)

---

## 📁 Project Architecture

```text
Nexveda-Technology/
├── index.html           # Main application landing page & layout
├── server.js            # Production entrypoint (starts Express server)
├── dev-server.js        # Express app, security middleware, PostgreSQL/SQLite, email dispatch
├── package.json         # Project metadata and dependencies
├── .env.example         # Safe environment variable template (copy to .env locally)
├── .gitignore           # Git ignore list (.env, node_modules, data/*.db)
├── .nojekyll            # Disables Jekyll processing on GitHub Pages
├── site.webmanifest     # PWA manifest
├── robots.txt           # Search crawler directives
├── sitemap.xml          # Search engine sitemap
├── css/
│   ├── styles.css       # Main site design system & responsive styles
│   └── policy.css       # Legal pages styling
├── js/
│   └── script.js        # Three.js 3D canvas, GSAP animations, Lenis, UI & form logic
├── legal/
│   ├── privacy-policy.html
│   └── terms-and-conditions.html
├── assets/
│   └── resumes/         # Downloadable PDF resumes
├── data/                # Local SQLite database directory (optional fallback)
└── images/              # Logos, team portraits, branding, and portfolio assets
```

---

## 🚀 Getting Started

### Option 1: Static Preview (No Server Required)
Open `index.html` using a local static server. Contact inquiries fall back to FormSubmit / client `mailto:` when `/api/contact` is unavailable.

---

### Option 2: Full-Stack Mode (Express + PostgreSQL + Email Dispatch)

#### 1. Clone the Repository
```bash
git clone https://github.com/MrStark0257/Nexveda-Technology.git
cd Nexveda-Technology
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
Copy `.env.example` to `.env` (never commit `.env` with real secrets):
```bash
cp .env.example .env
```
Fill in `DATABASE_URL` (PostgreSQL connection string), `SMTP_PASS`, `ALLOWED_ORIGINS`, and `TRUST_PROXY=true` in `.env` (or in your hosting provider's Environment Variables panel).

#### 4. Run the Application
```bash
npm start
```

#### 5. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) to interact with the application.

---

## 🔌 API Reference

### Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  { "ok": true }
  ```

### Contact Form Submission
- **Endpoint**: `POST /api/contact`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555-0199",
    "message": "We would like to build an enterprise platform."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Thanks! Your message has been sent successfully."
  }
  ```

---

## 👥 Nexveda Technologies Team

- [Meet Pavagadhi](https://github.com/MrStark0257) — *Founder & Lead Architect / Web Developer & 3D Animator*
- [Sanchit Sharma](https://github.com/sanchitsharma217-arch) — *AI Graphic Designer & Frontend Web Designer*

---

## 📄 License & Credits

Copyright © 2026 **Nexveda Technologies**. All rights reserved.  
Unauthorized distribution, reproduction, or commercial duplication without explicit permission is prohibited.
