# Enterprise Access Management Portal — Technical Specification

## 1. Project Overview

Enterprise Access Management Portal is a secure full-stack IAM-style admin console that allows administrators to manage users, roles, permissions, sessions, dashboard metrics, and audit logs.

The application is built using Java Spring Boot, React, PostgreSQL, Docker, Terraform, and AWS EC2.

## 2. Architecture

```text
React Frontend
    ↓ Axios / JSON REST API
Nginx Reverse Proxy
    ↓ /api forwarding
Spring Boot Backend
    ↓ Spring Data JPA / Hibernate
PostgreSQL Database
````

## 3. Backend Stack

```text
Java 17
Spring Boot
Spring Web
Spring Security
Spring Data JPA
Hibernate
JWT Authentication
Maven
Flyway
PostgreSQL
Swagger / OpenAPI
JUnit 5
Mockito
```

## 4. Frontend Stack

```text
React.js
JavaScript ES6+
JSX
React Hooks
React Router
Axios
Tailwind CSS
Vite
React Hook Form
Zod
Vitest
React Testing Library
```

## 5. Security Design

Authentication is handled using JWT tokens.

Security features:

```text
BCrypt password hashing
JWT token generation
JWT token validation
Stateless backend authentication
Protected Spring Boot APIs
Permission-based access control
Role-based frontend sidebar rendering
Protected React routes
Session tracking
Logout session invalidation
```

## 6. Roles and Permissions

Seeded roles:

```text
ADMIN
MANAGER
AUDITOR
```

Seeded permissions:

```text
USER_CREATE
USER_READ
USER_UPDATE
USER_DELETE
ROLE_ASSIGN
AUDIT_VIEW
DASHBOARD_VIEW
ROLE_MANAGE
PERMISSION_MANAGE
```

## 7. Core Modules

### Authentication Module

```text
Login
Logout
Current authenticated user
JWT token generation
JWT token validation
Session creation
Session invalidation
```

### User Management Module

```text
Create user
View users
Paginated users
Update user
Disable user
Assign role to user
```

### Role Management Module

```text
Create role
Update role
Assign permissions to role
View role permissions
```

### Permission Management Module

```text
View available permissions
Use permissions for access control
Use permissions for frontend menu rendering
```

### Session Management Module

```text
Create session on login
Mark session inactive on logout
View all sessions
View active sessions
Paginated sessions
Track login and logout time
Session expiry audit job
```

### Audit Log Module

```text
Login success
Login failure
Logout
User created
User updated
User disabled
User role assigned
Role created
Role updated
Role permission updated
Session expired
Paginated audit log viewing
```

### Dashboard Module

```text
Total users
Active users
Role count
Recent login count
Recent audit count
Recent activities
```

## 8. REST API Overview

Authentication:

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Users:

```text
GET    /api/users
GET    /api/users/page?page=0&size=10
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

Roles:

```text
GET  /api/roles
GET  /api/roles/{id}
POST /api/roles
PUT  /api/roles/{id}
```

Permissions:

```text
GET /api/permissions
```

Sessions:

```text
GET /api/sessions
GET /api/sessions/active
GET /api/sessions/page?page=0&size=10
```

Audit Logs:

```text
GET /api/audit-logs
GET /api/audit-logs/page?page=0&size=10
```

Dashboard:

```text
GET /api/dashboard
```

## 9. Database Design

Main tables:

```text
users
roles
permissions
role_permissions
audit_logs
user_sessions
```

## 10. SQL Optimization

Flyway migrations add indexes for frequently queried columns.

Indexed columns include:

```text
users.email
users.enabled
users.role_id
users.created_at
roles.name
permissions.name
audit_logs.created_at
audit_logs.action
audit_logs.actor_email
user_sessions.active
user_sessions.login_time
user_sessions.user_id
```

## 11. Deployment

Local deployment:

```text
Docker Compose
PostgreSQL container
Spring Boot backend container
React/Nginx frontend container
```

AWS deployment:

```text
Terraform provisions AWS EC2 infrastructure
Custom VPC
Public subnet
Internet Gateway
Route table
Security group
EC2 instance
Docker and Docker Compose installed through user_data
Application pulled from GitHub and started using Docker Compose
```

## 12. Testing

Backend:

```text
JUnit 5
Mockito
Service-layer tests
Authentication/session-related tests
```

Frontend:

```text
Vitest
React Testing Library
Login page tests
Protected route tests
Auth storage tests
```

## 13. CI/CD

GitHub Actions workflow runs:

```text
Backend tests
Backend build
Frontend tests
Frontend build
Docker Compose build
```

## 14. Production Notes

The deployed AWS version uses EC2 with Docker Compose and PostgreSQL running as a container.

RDS PostgreSQL is not used in this version because the project requirement and resume claim are satisfied by AWS EC2, Docker, and PostgreSQL deployment.
EOF

````

---



