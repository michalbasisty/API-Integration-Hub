# PulseAPI - Implementation Roadmap

## Current Status: ✅ Stage 1 Complete

All services scaffolded and basic connectivity working.

```
✅ Stage 1: Setup & Boilerplate
├─ [x] Docker Compose orchestration
├─ [x] Symfony backend skeleton
├─ [x] Angular 20 web dashboard
├─ [x] Go AI service skeleton
├─ [x] React Native mobile app
├─ [x] PostgreSQL + Redis setup
├─ [x] Basic health check endpoints
├─ [x] Service connectivity tests
└─ [x] Documentation

⬜ Stage 2: Core Monitoring (NEXT)
⬜ Stage 3: Dashboard & Analytics
⬜ Stage 4: AI Anomaly Detection
⬜ Stage 5: Alerts & Notifications
⬜ Stage 6: User Authentication
⬜ Stage 7: Polish & Deployment
⬜ Stage 8: Monetization (Optional)
```

## Stage 2: Core Monitoring (2-3 weeks)

### Goals
- Implement API endpoint checking
- Store metrics in database
- Display basic charts on dashboard
- Send alerts on failures

### Backend Tasks

#### 2.1 Create Database Schema
```php
// backend/migrations/Version001CreateTables.php
- CREATE monitors TABLE
- CREATE metrics TABLE
- CREATE alerts TABLE
- CREATE users TABLE
- CREATE api_keys TABLE
```

**Schema:**
```sql
-- Monitors (APIs to monitor)
CREATE TABLE monitors (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  method VARCHAR(10) DEFAULT 'GET',
  check_interval INT DEFAULT 60,  -- seconds
  timeout INT DEFAULT 10,
  expected_status_code INT DEFAULT 200,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Metrics (Check results)
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  monitor_id INT NOT NULL,
  status_code INT,
  response_time FLOAT,  -- milliseconds
  is_success BOOLEAN,
  error_message TEXT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (monitor_id) REFERENCES monitors(id),
  INDEX idx_monitor_checked (monitor_id, checked_at)
);

-- Uptime Summary (aggregated)
CREATE TABLE uptime_summary (
  id SERIAL PRIMARY KEY,
  monitor_id INT NOT NULL,
  date DATE,
  total_checks INT,
  successful_checks INT,
  uptime_percentage FLOAT,
  FOREIGN KEY (monitor_id) REFERENCES monitors(id),
  UNIQUE(monitor_id, date)
);

-- Alerts
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  monitor_id INT NOT NULL,
  alert_type VARCHAR(50),  -- threshold_breach, downtime, slow_response
  severity VARCHAR(20),    -- info, warning, critical
  message TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (monitor_id) REFERENCES monitors(id)
);
```

#### 2.2 Create Entities & Repositories
```
backend/src/
├── Entity/
│   ├── Monitor.php
│   ├── Metric.php
│   ├── UptimeSummary.php
│   ├── Alert.php
│   └── User.php
├── Repository/
│   ├── MonitorRepository.php
│   ├── MetricRepository.php
│   ├── AlertRepository.php
│   └── UserRepository.php
```

#### 2.3 Create API Endpoints

**Monitors:**
- `POST /api/monitors` - Create new monitor
- `GET /api/monitors` - List user's monitors
- `GET /api/monitors/{id}` - Get details
- `PUT /api/monitors/{id}` - Update
- `DELETE /api/monitors/{id}` - Delete
- `POST /api/monitors/{id}/check` - Manual check

**Metrics:**
- `GET /api/monitors/{id}/metrics` - Get metrics (with filters)
- `GET /api/monitors/{id}/metrics/summary` - Uptime summary

**Alerts:**
- `GET /api/alerts` - List alerts
- `POST /api/alerts/{id}/resolve` - Mark as resolved

**Status:**
```php
// GET /api/status
{
  "monitors_total": 5,
  "monitors_up": 4,
  "monitors_down": 1,
  "average_response_time": 245,
  "overall_uptime": "99.5%",
  "last_check": "2025-01-15T10:30:00Z"
}
```

#### 2.4 Create Health Checker Service

```php
// backend/src/Service/HealthCheckerService.php
class HealthCheckerService {
  public function checkMonitor(Monitor $monitor): Metric {
    // 1. Get URL from monitor
    // 2. Make HTTP request with timeout
    // 3. Measure response time
    // 4. Check status code
    // 5. Save to metrics table
    // 6. Check thresholds for alerts
    // 7. Return metric object
  }
}
```

#### 2.5 Create Symfony Command

```bash
# Run periodic checks
php bin/console app:monitor:check

# Schedule with cron
* * * * * cd /app && php bin/console app:monitor:check
```

### Frontend Tasks

#### 2.6 Create Monitors Component
```
web/src/app/pages/
├── monitors/
│   ├── monitors-list.component.ts
│   ├── monitor-detail.component.ts
│   ├── monitor-form.component.ts
│   └── monitor-detail.scss
```

**Features:**
- List all monitors
- Create new monitor (form)
- Edit monitor
- Delete monitor
- Manual check button

#### 2.7 Create Metrics Component
```
web/src/app/components/
├── metrics-chart.component.ts
├── uptime-badge.component.ts
└── metric-table.component.ts
```

**Charts:**
- Line chart: Response time over time
- Area chart: Uptime % over days
- Bar chart: Status code distribution

#### 2.8 Create Alerts Component
```
web/src/app/pages/
└── alerts/
    ├── alerts-list.component.ts
    └── alerts.component.scss
```

**Features:**
- List all alerts
- Filter by severity
- Mark as resolved
- Auto-refresh

### AI Service Tasks

#### 2.9 Implement Metric Aggregation
```go
// ai-service/metrics.go
func AggregateMetrics(monitorID string, timeRange int) (*MetricsSummary, error) {
  // Fetch metrics from Redis
  // Calculate:
  // - Average response time
  // - Min/Max response time
  // - Total checks
  // - Success rate
  // - Uptime percentage
}
```

### Mobile App Tasks

#### 2.10 Update Mobile Dashboard
```
mobile/
├── screens/
│   ├── DashboardScreen.tsx
│   ├── MonitorsScreen.tsx
│   └── MetricsScreen.tsx
```

**Features:**
- Show list of monitors
- Real-time status (🟢 up / 🔴 down)
- Tap to see metrics
- Refresh button

## Stage 3: Dashboard & Analytics (2 weeks)

### Features
- Advanced charts (Chart.js / ngx-charts)
- Historical data view
- Performance trends
- Incident timeline
- Export reports (PDF/CSV)

### Tasks
1. Add date range picker
2. Create multiple chart types
3. Implement data filtering
4. Add real-time updates (WebSocket)
5. Create report generation

## Stage 4: AI Anomaly Detection (2-3 weeks)

### Features
- Statistical anomaly detection
- Predicted outages
- Automated summaries
- Smart alerting

### Tasks
1. Implement z-score detection in Go
2. Train simple ML model (optional)
3. Create prediction endpoint
4. Integrate with alerts

## Stage 5: Alerts & Notifications (1 week)

### Features
- Email alerts
- Slack integration
- Push notifications (mobile)
- Webhook support
- Custom alert rules

### Tasks
1. Implement email service
2. Add Slack OAuth flow
3. Setup Firebase Cloud Messaging
4. Create alert preferences UI

## Stage 6: User Authentication (1 week)

### Features
- User registration/login
- JWT tokens
- API key management
- Role-based access

### Tasks
1. Create User entity & auth endpoints
2. Implement JWT middleware
3. Add login page (Angular)
4. API key management UI

## Stage 7: Polish & Deployment (1 week)

### Tasks
1. Performance optimization
2. Security review
3. Error handling improvement
4. Comprehensive testing
5. Docker compose refinement
6. Documentation updates

## Stage 8: Monetization (Optional)

### Features
- Stripe integration
- Billing dashboard
- Plan tiers
- Payment webhooks

### Tiers
```
Free:
- 3 API monitors
- 5-minute check intervals
- Email alerts
- 30-day history

Pro ($5/month):
- Unlimited monitors
- 1-minute check intervals
- All notification methods
- 1-year history
- Analytics & reports

Business ($20/month):
- Everything in Pro
- Custom check intervals
- Team collaboration
- SLA tracking
- Dedicated support
```

## Implementation Order (Recommended)

```
Week 1-2:   Stage 2 (Core Monitoring)
Week 3-4:   Stage 3 (Analytics)
Week 5-6:   Stage 4 (AI)
Week 7:     Stage 5 (Alerts)
Week 8:     Stage 6 (Auth)
Week 9:     Stage 7 (Polish)
Week 10-11: Deployment & Testing
Week 12:    Launch & Monetization
```

## Key Files to Create

### Backend
```
backend/src/
├── Entity/Monitor.php
├── Entity/Metric.php
├── Entity/Alert.php
├── Repository/MonitorRepository.php
├── Service/HealthCheckerService.php
├── Service/AlertService.php
├── Controller/MonitorController.php
├── Controller/MetricController.php
├── Command/CheckMonitorsCommand.php
└── EventListener/AlertListener.php
```

### Frontend
```
web/src/app/
├── pages/monitors/
├── pages/metrics/
├── pages/alerts/
├── pages/settings/
├── components/charts/
├── services/monitor.service.ts
├── services/metric.service.ts
└── services/alert.service.ts
```

### AI Service
```
ai-service/
├── metrics/aggregator.go
├── anomaly/detector.go
├── prediction/predictor.go
├── handlers/analyze.go
├── models/metric.go
└── utils/statistics.go
```

## Testing Strategy

### Unit Tests
- Service layer (HealthChecker, AlertService)
- Utility functions (calculations)
- Repository queries

### Integration Tests
- API endpoints
- Database operations
- Service interactions

### E2E Tests
- Full flow: Create monitor → Check → Alert → Resolve
- Web dashboard interactions
- Mobile app functionality

### Performance Tests
- Load testing (100+ concurrent monitors)
- Response time benchmarks
- Database query optimization

## Success Metrics

### Performance
- [ ] API response time < 200ms
- [ ] Dashboard load time < 2s
- [ ] Check execution < 5s per monitor

### Reliability
- [ ] 99.9% uptime
- [ ] Zero data loss
- [ ] Graceful error handling

### Functionality
- [ ] All endpoints working
- [ ] All charts rendering
- [ ] Alerts triggering correctly
- [ ] Mobile app responsive

### Code Quality
- [ ] 80%+ test coverage
- [ ] No unhandled exceptions
- [ ] Clean code structure
- [ ] Comprehensive documentation

## Quick Reference

### Running Tests
```bash
# Backend
docker-compose exec backend phpunit

# Web
docker-compose exec web npm test

# AI Service
docker-compose exec ai-service go test ./...
```

### Building for Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose push
```

### Deploying
```bash
# Docker Hub
docker push yourusername/pulseapi-backend:latest

# Deploy to server
ssh deploy@server "cd /app && docker-compose pull && docker-compose up -d"
```

## Next Immediate Actions

1. ✅ Complete Stage 1 scaffolding ← YOU ARE HERE
2. Create database schema (Stage 2.1)
3. Implement health checker (Stage 2.4)
4. Create API endpoints (Stage 2.3)
5. Build monitors component (Stage 2.6)
6. Run integration tests
7. Deploy and validate

Good luck! 🚀
