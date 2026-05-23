# AWS Deployment Guide

This project is Docker-ready and can be deployed to AWS using EC2 for application containers and RDS PostgreSQL for the managed database.

## Target AWS Architecture

- EC2 Ubuntu instance
- Docker and Docker Compose installed on EC2
- RDS PostgreSQL database
- Backend Spring Boot container
- Frontend Nginx container
- Security group rules for HTTP, SSH, frontend, backend, and database access

## Recommended Production Layout

```text
User Browser
    ↓
EC2 Public IP / Domain
    ↓
Frontend Nginx Container
    ↓
Spring Boot Backend Container
    ↓
AWS RDS PostgreSQL