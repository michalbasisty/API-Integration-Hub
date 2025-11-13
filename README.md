# PulseAPI – AI-Powered API Performance & Reliability Monitor

A full-stack application for monitoring APIs, detecting anomalies, and sending alerts.

## Tech Stack

- **Frontend**: Angular 20 (Dashboard)
- **Mobile**: React Native (Mobile App)
- **Backend**: Symfony 7 (REST API)
- **AI Service**: Go (Anomaly Detection)
- **Database**: PostgreSQL
- **Cache**: Redis

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PHP 8.3+ (for Symfony, if running locally)
- Go 1.21+ (for AI service, if running locally)

### Run Everything with Docker

```bash
docker-compose up -d
```

### Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:8000 | Symfony REST API |
| Web Dashboard | http://localhost:4200 | Angular UI |
| AI Service | http://localhost:8001 | Go anomaly detection |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |

## Project Structure

```
/pulseapi
├── backend/            → Symfony API (Port 8000)
├── web/                → Angular Dashboard (Port 4200)
├── mobile/             → React Native App
├── ai-service/         → Go AI Service (Port 8001)
├── docker-compose.yml
└── README.md
```

## Development Stages

### ✅ Stage 1: Setup & Test Connectivity
1. Create minimal apps in each language
2. Ensure Docker containers start
3. Test inter-service communication
4. Verify database connections

### Stage 2: Core Monitoring
- Implement API endpoint checking
- Store metrics in database

### Stage 3: Dashboard & Mobile
- Display uptime charts
- Show alert notifications

### Stage 4: AI Anomaly Detection
- Analyze metrics for anomalies
- Predict outages

### Stage 5: Alerts & Notifications
- Email, Slack, push alerts

## Commands

### Build & Start
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f web
```

## Testing

- Backend (PHP, Symfony):
  - Requirements: `php >= 8.3`
  - Run: `cd backend && php tests/run.php`
  - Notes: DB test skips if `pdo_pgsql` is missing; Redis test skips unless `ext-redis` is available.

- Web (Angular):
  - Install: `cd web && npm install`
  - Build check: `npm run build`
  - Unit tests (optional): `npm test` (requires Karma + Chrome/Chromium for headless runs)

- Mobile (React Native):
  - Install: `cd mobile && npm ci`
  - Run tests: `npm test`
  - Jest is configured to mock static assets and includes testIDs for key containers.

- AI Service (Go):
  - Requirements: `go >= 1.21`
  - Run tests: `cd ai-service && go test ./...`
  - Endpoints `/health`, `/status`, and `/api/analyze` have basic coverage.

### Rebuild Specific Service
```bash
docker-compose up -d --build backend
```

## Health Checks

Once running, test each service:

```bash
# Backend health
curl http://localhost:8000/api/health

# AI Service health
curl http://localhost:8001/health

# Database connection (from backend logs)
docker-compose logs backend
```

## Functionality Overview

### Core Concepts
- Monitors: Definitions of APIs to check, including `url`, `method`, `expected_status_code`, `timeout`, and `check_interval`.
- Metrics: Check results stored per monitor with `status_code`, `response_time`, `is_success`, `error_message`, and timestamps.
- Uptime Summary: Aggregated uptime metrics per day (success vs total). Computation and persistence are being wired into the checker.
- Alerts: Records of downtime, slow responses, or threshold breaches (planned as part of Stage 2+).

### Backend API (Symfony)
- Health & Status
  - `GET /api/health` → Basic service heartbeat
  - `GET /api/status` → Database and Redis connectivity
- Monitors CRUD
  - `GET /api/monitors` → List active monitors
  - `POST /api/monitors` → Create a monitor
  - `GET /api/monitors/{id}` → Monitor details
  - `PUT /api/monitors/{id}` → Update monitor
  - `DELETE /api/monitors/{id}` → Delete monitor
- Metrics
  - `POST /api/monitors/{id}/check` → Manual check and persist metric
  - `GET /api/monitors/{id}/metrics` → Recent metrics list
  - `GET /api/monitors/{id}/metrics/summary?days=7` → Uptime %, average response time
- Projects (for dashboard listing)
  - `GET /api/projects` → Active monitors mapped to name/status

### Monitoring Flow
- Manual: Trigger a check for a monitor using `POST /api/monitors/{id}/check`.
- Scheduled: Run `php bin/console app:monitor:check` to iterate over active monitors and persist metrics.
- Summaries: The `/metrics/summary` endpoint computes uptime and average response over the last N days.

### Web Dashboard (Angular)
- Dashboard: Shows service health and a projects list mapped from monitors.
- System Status: Displays backend status (DB/Redis connectivity).
- Monitors: Create, list, delete, and manual check monitors.
- Monitor Detail: Displays the monitor metadata, response-time chart (ng2-charts/Chart.js), recent checks, uptime %, and average response time.

### Mobile App (React Native)
- Tabs: Dashboard, Alerts, Settings.
- Dashboard: Fetches backend status from `/api/status` and shows service connectivity.
- Alerts & Settings: Placeholder screens ready for Stage 5 integrations.

### AI Service (Go)
- Endpoints:
  - `GET /health` → Service heartbeat
  - `GET /status` → Static connectivity indicators (to be linked to live checks)
  - `POST /api/analyze` → Returns a sample analysis; will integrate with metrics aggregation
- Planned: Metric aggregation, basic statistical anomaly detection, and prediction endpoint.

### Data Model (Entities)
- `Monitor`: ID (UUID), `userId`, `name`, `url`, `method`, `expectedStatusCode`, `checkInterval`, `timeout`, `isActive`, timestamps.
- `Metric`: ID (UUID), `monitorId`, `statusCode`, `responseTime` (ms), `isSuccess`, `errorMessage`, timestamps.
- `UptimeSummary`: Daily `totalChecks`, `successfulChecks`, `uptimePercentage`, timestamps.
- `Alert`: `monitorId`, `alertType`, `severity`, `message`, `isResolved`, timestamps.

### Roadmap Hooks
- Stage 2: Persist daily uptime summaries and expose chart-friendly endpoints.
- Stage 3: Advanced charts, historical views, filters.
- Stage 4: Anomaly detection & predictions in the AI service.
- Stage 5: Alerts & notifications (email, Slack, push).

## Current Status

- [x] Project structure created
- [x] Docker Compose setup
- [ ] Symfony backend scaffold
- [ ] Angular web scaffold
- [ ] Go AI service scaffold
- [ ] React Native scaffold
- [ ] Service connectivity tests
- [ ] Core monitoring features
