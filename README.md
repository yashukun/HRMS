# HRMS – Human Resource Management System

A full-stack HRMS built with **FastAPI**, **React**, and **PostgreSQL**, containerized with Docker.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React, React Router, Axios
- **Database:** PostgreSQL 16
- **Containerization:** Docker & Docker Compose

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

### Run

```bash
# Clone the repo
git clone https://github.com/yashukun/HRMS.git
cd HRMS

# Start all services
docker compose up --build
```

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:3000    |
| Backend  | http://localhost:8000    |
| Database | localhost:5433          |

### Environment Variables

Copy `.env` in the project root to configure database credentials, backend URL, etc. See `.env` for all available variables.

## Project Structure

```
├── backend/        # FastAPI app
├── frontend/       # React app
├── docker-compose.yml
└── .env
```
