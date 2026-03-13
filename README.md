# HRMS – Human Resource Management System

A full-stack **Human Resource Management System** built with **FastAPI**, **React**, and **PostgreSQL**, fully containerized with **Docker Compose**.

### Live Demo

| Service         | URL                              |
| --------------- | -------------------------------- |
| **Frontend**    | https://hrms-ten-silk.vercel.app |
| **Backend API** | https://hrms-tcl3.onrender.com   |

> Frontend is deployed on **Vercel**, backend & database on **Render**.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Run with Docker](#run-with-docker)
  - [Run Locally (without Docker)](#run-locally-without-docker)
- [API Reference](#api-reference)
  - [Employees](#employees)
  - [Attendance](#attendance)
- [Frontend Pages](#frontend-pages)
- [Deployment](#deployment)
- [License](#license)

---

## Features

- **Employee Management** – Create, list, update, and delete employees
- **Attendance Tracking** – Mark daily attendance (Present / Absent) per employee
- **Attendance Summary** – View total present days with optional date-range filtering
- **Duplicate Prevention** – Unique email constraint; one attendance record per employee per day
- **Employee Search** – Autocomplete dropdown that filters by name, email, or ID
- **Responsive UI** – Clean dashboard with stats, department badges, and a mobile-friendly layout

---

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| **Backend**    | Python 3.12, FastAPI, SQLAlchemy, Pydantic |
| **Frontend**   | React 19, React Router 7, Axios            |
| **Database**   | PostgreSQL 16 (Alpine)                     |
| **Packaging**  | uv (fast Python package installer)         |
| **Containers** | Docker, Docker Compose                     |

---

## Architecture

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Frontend   │──────▶│   Backend    │──────▶│  PostgreSQL  │
│  React :3000 │ HTTP  │ FastAPI :8000│  SQL  │   DB :5432   │
└──────────────┘       └──────────────┘       └──────────────┘
```

- **Frontend** → Axios calls to `/api/*` endpoints
- **Backend** → SQLAlchemy ORM against a Postgres database
- All three services are orchestrated by Docker Compose

---

## Project Structure

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

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose **v2+**
- _(Optional for local dev)_ Python 3.12+, Node.js 18+, PostgreSQL 16

### Environment Variables

Create a `.env` file in the project root:

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

> **Note:** The `DATABASE_URL` host is `db` (Docker service name). For local development, replace it with `localhost` and adjust the port if needed.

### Run with Docker

```bash
# Clone the repository
git clone https://github.com/yashukun/HRMS.git
cd HRMS

# Create your .env file (see above)

# Build & start all services
docker compose up --build
```

| Service    | URL                        |
| ---------- | -------------------------- |
| Frontend   | http://localhost:3000      |
| Backend    | http://localhost:8000      |
| API Docs   | http://localhost:8000/docs |
| PostgreSQL | `localhost:5433`           |

To stop everything:

```bash
docker compose down
```

To stop **and** remove the database volume:

```bash
docker compose down -v
```

### Run Locally (without Docker)

**Backend:**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt        # or: uv pip install -r requirements.txt
export DATABASE_URL=postgresql://yash@localhost:5432/hrms
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm start          # runs on http://localhost:3000
```

---

## API Reference

Base URL: `http://localhost:8000`

### Employees

| Method   | Endpoint              | Description                  |
| -------- | --------------------- | ---------------------------- |
| `POST`   | `/api/employees`      | Create a new employee        |
| `GET`    | `/api/employees`      | List all employees           |
| `PUT`    | `/api/employees/{id}` | Update employee (partial)    |
| `DELETE` | `/api/employees/{id}` | Delete employee + attendance |

**Create / Update body:**

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "department": "Engineering"
}
```

### Attendance

| Method | Endpoint                                | Description                          |
| ------ | --------------------------------------- | ------------------------------------ |
| `POST` | `/api/attendance`                       | Mark attendance for a date           |
| `GET`  | `/api/attendance/{employee_id}`         | List records (optional date filters) |
| `GET`  | `/api/attendance/{employee_id}/summary` | Count of present days                |

**Query parameters** (GET endpoints):

| Parameter    | Type   | Description            |
| ------------ | ------ | ---------------------- |
| `start_date` | `date` | Filter from this date  |
| `end_date`   | `date` | Filter up to this date |

**Mark attendance body:**

```json
{
  "employee_id": 1,
  "date": "2026-03-13",
  "status": "Present"
}
```

> Interactive API docs are available at **http://localhost:8000/docs** (Swagger UI).

---

## Frontend Pages

| Page           | Route         | Description                                                  |
| -------------- | ------------- | ------------------------------------------------------------ |
| **Dashboard**  | `/`           | Welcome card, employee count, department count, today's date |
| **Employees**  | `/employees`  | Add / delete employees; expand rows to view attendance       |
| **Attendance** | `/attendance` | Mark attendance; search & filter records; view summary       |
| **Login**      | `/login`      | Admin credential form (wired but auth not yet enforced)      |

---

## Deployment

The application is deployed across two platforms:

| Component           | Platform   | URL                              |
| ------------------- | ---------- | -------------------------------- |
| Frontend (React)    | **Vercel** | https://hrms-ten-silk.vercel.app |
| Backend (FastAPI)   | **Render** | https://hrms-tcl3.onrender.com   |
| Database (Postgres) | **Render** | Managed PostgreSQL on Render     |

- **Vercel** auto-deploys the `frontend/` directory on every push to `main`.
- **Render** hosts the FastAPI backend as a Web Service and provisions a managed PostgreSQL database.

> **Note:** Render free-tier services may spin down after inactivity. The first request after idle may take ~30 seconds while the service restarts.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
