# Technical Specification
---
### SECTION 1: Project Structure

## Backend Project Structure

```
backend/
├── src/
│   ├── controllers/    # Handles request/response logic for APIs
│   ├── routes/         # Defines API routes and maps them to controllers
│   ├── models/         # Database models and ORM definitions
│   ├── middleware/     # Authentication, authorization, tenant isolation
│   ├── services/       # Business logic and reusable services
│   ├── utils/          # Utility functions (JWT, hashing, logging)
│   ├── config/         # Database, environment, and app configuration
│   └── app.js          # Express app setup
│
├── migrations/         # Database migration files
├── seeds/              # Seed data scripts
├── tests/              # Unit and integration tests
├── Dockerfile          # Backend Docker configuration
├── package.json        # Backend dependencies and scripts
└── server.js           # Application entry point
```

The backend follows a layered architecture. Controllers handle HTTP requests, services contain business logic, and models manage database interactions. Middleware ensures authentication, authorization, and tenant isolation across all API endpoints.

---

## Frontend Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages (Login, Dashboard, Projects)
│   ├── services/       # API communication logic
│   ├── context/        # Authentication and global state management
│   ├── hooks/          # Custom React hooks
│   ├── routes/         # Protected and public route definitions
│   ├── styles/         # Global and component-level styles
│   └── App.js          # Main application component
│
├── public/             # Static assets
├── Dockerfile          # Frontend Docker configuration
├── package.json        # Frontend dependencies
└── index.js            # Application entry point
```
The frontend is built using a component-based architecture. Pages represent route-level components, while reusable UI elements are stored in the components directory. Authentication state is managed globally using context.

---
### SECTION 2: Development Setup Guide

## Development Setup Guide

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Docker and Docker Compose
- Git

### Environment Variables
Backend Environment Variables:
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- JWT_SECRET
- JWT_EXPIRES_IN
- FRONTEND_URL

Frontend Environment Variables:
- REACT_APP_API_URL

All sensitive configuration is managed through environment variables to ensure security and flexibility across environments.

### Installation Steps
1. Clone the repository from GitHub.
2. Navigate to the project root directory.
3. Ensure Docker is running.

### Running Locally

The entire application can be started using Docker Compose with a single command:

docker-compose up -d

This command starts the database, backend API, and frontend application. All migrations and seed data are automatically applied during startup.

### Running Tests

Backend tests can be executed using:

npm test

Tests include unit tests for business logic and integration tests for API endpoints.
