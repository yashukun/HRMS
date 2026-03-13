# HRMS – Human Resource Management System

## Project Overview

HRMS is a full-stack **Human Resource Management System** that lets administrators manage employees and track daily attendance. It features a **FastAPI** backend, a **React** frontend, and a **PostgreSQL** database, all containerized with **Docker Compose**.

### Live Demo

| Service         | URL                              |
| --------------- | -------------------------------- |
| **Frontend**    | https://hrms-ten-silk.vercel.app |
| **Backend API** | https://hrms-tcl3.onrender.com   |

> Frontend is deployed on **Vercel**. Backend and database are deployed on **Render**.

### Key Features

- **Employee CRUD** – Create, list, update, and delete employee records
- **Attendance Tracking** – Mark daily attendance (Present / Absent) per employee
- **Attendance Summary** – View total present days with optional date-range filtering
- **Duplicate Prevention** – Unique email constraint; one attendance record per employee per day
- **Employee Search** – Autocomplete dropdown that filters by name, email, or ID
- **Responsive UI** – Dashboard with stats cards, department badges, and mobile-friendly layout
- **Interactive API Docs** – Auto-generated Swagger UI at `/docs`

### Architecture

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Frontend   │──────▶│   Backend    │──────▶│  PostgreSQL  │
│  React :3000 │ HTTP  │ FastAPI :8000│  SQL  │   DB :5432   │
└──────────────┘       └──────────────┘       └──────────────┘
```

### Project Structure

```
HRMS/
├── docker-compose.yml          # Orchestrates all services
├── .env                        # Environment variables (create manually)
├── README.md
│
├── backend/
│   ├── Dockerfile              # Python 3.12 + uv package installer
│   ├── requirements.txt        # Python dependencies
│   ├── main.py                 # FastAPI app – routes & middleware
│   ├── database.py             # SQLAlchemy engine & session factory
│   ├── models.py               # ORM models (Employee, Attendance)
│   └── schemas.py              # Pydantic request / response schemas
│
└── frontend/
    ├── Dockerfile              # Node 18 Alpine
    ├── package.json            # npm dependencies & scripts
    ├── public/
    │   └── index.html          # HTML shell
    └── src/
        ├── index.js            # React entry point
        ├── index.css           # Global styles
        ├── App.js              # Root component & route definitions
        ├── api.js              # Axios instance (base URL config)
        ├── components/
        │   ├── Navbar.js       # Top navigation bar
        │   └── Sidebar.js      # Left sidebar navigation
        └── pages/
            ├── Dashboard.js    # Overview stats & departments
            ├── Employees.js    # Employee CRUD + inline attendance
            ├── Attendance.js   # Mark & view attendance records
            └── Login.js        # Admin login form
```

---

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| **Backend**    | Python 3.12, FastAPI, SQLAlchemy, Pydantic |
| **Frontend**   | React 19, React Router 7, Axios            |
| **Database**   | PostgreSQL 16 (Alpine)                     |
| **Packaging**  | uv (fast Python package installer)         |
| **Containers** | Docker, Docker Compose                     |
| **Deployment** | Vercel (frontend), Render (backend + DB)   |

---

## Steps to Run the Project Locally

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose **v2+**
- _(Optional, for running without Docker)_ Python 3.12+, Node.js 18+, PostgreSQL 16

### 1. Clone the Repository

```bash
git clone https://github.com/yashukun/HRMS.git
cd HRMS
```

### 2. Create a `.env` File

Create a `.env` file in the project root with the following variables:

```env
# ── Database ──
POSTGRES_USER=hrms
POSTGRES_PASSWORD=hrms_secret
POSTGRES_DB=hrms

# ── Backend ──
DATABASE_URL=postgresql://hrms:hrms_secret@db:5432/hrms
ALLOWED_ORIGINS=http://localhost:3000

# ── Frontend ──
REACT_APP_API_URL=http://localhost:8000/api
```

> **Note:** The `DATABASE_URL` host is `db` (the Docker service name). For local development without Docker, change it to `localhost` and adjust the port.

### 3. Build & Start (Docker)

```bash
docker compose up --build
```

| Service    | URL                        |
| ---------- | -------------------------- |
| Frontend   | http://localhost:3000      |
| Backend    | http://localhost:8000      |
| API Docs   | http://localhost:8000/docs |
| PostgreSQL | `localhost:5433`           |

To stop:

```bash
docker compose down          # keep data
docker compose down -v       # remove data volume too
```

### 3 (alt). Run Without Docker

**Backend:**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt        # or: uv pip install -r requirements.txt
export DATABASE_URL=postgresql://<user>@localhost:5432/hrms
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm start          # runs on http://localhost:3000
```

---

## Assumptions & Limitations

| #   | Item                                      | Details                                                                                                                                                                                                      |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Single admin role**                     | There is no role-based access control. The app assumes a single admin user. The Login page is wired but authentication is not yet enforced on API routes.                                                    |
| 2   | **No password hashing / JWT enforcement** | The `/api/login` endpoint and token schemas exist in code, but the backend does not currently issue or validate JWT tokens. All API routes are publicly accessible.                                          |
| 3   | **Auto-created tables**                   | Database tables are created automatically on startup via `Base.metadata.create_all()`. This is fine for development but should be replaced with a migration tool like **Alembic** in production.             |
| 4   | **Unpinned dependencies**                 | `requirements.txt` lists packages without version pins (e.g. `fastapi` instead of `fastapi==0.115.0`). Builds are reproducible via Docker layer caching, but pinning versions is recommended for production. |
| 5   | **Render cold starts**                    | The backend is deployed on Render's free tier. After ~15 minutes of inactivity the service spins down, so the first request may take ~30 seconds to respond.                                                 |
| 6   | **No pagination**                         | The employee list and attendance records endpoints return all rows. For large datasets, server-side pagination should be added.                                                                              |
| 7   | **Attendance is date-only**               | The system tracks one status per employee per day (Present / Absent). It does not record clock-in / clock-out times.                                                                                         |
| 8   | **No edit for attendance**                | Once attendance is marked for a date, it cannot be updated or deleted through the UI or API.                                                                                                                 |
