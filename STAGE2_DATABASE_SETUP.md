# Stage 2: Core Monitoring - Database Setup

## ✅ Completed

### Entities Created

#### 1. **Monitor Entity** (`src/Entity/Monitor.php`)
Represents a monitored endpoint with configuration.

**Fields:**
- `id` (UUID) - Primary key
- `userId` (UUID) - Owner of the monitor
- `name` (string) - Monitor display name
- `url` (string) - Endpoint URL to monitor
- `method` (string) - HTTP method (GET, POST, etc.)
- `checkInterval` (int) - Check frequency in seconds (default: 60)
- `timeout` (int) - Request timeout in seconds (default: 30)
- `expectedStatusCode` (int) - Expected HTTP status (default: 200)
- `isActive` (bool) - Monitor enabled/disabled (default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Indexes:**
- `user_id`
- `is_active`
- `created_at`

---

#### 2. **Metric Entity** (`src/Entity/Metric.php`)
Stores results of each health check.

**Fields:**
- `id` (UUID) - Primary key
- `monitorId` (UUID) - Foreign key to Monitor
- `statusCode` (int) - HTTP response code
- `responseTime` (int) - Response time in milliseconds
- `isSuccess` (bool) - Check passed/failed
- `errorMessage` (string, nullable) - Error details if failed
- `checkedAt` (DateTime) - When the check ran
- `createdAt` (DateTime) - When record was created

**Indexes:**
- `(monitor_id, checked_at)` - Composite for efficient range queries
- `monitor_id`
- `is_success`

---

#### 3. **UptimeSummary Entity** (`src/Entity/UptimeSummary.php`)
Daily aggregated statistics for uptime calculation.

**Fields:**
- `id` (UUID) - Primary key
- `monitorId` (UUID) - Foreign key to Monitor
- `date` (Date) - Date of summary
- `totalChecks` (int) - Total checks performed
- `successfulChecks` (int) - Checks that passed
- `uptimePercentage` (decimal) - Calculated percentage (5,2)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Indexes:**
- Unique: `(monitor_id, date)`
- `monitor_id`
- `date`

**Helper Method:**
- `calculateUptimePercentage()` - Recalculates from success/total counts

---

#### 4. **Alert Entity** (`src/Entity/Alert.php`)
Triggered when thresholds are breached.

**Fields:**
- `id` (UUID) - Primary key
- `monitorId` (UUID) - Foreign key to Monitor
- `alertType` (string) - Type of alert (down, slow, threshold)
- `severity` (string) - Level (critical, warning, info)
- `message` (text) - Alert description
- `isResolved` (bool) - Alert status
- `createdAt` (DateTime)
- `resolvedAt` (DateTime, nullable) - When resolved

**Indexes:**
- `monitor_id`
- `is_resolved`
- `created_at`

**Constants:**
- Alert types: `TYPE_DOWN`, `TYPE_SLOW`, `TYPE_THRESHOLD`
- Severities: `SEVERITY_CRITICAL`, `SEVERITY_WARNING`, `SEVERITY_INFO`

**Helper Methods:**
- `resolve()` - Marks alert as resolved with timestamp

---

### Repositories Created

All repositories extend `ServiceEntityRepository` and provide optimized queries:

#### **MonitorRepository**
- `findByUserId(UuidV4)` - Get all monitors for a user
- `findActiveMonitors()` - Get all active monitors system-wide
- `findActiveMonitorsByUserId(UuidV4)` - Get active monitors for user

#### **MetricRepository**
- `findByMonitorId(UuidV4, limit)` - Get recent metrics
- `findByMonitorIdAndDateRange(UuidV4, start, end)` - Range query
- `findSuccessMetrics(UuidV4, since)` - Count successful checks
- `findTotalMetrics(UuidV4, since)` - Count total checks
- `getAverageResponseTime(UuidV4, since)` - Calculate average

#### **UptimeSummaryRepository**
- `findByMonitorId(UuidV4, limit)` - Get daily summaries
- `findByMonitorIdAndDateRange(UuidV4, start, end)` - Date range
- `findByMonitorAndDate(UuidV4, date)` - Single day lookup

#### **AlertRepository**
- `findByMonitorId(UuidV4)` - All alerts for monitor
- `findUnresolvedByMonitorId(UuidV4)` - Unresolved only
- `findRecentAlerts(days, limit)` - Recent system alerts
- `findCriticalAlerts()` - Active critical alerts

---

### Database Schema

Migration file: `src/Migrations/Version20250113000000.php`

**Tables created:**
1. `monitors` - With proper indexes and constraints
2. `metrics` - With foreign key to monitors (CASCADE delete)
3. `uptime_summaries` - Unique constraint on (monitor_id, date)
4. `alerts` - With foreign key to monitors (CASCADE delete)

---

## 📋 Next Steps

### Before Running Migration
1. Ensure database credentials in `.env`:
   ```
   DATABASE_URL="mysql://user:password@postgres:5432/pulseapi"
   ```

2. Run migration:
   ```bash
   php bin/console doctrine:migrations:migrate
   ```

### Next Tasks
1. **Create HealthCheckerService** - Make HTTP requests and record metrics
2. **Create MetricService** - Save metrics and calculate uptime
3. **Create AlertService** - Trigger alerts on thresholds
4. **Create MonitorController** - CRUD endpoints for monitors
5. **Create CheckMonitorsCommand** - Scheduler command

---

## 🎯 Design Decisions

### Why Separate UptimeSummary?
- Metrics table can grow very large (millions of rows)
- Aggregated daily summaries allow fast dashboard queries
- Prevents N+1 queries for uptime calculation

### Why UUID Primary Keys?
- Globally unique across all environments
- Easier horizontal scaling
- Better for distributed systems

### Why DateTime Immutable?
- Prevents accidental mutations
- Type-safe
- Follows Symfony best practices

### Cascade Delete Policy
- Monitors: Delete metrics, summaries, alerts with the monitor
- Prevents orphaned records
- Maintains referential integrity

---

## 📊 Database Diagram

```
Monitors (1)
    ├─→ (N) Metrics [checked_at timeline]
    ├─→ (N) UptimeSummaries [daily aggregates]
    └─→ (N) Alerts [triggered events]

User (1)
    └─→ (N) Monitors [owned by user]
```

---

**Status:** ✅ Database schema complete and ready for services
