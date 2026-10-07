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

[Live Demo](https://mrstark0257.github.io/MY-website/) • [Features](#-key-features) • [Tech Stack](#-technology-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference)

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
- **📊 Interactive Project Cost Estimator**: Real-time project cost calculator letting prospective clients select project scope, deliverables, and timelines.
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
  - **SQLite3** (Zero-configuration default; auto-provisions `data/nexveda.db`)
  - **PostgreSQL** (Enterprise production support via `pg` pool with automated schema & database creation)
- **Email Notifications**:
  - **Nodemailer** (SMTP support for Gmail and custom mail servers)
  - **Resend API** (Transactional email provider support)

---

## 📁 Project Architecture

```text
MY-website/
├── index.html           # Main application landing page & layout
├── styles.css           # Design system tokens, glassmorphism, responsive styles
├── script.js            # Three.js 3D canvas, GSAP animations, Lenis, UI logic
├── server.js            # Express server, SQLite/PostgreSQL connectors, email dispatch
├── package.json         # Project metadata and dependencies
├── .env                 # Environment variables configuration (ignored in git)
├── .gitignore           # Git ignore list
├── site.webmanifest     # PWA manifest
├── robots.txt           # Search crawler directives
├── sitemap.xml          # Search engine sitemap
├── assets/              # Icons, vectors, and font assets
├── data/                # SQLite database directory (auto-created)
└── images/              # Logos, team portraits, branding, and preview assets
```

---

## 🚀 Getting Started

### Option 1: Static Hosting / Local Preview (No Server Required)
Simply open `index.html` directly in your favorite modern browser, or launch using VS Code's **Live Server** extension. Contact inquiries will gracefully route via client mailto.

---

### Option 2: Full-Stack Mode (Express + Database + Email Dispatch)

#### 1. Clone the Repository
```bash
git clone https://github.com/MrStark0257/MY-website.git
cd MY-website
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
Create a `.env` file in the project root directory:

```env
# Server Port
PORT=8080

# Database Configuration (sqlite or postgres)
DB_TYPE=sqlite
DB_PATH=./data/nexveda.db

# Notification Recipient
CONTACT_EMAIL=nexvedatechnologies@gmail.com

# Email Service: SMTP (e.g., Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=nexvedatechnologies@gmail.com
SMTP_PASS=your_gmail_app_password

# (Optional) Alternative Email Service: Resend
# RESEND_API_KEY=re_your_api_key_here

# (Optional) PostgreSQL Configuration (when DB_TYPE=postgres)
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=nexveda
```

#### 4. Run the Application
```bash
# Start the server
npm start
```

#### 5. Open in Browser
Visit [http://localhost:8080](http://localhost:8080) to interact with the application.

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

## 🛡️ Environment Variables Reference

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `8080` (or `3001`) | HTTP port for Express server |
| `DB_TYPE` | String | `sqlite` | Database engine (`sqlite` or `postgres`) |
| `DB_PATH` | String | `./data/nexveda.db` | Local SQLite database file path |
| `CONTACT_EMAIL` | String | `nexvedatechnologies@gmail.com` | Destination inbox for form inquiries |
| `SMTP_HOST` | String | `smtp.gmail.com` | SMTP host address |
| `SMTP_PORT` | Number | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | String | - | SMTP authentication username / email |
| `SMTP_PASS` | String | - | SMTP authentication password / App password |
| `RESEND_API_KEY`| String | - | Resend API key (if using Resend instead of SMTP) |
| `DATABASE_URL` | String | - | Direct PostgreSQL connection string URI |

---

## 👥 Nexveda Technologies Team

- **Meet Pavagadhi** — *Founder & Lead Architect / Web Developer & 3D Animator*
- **Sanchit Sharma** — *AI Graphic Designer & Frontend Web Designer*
- **Kingshuk Chatterjee** — *Software Developer & ML Engineer*
- **Ayush Ranjan** — *Software Engineer & Full Stack Developer*

---

## 📄 License & Credits

Copyright © 2026 **Nexveda Technologies**. All rights reserved.  
Unauthorized distribution, reproduction, or commercial duplication without explicit permission is prohibited.
