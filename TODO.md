# PulseAPI - Development TODO

Master task list for implementing all stages of PulseAPI.

## 📋 Legend

- 🔴 **Critical** - Blocks other work
- 🟠 **High** - Should do soon
- 🟡 **Medium** - Important but not urgent
- 🟢 **Low** - Nice to have

---

## ✅ STAGE 1: Setup & Boilerplate (COMPLETE)

- [x] 🔴 Create project structure
- [x] 🔴 Setup Docker Compose
- [x] 🔴 Create Symfony backend scaffold
- [x] 🔴 Create Angular web scaffold
- [x] 🔴 Create Go AI service scaffold
- [x] 🔴 Create React Native mobile scaffold
- [x] 🟠 Setup PostgreSQL database container
- [x] 🟠 Setup Redis cache container
- [x] 🟠 Create basic health check endpoints
- [x] 🟠 Verify service connectivity
- [x] 🟠 Write comprehensive documentation
- [x] 🟡 Create best practices guide
- [x] 🟡 Create visual architecture diagrams

---

## ⬜ STAGE 2: Core Monitoring (2-3 weeks)

### Backend (PHP/Symfony)

#### Database Schema
- [ ] 🔴 Create Monitor entity
  - [ ] `id`, `user_id`, `name`, `url`, `method`, `check_interval`
  - [ ] `timeout`, `expected_status_code`, `is_active`
  - [ ] `created_at`, `updated_at`
  - [ ] Add indexes on frequently queried fields
  
- [ ] 🔴 Create Metric entity
  - [ ] `id`, `monitor_id`, `status_code`, `response_time`
  - [ ] `is_success`, `error_message`, `checked_at`
  - [ ] Add index on (monitor_id, checked_at)

- [ ] 🔴 Create UptimeSummary entity
  - [ ] `id`, `monitor_id`, `date`
  - [ ] `total_checks`, `successful_checks`, `uptime_percentage`

- [ ] 🔴 Create Alert entity
  - [ ] `id`, `monitor_id`, `alert_type`, `severity`
  - [ ] `message`, `is_resolved`, `created_at`, `resolved_at`

- [ ] 🟠 Create User entity
  - [ ] `id`, `email`, `password_hash`, `created_at`
  - [ ] `subscription_tier`

#### Services
- [ ] 🔴 Create HealthCheckerService
  - [ ] Make HTTP request to monitor URL
  - [ ] Measure response time
  - [ ] Check status code match
  - [ ] Handle timeouts gracefully
  - [ ] Return Metric object
  - [ ] Unit tests

- [ ] 🔴 Create MetricService
  - [ ] Save metrics to database
  - [ ] Calculate uptime percentage
  - [ ] Aggregate metrics by time period
  - [ ] Unit tests

- [ ] 🟠 Create AlertService
  - [ ] Check thresholds
  - [ ] Create alerts
  - [ ] Resolve alerts
  - [ ] Unit tests

#### Controllers/API Endpoints
- [ ] 🔴 MonitorController
  - [ ] `POST /api/monitors` - Create monitor
  - [ ] `GET /api/monitors` - List user's monitors
  - [ ] `GET /api/monitors/{id}` - Get details
  - [ ] `PUT /api/monitors/{id}` - Update
  - [ ] `DELETE /api/monitors/{id}` - Delete
  - [ ] `POST /api/monitors/{id}/check` - Manual check
  - [ ] Test all endpoints

- [ ] 🔴 MetricController
  - [ ] `GET /api/monitors/{id}/metrics` - Get metrics with filters
  - [ ] `GET /api/monitors/{id}/metrics/summary` - Uptime summary
  - [ ] Test endpoints

- [ ] 🟠 AlertController
  - [ ] `GET /api/alerts` - List alerts
  - [ ] `POST /api/alerts/{id}/resolve` - Mark resolved
  - [ ] Test endpoints

- [ ] 🟠 StatusController
  - [ ] `GET /api/status` - System stats
  - [ ] Return monitors total/up/down
  - [ ] Return average response time
  - [ ] Return overall uptime

#### Scheduler/Cron
- [ ] 🔴 Create CheckMonitorsCommand
  - [ ] Run health checks
  - [ ] Save metrics
  - [ ] Trigger alerts
  - [ ] Executable: `php bin/console app:monitor:check`

- [ ] 🟠 Setup cron job
  - [ ] Run every minute: `* * * * * cd /app && php bin/console app:monitor:check`
  - [ ] Use Symfony background tasks or external scheduler

### Frontend (Angular)

#### Components
- [ ] 🔴 Create MonitorsListComponent
  - [ ] Display list of monitors
  - [ ] Show status (🟢 up / 🔴 down)
  - [ ] Show last check time
  - [ ] Show response time
  - [ ] Use signals for state

- [ ] 🔴 Create MonitorDetailComponent
  - [ ] Show full monitor info
  - [ ] Display metrics chart
  - [ ] Show uptime percentage
  - [ ] Show recent alerts
  - [ ] Manual check button

- [ ] 🔴 Create MonitorFormComponent
  - [ ] Form to create/edit monitor
  - [ ] Fields: name, url, method, interval, timeout
  - [ ] Form validation
  - [ ] Submit to API

- [ ] 🟠 Create MetricsChartComponent
  - [ ] Chart.js integration
  - [ ] Response time over time (line chart)
  - [ ] Uptime percentage (area chart)
  - [ ] Status codes (bar chart)
  - [ ] Responsive sizing

- [ ] 🟠 Create UptimeBadgeComponent
  - [ ] Display uptime percentage
  - [ ] Color coded (green > 99%, yellow 95-99%, red < 95%)
  - [ ] Reusable component

#### Services
- [ ] 🔴 Create MonitorService
  - [ ] getMonitors()
  - [ ] getMonitor(id)
  - [ ] createMonitor(data)
  - [ ] updateMonitor(id, data)
  - [ ] deleteMonitor(id)
  - [ ] checkMonitor(id)

- [ ] 🔴 Create MetricService
  - [ ] getMetrics(monitorId, filters)
  - [ ] getSummary(monitorId)
  - [ ] Observable streams

#### Pages
- [ ] 🔴 Create MonitorsPage
  - [ ] List all monitors
  - [ ] Search/filter
  - [ ] Create new button
  - [ ] Delete button
  - [ ] Edit button

- [ ] 🟠 Create MonitorDetailPage
  - [ ] Show monitor details
  - [ ] Display metrics charts
  - [ ] Show alerts
  - [ ] Manual check button

#### Styling
- [ ] 🟠 Create global styles
- [ ] 🟠 Create component styles
- [ ] 🟠 Responsive design
- [ ] 🟠 Dark mode support (optional)

### Mobile (React Native)

#### Screens
- [ ] 🔴 Update DashboardScreen
  - [ ] Fetch monitors from API
  - [ ] Show monitor count
  - [ ] Show up/down count
  - [ ] Average response time

- [ ] 🟠 Create MonitorsScreen
  - [ ] List all monitors
  - [ ] Show status per monitor
  - [ ] Pull to refresh
  - [ ] Tap to see details

- [ ] 🟠 Create MetricsScreen
  - [ ] Show selected monitor details
  - [ ] Display last 24h metrics
  - [ ] Show response time chart
  - [ ] Show uptime percentage

### AI Service (Go)

#### Metrics Analysis
- [ ] 🟡 Create MetricsAggregator
  - [ ] Fetch metrics from Redis
  - [ ] Calculate average response time
  - [ ] Calculate min/max
  - [ ] Calculate success rate

- [ ] 🟡 Create EndpointForMetrics
  - [ ] `GET /api/metrics/aggregate/{monitorId}` - Aggregated stats
  - [ ] `POST /api/analyze` - Analyze metrics

---

## ⬜ STAGE 3: Dashboard & Analytics (2 weeks)

### Enhanced Metrics
- [ ] 🟠 Create TimeSeriesService
  - [ ] Store metrics with timestamps
  - [ ] Query by date range
  - [ ] Aggregate by hour/day/week/month

### Advanced Charts
- [ ] 🟠 Response Time Timeline
  - [ ] Line chart with min/max/avg bands
  - [ ] Interactive tooltips
  - [ ] Date range picker

- [ ] 🟠 Uptime Calendar Heatmap
  - [ ] Show daily uptime
  - [ ] Color intensity based on uptime
  - [ ] Click for details

- [ ] 🟠 Status Code Distribution
  - [ ] Bar chart by status code
  - [ ] Show count per code
  - [ ] Tooltip with percentage

### Reports
- [ ] 🟡 Monthly Report Generation
  - [ ] PDF export
  - [ ] CSV export
  - [ ] Email delivery

- [ ] 🟡 Custom Report Builder
  - [ ] Select metrics
  - [ ] Choose date range
  - [ ] Generate on demand

### Dashboard Filters
- [ ] 🟠 Time Range Picker
  - [ ] Last 24h, 7d, 30d, custom
  - [ ] Apply to all charts

- [ ] 🟠 Monitor Selector
  - [ ] Multi-select monitors
  - [ ] View combined metrics

---

## ⬜ STAGE 4: AI Anomaly Detection (2-3 weeks)

### Statistical Analysis
- [ ] 🟠 Implement Z-Score Detection
  - [ ] Calculate standard deviation
  - [ ] Detect spikes (>2 sigma)
  - [ ] Flag as anomaly

- [ ] 🟠 Implement Moving Average
  - [ ] Calculate trend
  - [ ] Detect deviations
  - [ ] Smooth out noise

### Predictions
- [ ] 🟡 Train Simple Model
  - [ ] Collect historical data
  - [ ] Simple linear regression
  - [ ] Predict next 24h uptime

- [ ] 🟡 Create PredictionEndpoint
  - [ ] `POST /api/predict` - Predict outage

### AI Insights
- [ ] 🟡 Generate Summaries
  - [ ] "Your API was 99.3% available this week"
  - [ ] "Average response time increased 15% today"
  - [ ] Template-based generation

- [ ] 🟡 Create InsightService
  - [ ] Analyze metrics
  - [ ] Generate human-readable text
  - [ ] Store insights

---

## ⬜ STAGE 5: Alerts & Notifications (1 week)

### Email Alerts
- [ ] 🟠 Setup Email Service
  - [ ] Use Symfony Mailer
  - [ ] Send via SMTP
  - [ ] HTML templates

- [ ] 🟠 Create Email Templates
  - [ ] Monitor down alert
  - [ ] Threshold breach alert
  - [ ] Daily summary email

### Slack Integration
- [ ] 🟠 OAuth Flow
  - [ ] Setup Slack app
  - [ ] Implement OAuth
  - [ ] Store tokens

- [ ] 🟠 Send Slack Messages
  - [ ] Monitor status changes
  - [ ] Alert triggers
  - [ ] Daily digest

### Push Notifications (Mobile)
- [ ] 🟡 Setup Firebase Cloud Messaging
  - [ ] Android setup
  - [ ] iOS setup
  - [ ] Device token management

- [ ] 🟡 Send Push Notifications
  - [ ] Monitor down alert
  - [ ] Alert resolution
  - [ ] New metrics available

### Webhooks
- [ ] 🟡 Create Webhook System
  - [ ] Store webhook URLs
  - [ ] Send POST requests
  - [ ] Retry logic

### Alert Rules
- [ ] 🟡 Create AlertRuleService
  - [ ] Define custom rules
  - [ ] Response time threshold
  - [ ] Downtime threshold
  - [ ] Consecutive failures

---

## ⬜ STAGE 6: User Authentication (1 week)

### User Management
- [ ] 🔴 Create AuthController
  - [ ] `POST /api/auth/register` - Sign up
  - [ ] `POST /api/auth/login` - Sign in
  - [ ] `POST /api/auth/logout` - Sign out
  - [ ] `POST /api/auth/refresh` - Refresh token

- [ ] 🔴 Create User Entity Fully
  - [ ] All fields
  - [ ] Password hashing
  - [ ] Email verification

- [ ] 🔴 Implement JWT
  - [ ] Generate tokens
  - [ ] Validate tokens
  - [ ] Middleware for API protection

### API Key Management
- [ ] 🟠 Create ApiKey Entity
  - [ ] Key generation
  - [ ] Store hashed keys
  - [ ] Expiration

- [ ] 🟠 Create ApiKeyController
  - [ ] Generate new key
  - [ ] List keys
  - [ ] Revoke key

### Teams/Collaboration
- [ ] 🟡 Create Team Entity
  - [ ] Team ownership
  - [ ] Member management
  - [ ] Roles (admin, editor, viewer)

- [ ] 🟡 Update Monitor Entity
  - [ ] Add team_id
  - [ ] Update permissions

### Subscription Tiers
- [ ] 🟡 Create SubscriptionTier Entity
  - [ ] Free, Pro, Business
  - [ ] Feature limits

- [ ] 🟡 Add Tier Checks
  - [ ] Enforce monitor limits
  - [ ] Check API rate limits

---

## ⬜ STAGE 7: Polish & Deployment (1 week)

### Performance
- [ ] 🟠 Database Query Optimization
  - [ ] Add missing indexes
  - [ ] Optimize N+1 queries
  - [ ] Use query caching

- [ ] 🟠 Frontend Performance
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Bundle size analysis

- [ ] 🟠 Backend Performance
  - [ ] Cache strategies
  - [ ] API response optimization
  - [ ] Load testing

### Security
- [ ] 🔴 HTTPS/TLS
  - [ ] Get SSL certificate
  - [ ] Setup HTTPS
  - [ ] Enforce HTTPS

- [ ] 🔴 CORS Configuration
  - [ ] Setup proper CORS headers
  - [ ] Restrict origins
  - [ ] Handle credentials

- [ ] 🟠 Rate Limiting
  - [ ] Implement rate limits
  - [ ] Per user/IP
  - [ ] Sliding window

- [ ] 🟠 SQL Injection Prevention
  - [ ] Use prepared statements (already done with ORM)
  - [ ] Input validation
  - [ ] Parameterized queries

- [ ] 🟠 CSRF Protection
  - [ ] Setup CSRF tokens
  - [ ] Validate on POST/PUT/DELETE

### Testing
- [ ] 🟠 Unit Tests
  - [ ] Backend services
  - [ ] Frontend components
  - [ ] AI service functions
  - [ ] Target: 80%+ coverage

- [ ] 🟠 Integration Tests
  - [ ] API endpoints
  - [ ] Database operations
  - [ ] Service interactions

- [ ] 🟡 E2E Tests
  - [ ] User workflows
  - [ ] Full feature tests
  - [ ] Cross-browser testing

### Documentation
- [ ] 🟠 API Documentation
  - [ ] Swagger/OpenAPI
  - [ ] Endpoint descriptions
  - [ ] Example requests/responses

- [ ] 🟠 Developer Guide
  - [ ] Setup instructions
  - [ ] Code structure
  - [ ] Contributing guidelines

- [ ] 🟡 User Guide
  - [ ] Feature walkthroughs
  - [ ] Video tutorials
  - [ ] FAQ

### Docker & Deployment
- [ ] 🟠 Production Dockerfile
  - [ ] Multi-stage builds
  - [ ] Minimal image size
  - [ ] Security hardening

- [ ] 🟠 Docker Compose Prod Config
  - [ ] Health checks
  - [ ] Resource limits
  - [ ] Logging setup

- [ ] 🟠 Environment Configuration
  - [ ] Production .env setup
  - [ ] Secrets management
  - [ ] Database migrations

---

## ⬜ STAGE 8: Monetization (Optional)

### Stripe Integration
- [ ] 🟡 Create StripeService
  - [ ] Product/Price creation
  - [ ] Customer management
  - [ ] Subscription handling

- [ ] 🟡 Create StripeController
  - [ ] `POST /api/checkout` - Create session
  - [ ] `POST /api/webhook` - Handle events
  - [ ] Webhook verification

### Billing Dashboard
- [ ] 🟡 Create BillingComponent
  - [ ] Display current plan
  - [ ] Usage stats
  - [ ] Upgrade/downgrade options
  - [ ] Invoice history

- [ ] 🟡 Create CheckoutFlow
  - [ ] Plan selection
  - [ ] Stripe checkout
  - [ ] Success/failure pages

### Tier Features
- [ ] 🟡 Implement Feature Gates
  - [ ] Check subscription tier
  - [ ] Enforce limits
  - [ ] Prevent overage

---

## 🔧 Cross-Cutting Tasks

### Testing (Every Stage)
- [ ] Write unit tests for new code
- [ ] Write integration tests for APIs
- [ ] Update test documentation
- [ ] Maintain >80% coverage

### Documentation (Every Stage)
- [ ] Update API docs
- [ ] Add code comments
- [ ] Update README/guides
- [ ] Add examples

### Code Quality (Every Stage)
- [ ] Follow BEST_PRACTICES.md
- [ ] Lint & format code
- [ ] Review for security
- [ ] Optimize performance

### Git (Every Stage)
- [ ] Use conventional commits
- [ ] Keep commits small
- [ ] Write clear PR descriptions
- [ ] Review peer code

---

## 📊 Progress Tracking

### Current Stage: 1
**Status:** ✅ COMPLETE

```
Stage 1: ████████████████████ 100%
Stage 2: ░░░░░░░░░░░░░░░░░░░░  0%
Stage 3: ░░░░░░░░░░░░░░░░░░░░  0%
Stage 4: ░░░░░░░░░░░░░░░░░░░░  0%
Stage 5: ░░░░░░░░░░░░░░░░░░░░  0%
Stage 6: ░░░░░░░░░░░░░░░░░░░░  0%
Stage 7: ░░░░░░░░░░░░░░░░░░░░  0%
Stage 8: ░░░░░░░░░░░░░░░░░░░░  0%
```

### Time Estimate per Stage
- Stage 1: Complete ✅
- Stage 2: 2-3 weeks (Core monitoring)
- Stage 3: 2 weeks (Analytics)
- Stage 4: 2-3 weeks (AI anomaly detection)
- Stage 5: 1 week (Alerts)
- Stage 6: 1 week (Auth)
- Stage 7: 1 week (Polish)
- Stage 8: 1-2 weeks (Monetization)

**Total: 8-12 weeks** for complete implementation

---

## 🎯 Getting Started

1. Choose a Stage (recommend Stage 2)
2. Pick a task from the TODO
3. Follow BEST_PRACTICES.md
4. Refer to [CODE_REVIEW.md](CODE_REVIEW.md) for quality
5. Update progress in this file
6. Commit with conventional message

---

## Quick Links

- [Best Practices](BEST_PRACTICES.md) - Code standards
- [Code Review Checklist](CODE_REVIEW.md) - Quality checks
- [ROADMAP.md](ROADMAP.md) - High-level plan
- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup guide

---

**Last Updated:** 2025-01-15  
**Next Review:** After Stage 2 completion
