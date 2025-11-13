# PulseAPI - Quick Commands Reference

## Docker Compose Commands

### Start Services
```bash
docker-compose up -d                    # Start all services
docker-compose up -d --build            # Rebuild and start
docker-compose up -d backend            # Start specific service
```

### Stop Services
```bash
docker-compose down                     # Stop all services
docker-compose down -v                  # Stop and remove volumes
docker-compose stop                     # Pause services
docker-compose restart                  # Restart all services
```

### View Logs
```bash
docker-compose logs                     # View all logs
docker-compose logs -f                  # Follow logs in real-time
docker-compose logs -f backend          # Follow backend logs
docker-compose logs backend | grep error # Search for errors
```

### Service Status
```bash
docker-compose ps                       # Show running containers
docker-compose images                   # Show images
docker-compose config                   # Show configuration
```

## Health Checks

### Test Backend
```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/status
curl http://localhost:8000/api/projects
```

### Test AI Service
```bash
curl http://localhost:8001/health
curl http://localhost:8001/status
curl -X POST http://localhost:8001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test Web Dashboard
```bash
curl http://localhost:4200
# Or open in browser: http://localhost:4200
```

### Quick Connectivity Check
```bash
echo "Backend:" && curl -s http://localhost:8000/api/health | grep -o '"status":"[^"]*"'
echo "AI Service:" && curl -s http://localhost:8001/health | grep -o '"status":"[^"]*"'
echo "Web:" && curl -s http://localhost:4200 | grep -o "<title>[^<]*</title>"
```

## Container Execution

### Backend (PHP)
```bash
docker-compose exec backend php -v                          # Check PHP version
docker-compose exec backend php -r "echo 'Hello';"         # Execute PHP
docker-compose exec backend curl http://redis:6379          # Test connectivity
```

### AI Service (Go)
```bash
docker-compose exec ai-service go version                   # Check Go version
docker-compose exec ai-service curl http://backend:8000     # Test backend
```

### Database (PostgreSQL)
```bash
docker-compose exec postgres psql -U pulseapi -d pulseapi -c "\dt"
docker-compose exec postgres psql -U pulseapi -d pulseapi -c "SELECT COUNT(*) FROM monitors;"
```

### Redis
```bash
docker-compose exec redis redis-cli ping
docker-compose exec redis redis-cli dbsize
docker-compose exec redis redis-cli keys "*"
```

## Development Commands

### Backend (Symfony)
```bash
# Inside container
docker-compose exec backend php -S 0.0.0.0:8000 -t public

# Or local (requires PHP installed)
cd backend
php -S 0.0.0.0:8000 -t public
```

### Web (Angular)
```bash
# Local development
cd web
npm install
npm start

# Docker
docker-compose up -d --build web
docker-compose logs -f web
```

### AI Service (Go)
```bash
# Local development
cd ai-service
go mod download
go run main.go

# Docker
docker-compose up -d --build ai-service
docker-compose logs -f ai-service
```

### Mobile (React Native)
```bash
cd mobile
npm install
npm start

# Android
npm run android

# iOS
npm run ios
```

## Database Commands

### Initialize Database
```bash
docker-compose exec postgres psql -U pulseapi -d pulseapi << EOF
CREATE TABLE IF NOT EXISTS test (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);
INSERT INTO test (name) VALUES ('Sample');
EOF
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U pulseapi pulseapi > backup.sql
```

### Restore Database
```bash
docker-compose exec postgres psql -U pulseapi pulseapi < backup.sql
```

### Connect to Database
```bash
docker-compose exec postgres psql -U pulseapi -d pulseapi
# Then run SQL commands
# \dt - list tables
# \q - exit
```

## Troubleshooting Commands

### Check Service Health
```bash
docker-compose ps                           # All containers
docker inspect pulseapi-backend             # Detailed info
docker stats pulseapi-backend               # Resource usage
```

### View Errors
```bash
docker-compose logs backend 2>&1 | grep -i error
docker-compose logs ai-service 2>&1 | grep -i error
docker-compose logs web 2>&1 | grep -i error
```

### Test Network Connectivity
```bash
docker-compose exec backend ping redis
docker-compose exec backend ping postgres
docker-compose exec ai-service ping backend
```

### Rebuild Services
```bash
docker-compose build backend
docker-compose build web
docker-compose build ai-service
docker-compose up -d
```

### Remove Containers & Start Fresh
```bash
docker-compose down -v
docker-compose up -d
```

## Performance Testing

### Response Time
```bash
curl -w "Response time: %{time_total}s\n" http://localhost:8000/api/health

# Multiple requests
for i in {1..5}; do
  curl -w "Request $i: %{time_total}s\n" http://localhost:8000/api/health
done
```

### Load Test (basic)
```bash
# Using curl
time for i in {1..100}; do curl -s http://localhost:8000/api/health > /dev/null; done

# Or with Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:8000/api/health
```

## Monitoring Commands

### Real-time Stats
```bash
docker stats --no-stream
watch "docker stats --no-stream"
```

### Memory Usage
```bash
docker ps -q | xargs docker stats --no-stream
```

### Port Usage
```bash
netstat -ano | findstr :8000    # Windows
lsof -i :8000                   # macOS/Linux
```

## Build & Push Commands

### Build Images
```bash
docker-compose build              # Build all
docker-compose build backend      # Build specific
docker-compose build --no-cache   # Build without cache
```

### Tag Images
```bash
docker tag pulseapi-backend:latest myregistry/pulseapi-backend:latest
docker tag pulseapi-web:latest myregistry/pulseapi-web:latest
docker tag pulseapi-ai-service:latest myregistry/pulseapi-ai-service:latest
```

### Push to Registry
```bash
docker push myregistry/pulseapi-backend:latest
docker push myregistry/pulseapi-web:latest
docker push myregistry/pulseapi-ai-service:latest
```

## Cleanup Commands

### Remove Unused Images
```bash
docker image prune
docker image prune -a  # Remove all unused
```

### Remove Unused Containers
```bash
docker container prune
```

### Remove All (CAREFUL!)
```bash
docker-compose down -v
docker system prune -a
```

## Environment Variables

### View Environment in Container
```bash
docker-compose exec backend env | grep -E "APP_|DATABASE_|REDIS_"
docker-compose exec ai-service env | grep -E "BACKEND_|REDIS_"
```

### Edit .env File
```bash
cd backend
nano .env        # Edit environment
cp .env.example .env  # Use template
```

## Quick Health Check Script

Create `health-check.sh`:
```bash
#!/bin/bash

echo "Health Check Report"
echo "=================="
echo ""

echo -n "Backend:     "
curl -s http://localhost:8000/api/health | grep -q "ok" && echo "✓" || echo "✗"

echo -n "AI Service:  "
curl -s http://localhost:8001/health | grep -q "ok" && echo "✓" || echo "✗"

echo -n "Web:         "
curl -s http://localhost:4200 | grep -q "title" && echo "✓" || echo "✗"

echo -n "Database:    "
curl -s http://localhost:8000/api/status | grep -q '"database":"connected"' && echo "✓" || echo "✗"

echo -n "Redis:       "
curl -s http://localhost:8000/api/status | grep -q '"redis":"connected"' && echo "✓" || echo "✗"

echo ""
```

Run: `bash health-check.sh`

## Useful Aliases (Add to .bashrc or .zshrc)

```bash
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
alias dcrestart='docker-compose restart'
alias dcexec='docker-compose exec'

# Quick health check
alias dchealth='curl http://localhost:8000/api/health'
```

## Combined Commands

### Full Restart
```bash
docker-compose down && docker-compose up -d --build
```

### Clear Logs and Restart
```bash
docker-compose down -v && docker-compose up -d
```

### Check All Services at Once
```bash
docker-compose ps && echo "" && docker-compose logs | grep -E "(error|connected|listening)" | tail -20
```

## Windows PowerShell Commands

```powershell
# Start
docker-compose up -d

# Logs
docker-compose logs -f backend

# Stop
docker-compose down

# Health check
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest http://localhost:8000/api/health
```

## Useful Links in Commands

```bash
# Open in browser (macOS)
open http://localhost:4200

# Open in browser (Linux)
xdg-open http://localhost:4200

# Open in browser (Windows)
start http://localhost:4200
```

---

**Tip:** Bookmark this file or create an alias to quickly reference commands!
