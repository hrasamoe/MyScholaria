# 🎓 MyScholaria

> A modern, full-stack **School Management System** built with React, MUI and Node.js — designed for schools, colleges and universities to manage students, teachers, classes, finances and communication in one unified platform.

![MyScholaria Banner](./screenshot.png)

<p align="center">
  <a href="https://myscholariaa.web.app"><img src="https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge" alt="Live Demo"/></a>
  <a href="mailto:herysamuelpljv@gmail.com"><img src="https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?style=for-the-badge" alt="Sponsor"/></a>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
  <img src="https://img.shields.io/badge/GDPR-Compliant-purple?style=for-the-badge" alt="GDPR"/>
</p>

---

## ✨ Overview

**MyScholaria** is a comprehensive school management platform that centralizes every aspect of an educational institution's daily operations — from student enrollment and grading to billing, attendance, and parent-teacher communication.

Built with a **mobile-first**, accessibility-aware design and a strong focus on **data protection** (GDPR-compliant), it provides dedicated portals for administrators, teachers, staff, students and parents.

---

## 🚀 Features

### 🎓 Academic Management

- **Students** — enrollment files, profiles, academic history
- **Teachers & Staff** — faculty and administrative personnel management
- **Classes & Classrooms** — group classes and physical room allocation
- **Coursebook** — lesson logs and pedagogical progression

![Academic Management](./screenshot2.png)

- **Subjects & Programs** — course catalog and curriculum tracks
- **Timetable & School Calendar** — schedules, holidays, school year planning

![Timetable](./screenshot3.png)

### 📊 Evaluation & Tracking

- **Grades** — grading sheets and report cards
- **Exams** — exam sessions and results
- **Attendance** — presence, absences, lateness tracking
- **Reports** — analytics and institutional statistics
- **Diplomas & Theses** — certificates and dissertation tracking
- **Internships** — internship management and follow-up

![Evaluation](./screenshot4.png)

### 💰 Finance

- **Facturation** — tuition fee invoicing
- **Payments** — payment tracking and history
- **Budget** — institutional budget management
- **Scholarships** — scholarship awards and tracking

### 💬 Communication & Portals

- **Direct Messages (DM)** *(New in v1.1.0)* — private messaging between users and between users and admins
- **Messages** — internal messaging
- **Announcements & Notifications** — institution-wide updates
- **Events** — calendar of school events
- **Student Portal** — dedicated student dashboard
- **Parent Portal** — child progress for parents

#### 💬 Direct Messages — Preview

> Users and admins can now exchange private messages in real time, directly from their dashboard.

![DM Preview](./screenshot6.png)

> 🛡️ Message deletion follows a moderation-aware retention policy.
> See [`docs/MESSAGE_MODERATION.md`](./docs/MESSAGE_MODERATION.md) for details.

### 🛠️ Administration

- **Users & Roles** — RBAC user management
- **Duty** — supervision and on-call rotation
- **Library** — book catalog and loan tracking
- **Settings** — institution-wide configuration
- **Dashboard** — KPIs and quick overview

![Dashboard](./screenshot1.png)

### 🔐 Authentication & Security

- Sign in / Sign up with role selection (Student, Parent, Teacher, Staff, Admin)
- Email verification
- Forgot password / Reset password / Change password
- Establishment creation & approval workflow
- Role-based route protection (RBAC)
- JWT authentication with refresh tokens (httpOnly cookies)

### 📄 Legal

- GDPR-compliant **Privacy Policy**
- Detailed **Terms of Service**

---

## 🧱 Tech Stack

### Frontend (`/client`)

| Library | Role |
|---|---|
| ⚛️ React 18 + TypeScript | UI framework |
| ⚡ Vite | Build tool |
| 🎨 Material UI (MUI v7) | Component library |
| 🛣️ react-router-dom v6 | Routing |
| 🔄 TanStack Query | Server state management |
| 📝 react-hook-form + zod | Forms & validation |
| 🔔 notistack | Snackbars / toasts |
| 📊 recharts | Charts & analytics |

### Backend (`/server`)

| Library | Role |
|---|---|
| 🟢 Node.js + Express 5 | Server framework |
| 📘 TypeScript | Type safety |
| 🐘 PostgreSQL (pg / postgres) | Database |
| 🔐 JWT + bcryptjs | Auth & encryption |
| 🛡️ Helmet, CORS, cookie-parser | Security middleware |
| ✉️ Nodemailer / Resend | Transactional emails |
| ⏰ node-cron | Scheduled jobs |
| ✅ zod | Request validation |

---

## 📁 Project Structure

```
myscholaria/
├── client/                  # Frontend (React + Vite + MUI)
│   ├── public/              # Static assets (logo, images)
│   ├── src/
│   │   ├── components/      # Shared UI components (AppLayout, Sidebar, DataTable…)
│   │   ├── hooks/           # Auth, theme, route guards
│   │   ├── pages/           # All app pages (Dashboard, Students, Messages…)
│   │   ├── services/        # API service layer (auth, establishment, messages…)
│   │   ├── theme.ts         # Centralized MUI theme
│   │   └── App.tsx          # Routes & providers
│   ├── index.html
│   └── package.json
│
├── server/                  # Backend (Express + PostgreSQL)
│   ├── src/
│   │   ├── db/              # DB pool & migrations
│   │   ├── middleware/      # Auth, error handlers
│   │   ├── modules/
│   │   │   ├── auth/        # Auth router, service, schema
│   │   │   ├── messages/    # DM router, service, schema
│   │   │   └── establishments/
│   │   └── index.ts         # App entry
│   └── package.json
│
├── docs/
│   └── MESSAGE_MODERATION.md  # Message deletion & retention policy
│
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (or **Bun** ≥ 1.0)
- **PostgreSQL** ≥ 14
- A modern browser

### 1. Clone the repository

```bash
git clone https://github.com/hrasamoe/myscholaria.git
cd myscholaria
```

### 2. Configure environment variables

**`server/.env`**

```env
PORT=3434
CLIENT_URL=http://localhost:8080
DATABASE_URL=postgres://user:password@localhost:5432/myscholaria

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

RESEND_API_KEY=your-resend-key
EMAIL_FROM=no-reply@myscholaria.app
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:3434
```

### 3. Install dependencies & run

**Backend**

```bash
cd server
npm install
npm run dev          # → http://localhost:3434
```

**Frontend**

```bash
cd client
npm install          # or: bun install
npm run dev          # → http://localhost:5173
```

---

## 🧪 Testing

```bash
cd client
npm run test         # Vitest unit tests
npm run test:watch
```

---

## 📦 Build for Production

```bash
# Frontend
cd client && npm run build

# Backend
cd server && npm run build && npm start
```

---

## 🔐 Roles & Permissions

| Role | Access |
|---|---|
| **Admin** | Full access — users, roles, finance, academic, reports, DMs |
| **Staff** | Users, finance, classrooms, reports, DMs |
| **Teacher** | Students, classes, grades, exams, attendance, coursebook, DMs |
| **Student** | Student Portal — grades, attendance, schedule, DMs |
| **Parent** | Parent Portal — children's grades, attendance, DMs |

---

## 🛡️ Data Protection & Compliance

MyScholaria is designed with **GDPR** at its core:

- 🔐 TLS 1.3 in transit, AES-256 at rest
- 🧒 Special safeguards for minors (no behavioral advertising, parental consent flows)
- ⏱️ Configurable retention policies
- 📜 Full **Privacy Policy** and **Terms of Service** included
- 👤 Data subject rights: access, rectification, erasure, portability

### 💬 Message Moderation & Retention

To protect minors and allow institutions to investigate misconduct,
harassment, or policy violations, messages are **not permanently
erased** when a user selects **"Delete for everyone."**

- The message is hidden from both participants' conversation view.
- The original content is retained in the database, flagged as
  deleted, and accessible only to authorized administrators for
  moderation and compliance purposes.
- This retention period follows the institution's configured data
  retention policy (see **Settings**).
- Users are informed of this behavior in the **Privacy Policy** at
  the point of account creation.

This approach balances user privacy with the safety obligations
schools have toward minors using the platform.

📄 Full details: [`docs/MESSAGE_MODERATION.md`](./docs/MESSAGE_MODERATION.md)

---

## 🗺️ Roadmap

### ✅ Released

- [x] Role-based authentication (RBAC) with JWT
- [x] Student, Teacher, Staff & Admin portals
- [x] Real-time notifications
- [x] **Direct Messages (DM)** — user ↔ user & user ↔ admin *(v1.1.0)*

### 🔜 Coming Soon


- [ ] Mobile companion app (React Native)
- [ ] Stripe / Paddle payment integration
- [ ] Finance & Scholarships management
- [ ] AI-powered analytics (at-risk student detection)
- [ ] Multi-language i18n (FR / EN / ES / AR)
- [ ] SecNumCloud-certified hosting option
- [ ] Group messaging & channels

---

## 🤝 Contributing

Contributions are **warmly welcome** and genuinely appreciated! MyScholaria grows stronger with every person who helps improve it.

If you'd like to contribute:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch and open a Pull Request

Please open an issue first to discuss any major change before diving in.

> 💡 Whether it's a bug fix, a new feature, improved documentation, or a translation — every contribution matters. Thank you for being part of this project!

---

## 💖 Sponsorship

If MyScholaria has been useful to you or your institution, consider **sponsoring the project** to help sustain its development and keep it free and open-source.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?style=for-the-badge)](mailto:herysamuelpljv@gmail.com)

Your support — no matter the size — helps fund new features, infrastructure, and maintenance. It also motivates continued work on making MyScholaria the best open-source school management system available.

---

## 🎨 Inspiration & Usage

Feel free to use **MyScholaria as inspiration** for your own projects — that's what open source is about!

However, please note:

- 🚫 **Do not copy** the design, logo, branding, or visual identity of MyScholaria
- ✅ You are welcome to be inspired by the architecture, features, or approach
- ✅ Contributions and sponsorships are preferred over direct design replication

> The logo, UI design, and visual assets are original creative work and are **not covered** by the MIT License. All rights reserved on branding and design.

---

## 📄 License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

> ⚠️ The MIT License applies to the **source code only**. The logo, design, and branding are **not** open-licensed and may not be reproduced or reused without permission.

---

## 💬 Contact & Support

- 📧 **Support**: herysamuelpljv@gmail.com
- 🔒 **Privacy / DPO**: hrasamoevj@gmail.com
- 🌐 **Website**: https://myscholariaa.web.app

---

<p align="center">
  Made with ❤️ for educators, by educators.<br/>
  <b>MyScholaria</b> — Empowering schools, one click at a a time.<br/><br/>
  ⭐ If you find this project useful, consider giving it a star — it helps a lot!
</p>