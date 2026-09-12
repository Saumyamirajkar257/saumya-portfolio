# Saumya Mirajkar — Portfolio

A premium, cinematic developer portfolio built with **Next.js (React)** on the frontend and **Python + FastAPI** on the backend. All portfolio content is served dynamically from a database through an API — edit it once in the admin panel (`/admin`) and every section updates instantly, no redeploy needed.

![stack](https://img.shields.io/badge/Next.js-15-black) ![stack](https://img.shields.io/badge/React-19-blue) ![stack](https://img.shields.io/badge/FastAPI-Python-orange) ![stack](https://img.shields.io/badge/SQLAlchemy-SQLite%20%2F%20PostgreSQL-green)

---

## ✨ Highlights

- **Cinematic "Ember" design** — near-black surfaces, amber→coral gradient accents, Syne + Inter + JetBrains Mono typography.
- **Extensive interactions** — custom cursor, particle canvas, magnetic buttons, 3D tilt cards, scroll-reveal text, scroll progress, animated timeline, project modal, responsive mobile menu.
- **Content is dynamic** — profile, skills, projects, experience, education and certifications are stored in the DB and fetched from the API. No resume data is hardcoded in components.
- **Working contact form** — validation, sanitization, honeypot spam trap, per-IP rate limiting, and real email delivery (SMTP) with a graceful dev fallback.
- **Secure admin panel** at `/admin` — JWT auth, bcrypt password hashing, full CRUD for every content type, contact message inbox.
- **Accessible & fast** — semantic HTML, keyboard navigation, ARIA, `prefers-reduced-motion` support, lazy effects, GPU-friendly transforms.
- **SEO-ready** — metadata, Open Graph, Twitter cards, semantic heading hierarchy, custom favicon.

---

## 🏗️ Architecture

```
portfolio/
├── frontend/                 # Next.js 15 (App Router)
│   ├── app/
│   │   ├── layout.js         # fonts, SEO metadata, global chrome
│   │   ├── page.js           # homepage (fetches content server-side)
│   │   ├── admin/page.js     # admin panel (login + CRUD)
│   │   └── globals.css       # design system
│   ├── components/           # Cursor, Particles, Navbar, Marquee, animations…
│   ├── sections/             # Hero, About, Skills, Projects, Experience,
│   │                         #   Education, Certifications, Contact
│   ├── lib/content.js        # API client + bundled fallback data
│   └── public/               # resume file, favicon
│
├── backend/                  # Python + FastAPI
│   ├── app/
│   │   ├── main.py           # app factory, CORS, lifespan
│   │   ├── config/           # pydantic-settings (env vars)
│   │   ├── database/         # engine + session + base
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── routes/           # public content, contact, auth, admin CRUD
│   │   ├── services/         # rate limiter, emailer, sanitization
│   │   ├── auth/             # JWT + bcrypt + FastAPI dependencies
│   │   └── seed/             # resume content + seeder
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
├── README.md
└── .env.example
```

---

## 🚀 Local Development

> One-time requirement: **Node.js ≥ 18.18** and **Python ≥ 3.10**.

### 1) Install dependencies

**Backend (Python):**

```bash
cd backend
python -m venv venv

# Windows (PowerShell/Git Bash):
venv\Scripts\activate
#            ^ or: source venv/Scripts/activate   (Git Bash)

# macOS / Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

**Frontend (Node):**

```bash
cd frontend
npm install
```

### 2) Configure environment variables

Copy the example files and edit as needed:

```bash
# Backend — change the admin password + anything else you like
cp backend/.env.example backend/.env

# Frontend — usually no changes needed in development
cp frontend/.env.local.example frontend/.env.local
```

The most important value is the **admin password** in `backend/.env`:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-admin-password     # ⬅ set something strong
JWT_SECRET_KEY=change-me-jwt-secret         # ⬅ set a long random string
```

> The password and JWT secret are hashed/used at runtime and are never exposed
> to the frontend. Keep `backend/.env` out of version control (already in `.gitignore`).

### 3) Set up the database

Nothing to do — the database (`backend/portfolio.db`, SQLite) is created and seeded
automatically the first time the backend starts. The seeder loads your complete
resume content (profile, skills, projects, experience, education, certifications)
and creates the admin user.

To start fresh later: stop the backend and delete `backend/portfolio.db`.

### 4) Start the backend (FastAPI)

```bash
cd backend
# (venv active)
python run.py
```

or with auto-reload while developing:

```bash
uvicorn app.main:app --reload --port 8000
```

- API docs: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/health>

### 5) Start the frontend (Next.js)

```bash
cd frontend
npm run dev
```

- Site: <http://localhost:3000>
- Admin panel: <http://localhost:3000/admin>

### 6) Run the complete app

1. Terminal A — FastAPI on `:8000` (step 4)
2. Terminal B — Next.js on `:3000` (step 5)
3. Open <http://localhost:3000> — the homepage pulls everything from the API.
4. Open <http://localhost:3000/admin>, sign in with your `ADMIN_USERNAME` /
   `ADMIN_PASSWORD`, and edit content live.

> No backend? The site still renders using a bundled copy of the same resume
> data (the footer shows "demo data mode"). The contact form and admin panel
> require the backend.

---

## 📧 Sending contact-form emails

The contact form works out of the box **without** SMTP — messages are stored in
the database and visible in the admin panel → **Messages**.

To actually receive emails, fill these in `backend/.env`:

```
SMTP_HOST=smtp.gmail.com            # or your provider
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASSWORD=your-app-password     # use an app password, not your normal one
SMTP_FROM=you@example.com
SMTP_USE_TLS=true
CONTACT_TO=saumyamirajkar25@icloud.com
```

For Gmail, generate an [App Password](https://myaccount.google.com/apppasswords)
(requires 2-Step Verification) instead of using your account password.

---

## 🌐 Deployment

### Next.js frontend — Vercel

1. Push the repo to GitHub.
2. Import the project on [vercel.com](https://vercel.com). Root directory: `frontend`.
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = your deployed API URL, e.g. `https://portfolio-api.yourdomain.com`
   - `NEXT_PUBLIC_SITE_URL` = `https://yourdomain.com`

### FastAPI backend — Railway / Render / Fly.io

Example with **Railway**:

1. Create a new service pointing at the `backend/` directory.
2. Build command:
   ```bash
   pip install -r requirements.txt
   ```
3. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Set the production environment variables (see below).
5. Add the public URL as `NEXT_PUBLIC_API_URL` on Vercel.

### PostgreSQL

Local SQLite is swapped for PostgreSQL by changing one variable:

```
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/portfolio
```

Tip: add `psycopg[binary]` to `requirements.txt` for Postgres connectivity, or use
a managed database from your host (Railway/Render provide them with a one-click add-on).

### Production environment variables

```
ENV=production
DEBUG=false
DATABASE_URL=postgresql+psycopg://…            # Postgres in production
JWT_SECRET_KEY=<long random string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong password>
CORS_ORIGINS=https://yourdomain.com
SMTP_HOST=…
SMTP_USER=…
SMTP_PASSWORD=…
SMTP_FROM=…
CONTACT_TO=saumyamirajkar25@icloud.com
FRONTEND_URL=https://yourdomain.com
```

> **Security checklist before going live**
> - Change `ADMIN_PASSWORD` and `JWT_SECRET_KEY`.
> - Restrict `CORS_ORIGINS` to your real frontend domain.
> - Serve the site over HTTPS (your host does this automatically).
> - Rotate secrets if they ever appear in logs.

---

## 🔐 Admin Panel

| Route | Purpose |
|---|---|
| `POST /api/auth/login` | Admin login → JWT |
| `GET/POST/PUT/DELETE /api/admin/*` | CRUD for profile, skills, projects, experience, education, certifications |
| `GET /api/admin/messages` · `PATCH /api/admin/messages/{id}` | Contact inbox |
| `GET /api/admin/stats` | Dashboard counts |

All admin routes require a bearer token with the `admin` role.

---

## 📡 API Reference (public)

| Endpoint | Returns |
|---|---|
| `GET /api/content` | Everything at once (homepage) |
| `GET /api/profile` | Profile (name, role, bio, socials, stats…) |
| `GET /api/skills` | Skills list |
| `GET /api/projects` · `GET /api/projects/{id}` | Projects |
| `GET /api/experience` | Experience |
| `GET /api/education` | Education |
| `GET /api/certifications` | Certifications |
| `POST /api/contact` | Send a contact message (validated + rate-limited) |
| `GET /health` | Health check |

---

## 🧰 Tech Stack

**Frontend:** Next.js 15 · React 19 · Framer Motion · CSS Modules · JavaScript (ES2020+)
**Backend:** Python · FastAPI · SQLAlchemy 2 · Pydantic v2 · SQLite (dev) / PostgreSQL (prod) · PyJWT · bcrypt
**Animations:** Custom cursor, particle canvas, magnetic buttons, tilt cards, scroll reveals — all `prefers-reduced-motion` aware.