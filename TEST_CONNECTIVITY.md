# PulseAPI - Connectivity Testing Guide

Run these tests after starting Docker to verify all services are communicating properly.

## Prerequisites

- Docker services running: `docker-compose up -d`
- Wait 30 seconds for services to stabilize
- Terminal/Command Prompt

## Quick Test Suite

### 1. Service Health Checks

```bash
# Test Backend
echo "Testing Backend..."
curl -s http://localhost:8000/api/health | jq .

# Expected:
# {
#   "status": "ok",
#   "service": "pulseapi-backend",
#   "timestamp": "...",
#   "message": "Backend is running"
# }
```

```bash
# Test AI Service
echo "Testing AI Service..."
curl -s http://localhost:8001/health | jq .

# Expected:
# {
#   "status": "ok",
#   "service": "pulseapi-ai-service",
#   "timestamp": "...",
#   "message": "AI service is running"
# }
```

```bash
# Test Web
echo "Testing Web Dashboard..."
curl -s http://localhost:4200 | grep "<title>" 

# Expected: <title>PulseAPI...
```

### 2. Service Status (Dependencies)

```bash
# Backend - Check DB & Redis
echo "Testing Backend Status..."
curl -s http://localhost:8000/api/status | jq .

# Expected:
# {
#   "status": "ok",
#   "service": "pulseapi-backend",
#   "database": "connected",
#   "redis": "connected",
#   "timestamp": "..."
# }
```

```bash
# AI Service - Check Backend & Redis
echo "Testing AI Service Status..."
curl -s http://localhost:8001/status | jq .

# Expected:
# {
#   "status": "ok",
#   "service": "pulseapi-ai-service",
#   "redis": "connected",
#   "backend": "connected",
#   "timestamp": "..."
# }
```

### 3. Container Connectivity Tests

```bash
# Test from Backend container to Redis
docker-compose exec backend php -r "
\$redis = new Redis();
\$redis->connect('redis', 6379);
if (\$redis->ping() === 'PONG') {
  echo 'Backend→Redis: ✓ Connected\n';
} else {
  echo 'Backend→Redis: ✗ Failed\n';
}
"

# Test from Backend container to PostgreSQL
docker-compose exec backend php -r "
try {
  \$db = new PDO('pgsql:host=postgres;dbname=pulseapi', 'pulseapi', 'dev_password');
  echo 'Backend→PostgreSQL: ✓ Connected\n';
} catch (Exception \$e) {
  echo 'Backend→PostgreSQL: ✗ Failed\n';
}
"
```

```bash
# Test from AI Service to Backend
docker-compose exec ai-service sh -c "
curl -s http://backend:8000/api/health | grep -q 'pulseapi-backend' && echo 'AI→Backend: ✓ Connected' || echo 'AI→Backend: ✗ Failed'
"

# Test from AI Service to Redis
docker-compose exec ai-service sh -c "
ping -c 1 redis && echo 'AI→Redis: ✓ Connected' || echo 'AI→Redis: ✗ Failed'
"
```

### 4. API Endpoint Tests

```bash
# Get Projects
curl -s http://localhost:8000/api/projects | jq .

# Expected:
# {
#   "data": [
#     {"id": 1, "name": "Sample Project", "status": "active"}
#   ]
# }
```

```bash
# Analyze Metrics (POST)
curl -s -X POST http://localhost:8001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"metrics": []}' | jq .

# Expected:
# {
#   "id": "...",
#   "status": "completed",
#   "message": "Analysis completed",
#   "anomalies_detected": 0,
#   "confidence": 0.85
# }
```

### 5. Web Dashboard Tests

Open http://localhost:4200 in browser

**Check:**
- [ ] Page loads without 404 errors
- [ ] Header shows "PulseAPI"
- [ ] Dashboard tab displays status cards
- [ ] Status page shows "Backend API: ok"
- [ ] Database shows "connected"
- [ ] Redis shows "connected"
- [ ] Projects list displays (or "No projects yet" message)

**Check Console (F12)**
- [ ] No red errors
- [ ] Network requests to `/api/*` return 200 OK
- [ ] Response times < 500ms

### 6. Container Logs Analysis

```bash
# Check Backend logs
docker-compose logs backend | grep -E "(error|warn|connected|listening)"

# Check AI Service logs
docker-compose logs ai-service | grep -E "(error|warn|connected|listening)"

# Check Web logs
docker-compose logs web | grep -E "(error|warn)"

# Check Database logs
docker-compose logs postgres | grep -E "(error|ready|connection)"

# Check Redis logs
docker-compose logs redis | grep -E "(error|ready|listening)"
```

## Automated Test Script (Bash)

Create a file: `test-connectivity.sh`

```bash
#!/bin/bash

echo "=========================================="
echo "PulseAPI - Connectivity Test Suite"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper function
test_endpoint() {
  local name=$1
  local url=$2
  local expected=$3
  
  echo -n "Testing $name... "
  
  response=$(curl -s -w "\n%{http_code}" "$url")
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [[ $status_code == "200" && $body == *"$expected"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Status: $status_code"
    echo "  Response: $body"
    ((FAILED++))
  fi
}

# Tests
test_endpoint "Backend Health" "http://localhost:8000/api/health" "pulseapi-backend"
test_endpoint "Backend Status" "http://localhost:8000/api/status" "connected"
test_endpoint "AI Service Health" "http://localhost:8001/health" "pulseapi-ai-service"
test_endpoint "AI Service Status" "http://localhost:8001/status" "connected"
test_endpoint "Web Dashboard" "http://localhost:4200" "PulseAPI"

echo ""
echo "=========================================="
echo "Results: ${GREEN}$PASSED PASSED${NC} / ${RED}$FAILED FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Check logs:${NC}"
  echo "  docker-compose logs"
  exit 1
fi
```

Run it:
```bash
chmod +x test-connectivity.sh
./test-connectivity.sh
```

## Expected Test Results

### ✅ All Services Healthy

```
Testing Backend Health... ✓ PASS
Testing Backend Status... ✓ PASS
Testing AI Service Health... ✓ PASS
Testing AI Service Status... ✓ PASS
Testing Web Dashboard... ✓ PASS

Results: 5 PASSED / 0 FAILED
```

### ⚠️ Database Connection Issue

**Symptom:**
```json
{
  "database": "disconnected",
  "redis": "connected"
}
```

**Fix:**
```bash
docker-compose restart postgres backend
docker-compose logs postgres
```

### ⚠️ Redis Connection Issue

**Symptom:**
```json
{
  "database": "connected",
  "redis": "disconnected"
}
```

**Fix:**
```bash
docker-compose restart redis backend
docker-compose logs redis
```

### ⚠️ AI Service Can't Reach Backend

**Symptom:**
- AI service status shows `backend: disconnected`
- AI service logs show connection errors

**Fix:**
```bash
docker-compose restart backend ai-service
docker-compose exec ai-service curl http://backend:8000/api/health
```

### ⚠️ Web Dashboard Shows Errors

**Symptom:**
- Page won't load
- DevTools shows 404 errors
- Network requests fail

**Fix:**
```bash
docker-compose restart web
docker-compose logs web

# Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
```

## Performance Tests

### Response Time Check

```bash
# Backend health endpoint
time curl -s http://localhost:8000/api/health > /dev/null

# Should be < 100ms
```

```bash
# AI Service analysis
time curl -s -X POST http://localhost:8001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}' > /dev/null

# Should be < 200ms
```

### Load Test (Low)

```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:8000/api/health

# Or using curl in loop
for i in {1..100}; do
  curl -s http://localhost:8000/api/health > /dev/null
done
echo "100 requests completed"
```

## Database Connection Test

```bash
# Direct test
psql -h localhost -U pulseapi -d pulseapi -c "SELECT NOW();"

# Via Docker
docker-compose exec postgres psql -U pulseapi -d pulseapi -c "SELECT NOW();"
```

## Redis Connection Test

```bash
# Via docker-cli
docker-compose exec redis redis-cli ping

# Expected: PONG
```

## Network Connectivity Tests

```bash
# Check if containers can reach each other
docker-compose exec backend ping -c 1 postgres
docker-compose exec backend ping -c 1 redis
docker-compose exec backend ping -c 1 ai-service

# All should return responses with 0% packet loss
```

## Checklist for Successful Setup

- [ ] All 5 containers running: `docker-compose ps`
- [ ] Backend health: `curl http://localhost:8000/api/health`
- [ ] AI service health: `curl http://localhost:8001/health`
- [ ] Web loads: http://localhost:4200
- [ ] Dashboard shows "connected" for DB and Redis
- [ ] No errors in logs: `docker-compose logs`
- [ ] API responses under 500ms
- [ ] Mobile app can connect to backend
- [ ] All containers can reach each other (ping test)

Once all checks pass, you're ready to proceed to Stage 2 (Core Monitoring).
