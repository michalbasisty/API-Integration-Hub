# PulseAPI - Project Structure

```
/f:/projects/API Integration Hub/
│
├── docker-compose.yml          # Main orchestration file (5 services)
├── README.md                   # Project overview
├── GETTING_STARTED.md          # Quick start & testing guide
├── PROJECT_STRUCTURE.md        # This file
├── .gitignore                  # Git ignore rules
│
├── backend/                    # Symfony REST API (PHP 8.3)
│   ├── Dockerfile
│   ├── composer.json
│   ├── .env.example
│   ├── public/
│   │   └── index.php          # Simple health check endpoints
│   └── var/                   # Cache & logs (auto-created)
│
├── web/                        # Angular 20 Dashboard
│   ├── Dockerfile
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── nginx.conf              # Production nginx config
│   ├── .dockerignore
│   ├── src/
│   │   ├── main.ts            # Bootstrap
│   │   ├── index.html
│   │   ├── styles.scss
│   │   └── app/
│   │       ├── app.component.ts        # Root component
│   │       ├── app.routes.ts           # Routing
│   │       ├── services/
│   │       │   └── api.service.ts      # HTTP calls to backend
│   │       └── pages/
│   │           ├── dashboard/          # Main dashboard
│   │           │   └── dashboard.component.ts
│   │           └── status/             # System status page
│   │               └── status.component.ts
│   └── dist/                  # Build output (auto-created)
│
├── ai-service/                 # Go AI Microservice
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── main.go                 # Health + Status + Analyze endpoints
│   └── vendor/                 # Dependencies (auto-created)
│
├── mobile/                      # React Native Mobile App
│   ├── package.json
│   ├── index.js
│   ├── app.json
│   ├── App.tsx                 # Main app with bottom tabs
│   └── node_modules/           # Dependencies (auto-created)
│
└── scripts/                     # Utility scripts (optional)
    ├── test-connectivity.sh
    └── setup.sh
```

## Service Ports & Technologies

| Service | Port | Technology | Container Name |
|---------|------|-----------|-----------------|
| Web Dashboard | 4200 | Angular 20 + Nginx | pulseapi-web |
| Backend API | 8000 | Symfony 7 + PHP 8.3 | pulseapi-backend |
| AI Service | 8001 | Go 1.21 | pulseapi-ai-service |
| PostgreSQL | 5432 | PostgreSQL 16 | pulseapi-postgres |
| Redis | 6379 | Redis 7 | pulseapi-redis |

## Key Files by Service

### Backend (PHP Symfony)
- `backend/public/index.php` - Entry point with health/status endpoints
- `backend/composer.json` - PHP dependencies
- `backend/.env.example` - Environment template

### Web (Angular)
- `web/src/app/app.component.ts` - Root layout with navbar
- `web/src/app/pages/dashboard/dashboard.component.ts` - Main dashboard
- `web/src/app/pages/status/status.component.ts` - System status page
- `web/src/app/services/api.service.ts` - HTTP service for backend calls

### AI Service (Go)
- `ai-service/main.go` - All endpoints (health, status, analyze)

### Mobile (React Native)
- `mobile/App.tsx` - Full app with 3 tabs (Dashboard, Alerts, Settings)

## Dependencies

### Frontend (Angular)
- `@angular/core` ^20.0.0
- `@angular/router` ^20.0.0
- `axios` ^1.6.0
- `chart.js` ^4.4.0
- `ng2-charts` ^4.1.0

### Backend (Symfony)
- `symfony/framework-bundle` ^7.0
- `symfony/http-foundation` ^7.0
- `doctrine/orm` ^2.17
- `doctrine/doctrine-bundle` ^2.11
- `symfony/redis-pack` ^1.0

### AI Service (Go)
- `github.com/go-redis/redis/v8` v8.11.5
- `github.com/google/uuid` v1.5.0

### Mobile (React Native)
- `react` 18.2.0
- `react-native` 0.74.0
- `@react-navigation/native` ^6.1.12
- `axios` ^1.6.0

## Build Process

### Docker Build Flow

```
docker-compose up -d
    ├→ backend Dockerfile
    │   └─ Copies composer.json
    │   └─ Installs PHP dependencies
    │   └─ Copies PHP source
    │   └─ Starts on port 8000
    │
    ├→ web Dockerfile
    │   └─ Multi-stage build
    │   └─ npm ci (install dependencies)
    │   └─ ng build (compile Angular)
    │   └─ Serves with Nginx on port 4200
    │
    ├→ ai-service Dockerfile
    │   └─ Multi-stage Go build
    │   └─ Compiles binary
    │   └─ Runs binary on port 8001
    │
    ├→ postgres (pulled from Docker Hub)
    │   └─ Runs on port 5432
    │
    └→ redis (pulled from Docker Hub)
        └─ Runs on port 6379
```

### Local Development Build

```bash
cd backend && composer install
cd web && npm install && npm start
cd ai-service && go mod download && go run main.go
cd mobile && npm install && npm start
```

## Service Communication Flow

```
┌─────────────────┐
│ Browser (User)  │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────────────────────────┐
│ Angular Web Dashboard (4200)         │
│ - Displays status cards              │
│ - Charts for metrics (future)        │
└────────┬────────────────────────────┘
         │ /api/* requests
         ↓
┌──────────────────────────────────────┐
│ Nginx (proxy) (4200)                 │
└────────┬────────────────────────────┘
         │ forwards to /api/
         ↓
┌──────────────────────────────────────┐
│ Symfony Backend (8000)               │
│ - /api/health                        │
│ - /api/status                        │
│ - /api/projects                      │
└────┬───────────────────┬─────────────┘
     │                   │
     ↓                   ↓
┌──────────────┐  ┌─────────────┐
│ PostgreSQL   │  │ Redis Cache │
│ (5432)       │  │ (6379)      │
└──────────────┘  └─────────────┘

┌─────────────────────────────────────┐
│ Go AI Service (8001)                │
│ - /health                           │
│ - /status (checks backend + redis)  │
│ - /api/analyze                      │
└────┬───────────────────┬────────────┘
     │                   │
     ↓                   ↓
 Backend            Redis Cache
  (8000)             (6379)

┌──────────────────────────────────────┐
│ React Native Mobile App              │
│ - Dashboard (Dashboard, Alerts, etc) │
│ - Calls http://backend:8000/api/*    │
└──────────────────────────────────────┘
```

## Database Schema (PostgreSQL)

Current setup uses basic schema. Future additions:
```sql
-- Monitors (APIs to monitor)
CREATE TABLE monitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  url VARCHAR(255),
  interval INT,
  created_at TIMESTAMP
);

-- Metrics (Check results)
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  monitor_id INT,
  status_code INT,
  response_time FLOAT,
  checked_at TIMESTAMP,
  FOREIGN KEY (monitor_id) REFERENCES monitors(id)
);

-- Alerts
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  monitor_id INT,
  type VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP
);
```

## Environment Variables

### Backend (.env)
```
APP_ENV=dev
APP_DEBUG=1
DATABASE_URL=postgresql://pulseapi:dev_password@postgres:5432/pulseapi
REDIS_URL=redis://redis:6379
```

### AI Service (ENV)
```
BACKEND_URL=http://backend:8000
REDIS_URL=redis://redis:6379
```

### Web
- API calls proxy through Nginx to backend

## Testing Checklist

- [x] All Docker containers start
- [ ] Backend health endpoint responds
- [ ] Backend status shows connected DB & Redis
- [ ] AI service health endpoint responds
- [ ] AI service status shows connected backend & Redis
- [ ] Web dashboard loads at localhost:4200
- [ ] Web dashboard displays system status
- [ ] Mobile app builds and runs
- [ ] Mobile app fetches data from backend
- [ ] All services can restart without issues

## Performance Considerations

### Current Stage (MVP)
- Single backend PHP process
- Redis for caching (minimal usage)
- PostgreSQL with no sharding
- Basic HTTP polling in mobile app

### Future Optimizations
- Kubernetes for horizontal scaling
- Load balancing with HAProxy
- Database replication
- WebSocket for real-time updates
- Caching strategies
- CDN for static assets

## Security (To Implement)

- [ ] JWT authentication
- [ ] HTTPS/TLS
- [ ] Rate limiting
- [ ] CORS headers
- [ ] SQL injection prevention (use prepared statements)
- [ ] Secrets management (.env in docker)
- [ ] Input validation
