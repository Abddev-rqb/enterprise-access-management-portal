
# Enterprise Access Management Portal — Troubleshooting Notes

## 1. Admin Login Failed

### Problem

```text
Invalid email or password
````

### Cause

The seeded BCrypt password hash did not match the demo password.

### Fix

Updated the admin user's BCrypt password hash in PostgreSQL for:

```text
admin@accessportal.com / admin123
```

## 2. Frontend CORS Error

### Problem

```text
CORS request did not succeed
```

### Cause

Frontend was running on a different Vite port than the backend CORS allowlist.

### Fix

Backend CORS configuration was updated to allow:

```text
http://localhost:5173
http://localhost:5174
http://localhost:3000
```

Spring Security was also configured to allow OPTIONS preflight requests.

## 3. Sidebar Active Text Not Visible

### Problem

Sidebar text became invisible after clicking active menu items.

### Cause

Active route styling did not provide enough contrast.

### Fix

Updated AppLayout active menu styling with dark background and white text.

## 4. Port 8080 Already in Use

### Problem

```text
Web server failed to start. Port 8080 was already in use.
```

### Cause

Docker backend was already using port 8080 while trying to run local Spring Boot.

### Fix

Used only one mode at a time:

```text
Docker mode: frontend 3000, backend 8080
Local dev mode: frontend 5173, backend 8080
```

## 5. PostgreSQL Port 5432 Already in Use

### Problem

```text
failed to bind host port 0.0.0.0:5432
```

### Cause

Local PostgreSQL was already using port 5432.

### Fix

Changed Docker PostgreSQL host port mapping from:

```text
5432:5432
```

to:

```text
5433:5432
```

Backend still connects internally using:

```text
postgres:5432
```

## 6. Terraform Templatefile Error

### Problem

Terraform failed due to invalid character in `user_data.sh`.

### Cause

Shell syntax such as `${UBUNTU_CODENAME:-$VERSION_CODENAME}` was interpreted as Terraform template syntax.

### Fix

Escaped shell variable interpolation using:

```text
$${...}
```

## 7. Terraform No Default VPC Error

### Problem

```text
VPCIdNotSpecified: No default VPC for this user
```

### Cause

AWS account/region did not have a default VPC.

### Fix

Terraform was updated to create:

```text
Custom VPC
Public subnet
Internet Gateway
Route table
Route table association
Security group
```

## 8. EC2 SSH Timeout

### Problem

```text
ssh: connect to host ... port 22: Connection timed out
```

### Cause

The security group allowed an old public IP address.

### Fix

Updated `allowed_ssh_cidr` in Terraform using the current public IP:

```bash
curl https://checkip.amazonaws.com
```

Then ran:

```bash
terraform apply
```

## 9. GitHub Clone Failed on EC2

### Problem

```text
fatal: could not read Username for 'https://github.com'
```

### Cause

GitHub repo was private, not pushed, or URL was incorrect.

### Fix

Pushed the repository to GitHub and used the correct repo URL in Terraform variables.

## 10. AWS Frontend Login Failed

### Problem

Frontend opened on AWS but login failed.

### Cause

Frontend was calling an incorrect backend URL from the browser.

### Fix

Changed frontend API base URL to:

```text
/api
```

Configured Nginx reverse proxy:

```text
/api → backend:8080/api
```

## 11. Flyway Checksum Mismatch

### Problem

```text
Migration checksum mismatch for migration version 3
```

### Cause

An already-applied Flyway migration file was modified.

### Fix

Restored the original V3 migration and added new changes in V4.

Rule:

```text
Never edit already-applied Flyway migrations.
Always create a new migration file: V4, V5, V6...
```

## 12. Backend Container Restarting

### Problem

Backend container kept restarting and localhost:8080 failed.

### Cause

Spring Boot failed during startup because Flyway migration validation failed.

### Fix

Checked backend logs:

```bash
docker compose logs backend --tail=200
```

Fixed Flyway migration checksum issue and rebuilt Docker.

## 13. Local Docker vs EC2 Deployment Workflow

Correct workflow:

```text
Change code locally
Commit changes
Push to GitHub
SSH into EC2
Run git pull origin main
Run docker compose up --build -d
Test EC2 URL
```
---

