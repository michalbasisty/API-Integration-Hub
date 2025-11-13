# PulseAPI - Getting Started Guide

This guide walks you through building and testing PulseAPI with all services connected.

## Prerequisites

- **Docker & Docker Compose** - For containerized services
- **Node.js 20+** - For Angular and React Native
- **Go 1.21+** - For the AI service (optional if using Docker)
- **Git** - For version control

## Quick Start (All Services with Docker)

### 1. Start All Services

```bash
cd /f:/projects/API\ Integration\ Hub
docker-compose up -d
```

Wait 30 seconds for services to initialize.

### 2. Verify Services Are Running

```bash
docker-compose ps
```

You should see 5 containers:
- `pulseapi-backend` ✅
- `pulseapi-web` ✅
- `pulseapi-ai-service` ✅
- `pulseapi-postgres` ✅
- `pulseapi-redis` ✅

### 3. Test Service Connectivity

#### Backend Health Check
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "pulseapi-backend",
  "timestamp": "2025-01-01T12:00:00Z",
  "message": "Backend is running"
}
```

#### Backend Status Check
```bash
curl http://localhost:8000/api/status
```

Expected response:
```json
{
  "status": "ok",
  "service": "pulseapi-backend",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

#### AI Service Health Check
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "pulseapi-ai-service",
  "timestamp": "2025-01-01T12:00:00Z",
  "message": "AI service is running"
}
```

#### AI Service Status Check
```bash
curl http://localhost:8001/status
```

Expected response:
```json
{
  "status": "ok",
  "service": "pulseapi-ai-service",
  "redis": "connected",
  "backend": "connected",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### 4. Access the Web Dashboard

Open your browser: **http://localhost:4200**

You should see:
- Dashboard with system status cards
- Backend API connection indicator
- Database and Redis connection status

### 5. Test Service-to-Service Communication

#### Backend → Database
```bash
docker-compose logs backend
```
Look for: `database connected` or `pdoException`

#### Backend → Redis
```bash
docker-compose logs backend
```
Look for: `redis connected`

#### AI Service → Backend
```bash
docker-compose logs ai-service
```
Look for: `backend connected` or connection errors

#### AI Service → Redis
```bash
docker-compose logs ai-service
```
Look for: `redis connected`

#### Web → Backend (via Nginx proxy)
```bash
curl http://localhost:4200/api/health
```
Should proxy to backend and return health status.

## Common Issues & Fixes

### Issue: "Connection refused" on localhost:8000
**Solution:**
```bash
docker-compose restart backend
docker-compose logs backend
```

### Issue: Database connection failed
**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Restart database
docker-compose restart postgres
docker-compose restart backend
```

### Issue: Angular not loading (blank page)
**Solution:**
```bash
docker-compose restart web
# Clear browser cache (Ctrl+Shift+Delete)
```

### Issue: AI service can't reach backend
**Solution:**
```bash
# Check AI service logs
docker-compose logs ai-service

# Restart both
docker-compose restart backend ai-service
```

## Development Without Docker

### Setup Backend (Symfony)

```bash
cd backend
# Copy environment
cp .env.example .env

# Install dependencies
composer install

# Run development server
php -S 0.0.0.0:8000 -t public
```

### Setup Web (Angular)

```bash
cd web
# Install dependencies
npm install

# Start dev server
npm start
```

Visit: http://localhost:4200

### Setup AI Service (Go)

```bash
cd ai-service
# Run
go run main.go
```

### Setup Mobile (React Native)

```bash
cd mobile
npm install
npm start

# In another terminal:
npm run android  # or npm run ios
```

## Testing Inter-Service Communication

### Test 1: Web Dashboard Loads Backend Data

1. Open http://localhost:4200
2. Check "Dashboard" - should show service status
3. Open browser DevTools (F12)
4. Go to Network tab
5. Should see requests to `/api/health` and `/api/status`
6. Check responses - should be 200 OK

### Test 2: Backend Connects to Database

```bash
curl http://localhost:8000/api/status
```

Response should include:
```json
{
  "database": "connected",
  "redis": "connected"
}
```

### Test 3: AI Service Analyzes Metrics

```bash
curl -X POST http://localhost:8001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected response:
```json
{
  "id": "uuid-here",
  "status": "completed",
  "message": "Analysis completed",
  "anomalies_detected": 0,
  "confidence": 0.85
}
```

### Test 4: Mobile App Fetches Data

After running the mobile app:
1. Tap "Dashboard" tab
2. Should display status cards
3. Tap "Refresh" button
4. Should fetch from http://localhost:8000/api/status

## Architecture Verification

```
User Browser
    ↓
http://localhost:4200 (Angular)
    ↓
Nginx Proxy
    ↓
http://localhost:8000 (Backend PHP)
    ├→ PostgreSQL (localhost:5432)
    └→ Redis (localhost:6379)

AI Service (Go)
    ↓
http://localhost:8001/health
    ↓
Backend (check services)
Redis (check metrics)
```

## Next Steps

1. ✅ Verify all services run
2. ✅ Confirm inter-service connectivity
3. ⬜ Implement core monitoring (Stage 2)
   - Create API endpoint checker
   - Store metrics in database
4. ⬜ Build dashboard features (Stage 3)
   - Add charts for metrics
   - Display uptime history
5. ⬜ Deploy with Docker Compose

## Debugging Commands

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f web

# Execute command in container
docker-compose exec backend php -v
docker-compose exec postgres psql -U pulseapi -d pulseapi -c "\dt"

# Rebuild a service
docker-compose up -d --build backend

# Stop all services
docker-compose down

# Remove all data (fresh start)
docker-compose down -v
```

## Health Check URLs

| Service | Health URL | Status URL |
|---------|-----------|-----------|
| Backend | http://localhost:8000/api/health | http://localhost:8000/api/status |
| AI Service | http://localhost:8001/health | http://localhost:8001/status |
| Web | http://localhost:4200 | (embedded in dashboard) |
| Database | Via backend logs | Via backend status |
| Redis | Via backend logs | Via backend status |

All services should report "connected" for their dependencies.
