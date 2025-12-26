# API Documentation – Multi-Tenant SaaS Platform

This document describes all REST APIs exposed by the Multi-Tenant SaaS Platform.
All APIs follow a consistent response format:

## Standard Response Format
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### Authentication Overview

Authentication is handled using JWT (JSON Web Tokens).

Token must be sent in the Authorization header:

Authorization: Bearer <JWT_TOKEN>


### Token payload contains:
```
{
  "userId": "uuid",
  "tenantId": "uuid | null",
  "role": "super_admin | tenant_admin | user"
}
```

## AUTHENTICATION APIs
### API 1: Register Tenant

Method: POST
Endpoint: /api/auth/register-tenant
Auth Required: ❌ No
```
Request Body
{
  "tenantName": "Test Company",
  "subdomain": "testco",
  "adminEmail": "admin@testco.com",
  "adminPassword": "Test@123",
  "adminFullName": "Admin User"
}
```
```
Success Response (201)
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid",
    "subdomain": "testco"
  }
}
```
### API 2: Login

Method: POST
Endpoint: /api/auth/login
Auth Required: ❌ No
```
Request Body
{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}
```

Success Response
```
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "expiresIn": 86400
  }
}
```
### API 3: Get Current User

Method: GET
Endpoint: /api/auth/me
Auth Required: ✅ Yes

Success Response
```
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@demo.com",
    "role": "tenant_admin",
    "tenant": {
      "id": "uuid",
      "subdomain": "demo"
    }
  }
}
```
### API 4: Logout

Method: POST
Endpoint: /api/auth/logout
Auth Required: ✅ Yes

Success Response
```
{
  "success": true,
  "message": "Logged out successfully"
}
```
TENANT MANAGEMENT APIs
### API 5: Get Tenant Details

Method: GET
Endpoint: /api/tenants/:tenantId
Auth Required: ✅ Yes
Role: Tenant Admin / Super Admin

### API 6: Update Tenant

Method: PUT
Endpoint: /api/tenants/:tenantId
Auth Required: ✅ Yes
Role: Tenant Admin (name only), Super Admin (all fields)

### API 7: List All Tenants

Method: GET
Endpoint: /api/tenants
Auth Required: ✅ Yes
Role: Super Admin

USER MANAGEMENT APIs
### API 8: Add User

Method: POST
Endpoint: /api/tenants/:tenantId/users
Auth Required: ✅ Yes
Role: Tenant Admin

Request Body
```
{
  "email": "user@demo.com",
  "password": "User@123",
  "fullName": "Demo User",
  "role": "user"
}
```
### API 9: List Users

Method: GET
Endpoint: /api/tenants/:tenantId/users
Auth Required: ✅ Yes

### API 10: Update User

Method: PUT
Endpoint: /api/users/:userId
Auth Required: ✅ Yes

### API 11: Delete User

Method: DELETE
Endpoint: /api/users/:userId
Auth Required: ✅ Yes
Role: Tenant Admin

PROJECT MANAGEMENT APIs
### API 12: Create Project

Method: POST
Endpoint: /api/projects
Auth Required: ✅ Yes

Request Body
```
{
  "name": "Website Redesign",
  "description": "UI overhaul"
}
```
### API 13: List Projects

Method: GET
Endpoint: /api/projects
Auth Required: ✅ Yes

### API 14: Update Project

Method: PUT
Endpoint: /api/projects/:projectId
Auth Required: ✅ Yes

### API 15: Delete Project

Method: DELETE
Endpoint: /api/projects/:projectId
Auth Required: ✅ Yes

TASK MANAGEMENT APIs
### API 16: Create Task

Method: POST
Endpoint: /api/projects/:projectId/tasks
Auth Required: ✅ Yes

Request Body
```
{
  "title": "Design homepage",
  "priority": "high"
}
```
### API 17: List Tasks

Method: GET
Endpoint: /api/projects/:projectId/tasks
Auth Required: ✅ Yes

### API 18: Update Task Status

Method: PATCH
Endpoint: /api/tasks/:taskId/status
Auth Required: ✅ Yes

### API 19: Update Task

Method: PUT
Endpoint: /api/tasks/:taskId
Auth Required: ✅ Yes

Health Check API

Method: GET
Endpoint: /api/health
Auth Required: ❌ No

Response
```
{
  "status": "ok",
  "database": "connected"
}
```