# Docker Setup Guide

## Quick Start

### Option 1: n8n Only (Recommended for Local Dev)

If you want to run only n8n in Docker and keep the Next.js app running locally:

```bash
# Start only n8n service
docker-compose up -d n8n

# Update .env.local to use localhost (default is already set)
# N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

Then run your Next.js app locally:
```bash
npm run dev
```

n8n will be available at `http://localhost:5678`

### Option 2: Full Stack in Docker

If you want both Next.js and n8n running in Docker:

```bash
# Start all services (uncomment the 'app' service in docker-compose.yml first)
docker-compose up -d

# Or build and start:
docker-compose up -d --build
```

Your app will be available at `http://localhost:3000`
n8n will be available at `http://localhost:5678`

## Configuration

### Local Development (Next.js running locally)
Set this in `.env.local`:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

### Docker Compose (Both in same Docker network)
Set this in `.env.local` or use `.env.docker`:
```env
N8N_WEBHOOK_URL=http://n8n:5678/webhook
```

### Mixed Setup (Next.js local, n8n in Docker)
On Windows/Mac with Docker Desktop:
```env
N8N_WEBHOOK_URL=http://host.docker.internal:5678/webhook
```

On Linux:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook
# Or use the Docker host IP
N8N_WEBHOOK_URL=http://172.17.0.1:5678/webhook
```

## Database Setup (Optional)

The docker-compose includes PostgreSQL for persistent n8n data. To use it:

1. Update the n8n service environment in `docker-compose.yml`:
```yaml
environment:
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=postgres
  - DB_POSTGRESDB_USER=n8n
  - DB_POSTGRESDB_PASSWORD=n8n_password_change_me
  - DB_POSTGRESDB_DATABASE=n8n
```

2. Ensure postgres service is enabled in docker-compose.yml

## Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f n8n

# View app logs
docker-compose logs -f app

# Stop and remove everything
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Access n8n shell
docker-compose exec n8n /bin/sh

# Check service health
docker-compose ps
```

## Troubleshooting

### Connection Refused Error
1. Verify n8n is running: `docker-compose ps`
2. Check logs: `docker-compose logs n8n`
3. Ensure correct URL in `.env.local`
4. Wait 30-40 seconds for n8n to fully start (has healthcheck)

### Cannot Find Service
- Make sure all services are on the same network (`tkraft-network`)
- Service names must match: `n8n` (lowercase)
- Use `docker network ls` to verify network exists

### Port Already in Use
```bash
# Find what's using port 5678
netstat -ano | findstr :5678

# Change port in docker-compose.yml:
ports:
  - "5679:5678"  # Use 5679 instead
```

### Next.js Build Fails in Docker
```bash
# Rebuild without cache
docker-compose build --no-cache app

# Check build logs
docker-compose build app 2>&1 | tail -50
```

## File Structure

```
docker-compose.yml    # Services configuration
Dockerfile            # Next.js app containerization
.dockerignore        # Files to exclude from Docker build
.env.docker          # Docker-specific environment config
.env.local           # Local development config
```
