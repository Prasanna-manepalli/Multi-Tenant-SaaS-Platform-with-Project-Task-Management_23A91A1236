# Multi-Tenant SaaS Platform – Project & Task Management System

## 1. Project Title and Description

### Project Title
Multi-Tenant SaaS Platform – Project & Task Management System

### Description
This project is a production-ready, multi-tenant SaaS application that allows multiple organizations (tenants) to independently manage users, projects, and tasks with strict data isolation.  
It implements secure authentication, role-based access control (RBAC), subscription plan limits, and full Docker-based deployment.

### Target Audience
- SaaS product developers  
- Full-stack developers  
- Organizations requiring multi-tenant project and task management  

---

## 2. Features List

- Multi-tenant architecture with strict data isolation  
- Tenant registration with unique subdomain support  
- JWT-based authentication and authorization  
- Role-Based Access Control (Super Admin, Tenant Admin, User)  
- Project creation, editing, and deletion per tenant  
- Task management with priority, status, and assignment  
- Subscription plan enforcement (Free, Pro, Enterprise)  
- Secure API access with proper HTTP status codes  
- Health check endpoint for service monitoring  
- Fully Dockerized application with one-command deployment  

---

## 3. Technology Stack

### Frontend
- React (Vite)
- Axios
- React Router DOM

### Backend
- Node.js (v18)
- Express.js
- JWT (JSON Web Tokens)
- bcrypt (password hashing)

### Database
- PostgreSQL 15

### DevOps & Containerization
- Docker
- Docker Compose

---

## 4. Architecture Overview

This system follows a three-tier architecture:

- **Frontend (React):** Handles UI, routing, and API communication  
- **Backend (Node.js + Express):** Exposes REST APIs, handles authentication, authorization, tenant isolation, and business logic  
- **Database (PostgreSQL):** Stores tenant, user, project, and task data with tenant-level isolation  

All services run in Docker containers and communicate using Docker service names.

**Architecture Diagram Location:**  
C:\Users\DELL\Desktop\Gpp\week5Core\docs\images\database-erd.png
C:\Users\DELL\Desktop\Gpp\week5Core\docs\images\system-architecture.png


---

## 5. Installation & Setup

### Prerequisites
- Node.js v18 or higher  
- Docker & Docker Compose  
- Git  

---

### Step-by-Step Local Setup Instructions

#### 1. Clone the Repository
```bash
git clone https://github.com/Prasanna-manepalli/Multi-Tenant-SaaS-Platform-with-Project-Task-Management_23A91A1236

```


### Environment Variables

Ensure the backend contains the following files:

- `.env.example` – Template file with all required environment variables
- `.env` – Committed file with development/test values (required for evaluation)

---

### Start the Application

Run the following command from the **project root directory**:

```bash
docker-compose up -d
```

This single command:

Starts PostgreSQL database

Runs database migrations automatically

Loads seed data automatically

Starts backend and frontend services

---
### How to Run Migrations

✅ Migrations run automatically on backend startup via Docker entrypoint.
No manual command is required.

### How to Seed the Database

✅ Seed data is loaded automatically after migrations when the backend container starts.

---
### How to Start Backend

```
cd backend
npm install
npm run dev
```

### Application Access

- Frontend: http://localhost:3000

- Backend Health Check: http://localhost:5000/api/health

- Expected health response:

```
{
  "status": "ok",
  "database": "connected"
}
```

---
### 6. Environment Variables
- Backend Environment Variables
- Variable	Purpose
- DB_HOST	Database host
- DB_PORT	Database port
- DB_NAME	Database name
- DB_USER	Database username
- DB_PASSWORD	Database password
- JWT_SECRET	Secret key used to sign JWT tokens
- JWT_EXPIRES_IN	Token expiration time
- PORT	Backend server port
- NODE_ENV	Application environment
- FRONTEND_URL	Allowed frontend URL for CORS

- All variables are documented in the .env.example file.

## 7. API Documentation
### Authentication APIs

- POST /api/auth/register-tenant

- POST /api/auth/login

- GET /api/auth/me

- POST /api/auth/logout

### Tenant Management APIs

- GET /api/tenants/:tenantId

- PUT /api/tenants/:tenantId

- GET /api/tenants (Super Admin only)

### User Management APIs

- POST /api/tenants/:tenantId/users

- GET /api/tenants/:tenantId/users

- PUT /api/users/:userId

- DELETE /api/users/:userId

### Project Management APIs

- POST /api/projects

- GET /api/projects

- PUT /api/projects/:projectId

- DELETE /api/projects/:projectId

### Task Management APIs

- POST /api/projects/:projectId/tasks

- GET /api/projects/:projectId/tasks

- PUT /api/tasks/:taskId

- PATCH /api/tasks/:taskId/status

## 8. Demo Video

A complete demo video has been recorded and uploaded to YouTube.

The demo includes:

Project introduction

Architecture walkthrough

Docker-based application startup

Tenant registration and login

User, project, and task management

Multi-tenancy and data isolation demonstration

Code walkthrough (backend and frontend)

### Demo Video Link:
```
https://youtu.be/OQZUu-cyrKA?si=tiRC1lqcaiyMTd6S
```