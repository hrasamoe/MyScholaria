# 🎓 MyScholaria

> A modern, full-stack **School Management System** built with React, MUI and Node.js — designed for schools, colleges and universities to manage students, teachers, classes, finances and communication in one unified platform.

![MyScholaria Banner](./screenshot.png)

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

![MyScholaria Banner](./screenshot2.png)
- **Subjects & Programs** — course catalog and curriculum tracks
- **Timetable & School Calendar** — schedules, holidays, school year planning

![MyScholaria Banner](./screenshot3.png)

### 📊 Evaluation & Tracking
- **Grades** — grading sheets and report cards
- **Exams** — exam sessions and results
- **Attendance** — presence, absences, lateness tracking
- **Reports** — analytics and institutional statistics
- **Diplomas & Theses** — certificates and dissertation tracking
- **Internships** — internship management and follow-up

![MyScholaria Banner](./screenshot4.png)

### 💰 Finance
- **Facturation** — tuition fee invoicing
- **Payments** — payment tracking and history
- **Budget** — institutional budget management
- **Scholarships** — scholarship awards and tracking

### 👥 Communication & Portals
- **Messages** — internal messaging
- **Announcements & Notifications** — institution-wide updates
- **Events** — calendar of school events
- **Student Portal** — dedicated student dashboard
- **Parent Portal** — child progress for parents

![MyScholaria Banner](./screenshot5.png)

### 🛠️ Administration
- **Users & Roles** — RBAC user management
- **Duty** — supervision and on-call rotation
- **Library** — book catalog and loan tracking
- **Settings** — institution-wide configuration
- **Dashboard** — KPIs and quick overview

![MyScholaria Banner](./screenshot1.png)

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
- ⚛️ **React 18** + **TypeScript**
- ⚡ **Vite** (build tool)
- 🎨 **Material UI (MUI v7)** — primary UI framework
- 🛣️ **react-router-dom v6**
- 🔄 **TanStack Query** (server state)
- 📝 **react-hook-form** + **zod** (forms & validation)
- 🔔 **notistack** (snackbars)
- 📊 **recharts** (charts & analytics)

### Backend (`/server`)
- 🟢 **Node.js** + **Express 5**
- 📘 **TypeScript**
- 🐘 **PostgreSQL** (via `pg` / `postgres`)
- 🔐 **JWT** + **bcryptjs**
- 🛡️ **Helmet**, **CORS**, **cookie-parser**
- ✉️ **Nodemailer** / **Resend** (transactional emails)
- ⏰ **node-cron** (scheduled jobs, e.g. cleanup of unverified accounts)
- ✅ **zod** (request validation)

---

## 📁 Project Structure

```
myscholaria/
├── client/                  # Frontend (React + Vite + MUI)
│   ├── public/              # Static assets (logo, images)
│   ├── src/
│   │   ├── components/      # Shared UI components (AppLayout, Sidebar, DataTable…)
│   │   ├── hooks/           # Auth, theme, route guards
│   │   ├── pages/           # All app pages (Dashboard, Students, …)
│   │   ├── services/        # API service layer (auth, establishment…)
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
│   │   │   └── establishments/
│   │   └── index.ts         # App entry
│   └── package.json
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

| Role        | Access                                                                 |
|-------------|------------------------------------------------------------------------|
| **Admin**   | Full access — users, roles, finance, academic, reports                 |
| **Staff**   | Users, finance, classrooms, reports                                    |
| **Teacher** | Students, classes, grades, exams, attendance, coursebook               |
| **Student** | Student Portal — grades, attendance, schedule, messages                |
| **Parent**  | Parent Portal — children's grades, attendance, messages                |

---

## 🛡️ Data Protection & Compliance

MyScholaria is designed with **GDPR** at its core:
- 🔐 TLS 1.3 in transit, AES-256 at rest
- 🧒 Special safeguards for minors (no behavioral advertising, parental consent flows)
- ⏱️ Configurable retention policies
- 📜 Full **Privacy Policy** and **Terms of Service** included
- 👤 Data subject rights: access, rectification, erasure, portability

---

## 🗺️ Roadmap

- [ ] Real-time notifications (WebSockets)
- [ ] Mobile companion app (React Native)
- [ ] Stripe / Paddle payment integration
- [ ] AI-powered analytics (at-risk student detection)
- [ ] Multi-language i18n (FR / EN / ES / AR)
- [ ] SecNumCloud-certified hosting option

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss any major change.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch and open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

---

## 💬 Contact & Support

- 📧 **Support**: herysamuelpljv@gmail.com
- 🔒 **Privacy / DPO**: hrasamoevj@gmail.com
- 🌐 **Website**: https://myscholariaa.web.app

---

<p align="center">
  Made with ❤️ for educators, by educators.<br/>
  <b>MyScholaria</b> — Empowering schools, one click at a time.
</p>
