# PulseAPI - Deployment Guide

## Local Docker Deployment (Recommended for Development)

### Step 1: Verify Docker Installation

```bash
docker --version
docker-compose --version
```

### Step 2: Navigate to Project Directory

```bash
cd /f:/projects/API\ Integration\ Hub
```

### Step 3: Build and Start All Services

```bash
# Start all services
docker-compose up -d

# Watch logs
docker-compose logs -f
```

Expected output:
```
pulseapi-postgres is healthy
pulseapi-redis is healthy
pulseapi-backend started
pulseapi-ai-service started
pulseapi-web started
```

### Step 4: Verify All Services

```bash
# Check running containers
docker-compose ps

# Test backend
curl http://localhost:8000/api/health

# Test AI service
curl http://localhost:8001/health

# Test web
curl http://localhost:4200
```

### Step 5: Access Services

| Service | URL |
|---------|-----|
| Web Dashboard | http://localhost:4200 |
| Backend API | http://localhost:8000 |
| AI Service | http://localhost:8001 |

## Production Deployment (Cloud)

### Option A: Deploy on Railway.app

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize Railway Project**
```bash
railway init
```

4. **Create Services**
```bash
# Add Docker services
railway add

# Select:
# - PostgreSQL
# - Redis
# - Docker (Backend)
# - Docker (Web)
# - Docker (AI Service)
```

5. **Deploy**
```bash
railway up
```

### Option B: Deploy on Render.com

1. **Create New Web Service**
   - Connect GitHub repository
   - Build command: `docker-compose build`
   - Start command: `docker-compose up -d`

2. **Add Environment Variables**
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
APP_ENV=production
```

3. **Deploy**
   - Push to main branch
   - Render auto-deploys

### Option C: Deploy on AWS

1. **Use ECS (Elastic Container Service)**
   - Create task definitions for each service
   - Use RDS for PostgreSQL
   - Use ElastiCache for Redis

2. **Docker Image Registries**
   - Push to ECR (Elastic Container Registry)
   - Or use Docker Hub

3. **Load Balancer**
   - Use ALB (Application Load Balancer)
   - Routes to backend and web services

### Option D: Deploy on Kubernetes (Advanced)

```bash
# Create kubectl deployment files
kubectl apply -f backend-deployment.yaml
kubectl apply -f web-deployment.yaml
kubectl apply -f ai-service-deployment.yaml
kubectl apply -f postgres-statefulset.yaml
kubectl apply -f redis-statefulset.yaml
```

## Environment Configuration

### Production Variables

**Backend (.env)**
```
APP_ENV=production
APP_DEBUG=0
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/pulseapi
REDIS_URL=redis://redis-endpoint:6379
JWT_SECRET=your-secret-key-here
CORS_ORIGINS=https://yourdomain.com
```

**Web (angular.json)**
```json
{
  "configurations": {
    "production": {
      "apiUrl": "https://api.yourdomain.com",
      "analytics": "UA-XXXXX-X"
    }
  }
}
```

**AI Service (.env)**
```
BACKEND_URL=https://api.yourdomain.com
REDIS_URL=redis://redis-endpoint:6379
LOG_LEVEL=info
```

## Database Migrations

### Initialize PostgreSQL

```bash
# Execute inside backend container
docker-compose exec backend php bin/console doctrine:migrations:migrate
```

Or manually:
```bash
docker-compose exec postgres psql -U pulseapi -d pulseapi << EOF

CREATE TABLE IF NOT EXISTS monitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  check_interval INT DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  monitor_id INT REFERENCES monitors(id),
  status_code INT,
  response_time FLOAT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  monitor_id INT REFERENCES monitors(id),
  alert_type VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

EOF
```

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com

# Update nginx.conf
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

## Monitoring & Logging

### Docker Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f web
docker-compose logs -f ai-service

# Save logs to file
docker-compose logs > logs.txt
```

### Setup ELK Stack (Optional)

```bash
# Add to docker-compose.yml
elasticsearch:
  image: elasticsearch:8.0.0
  environment:
    - discovery.type=single-node

kibana:
  image: kibana:8.0.0
  ports:
    - "5601:5601"
```

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U pulseapi pulseapi > backup.sql

# Restore
docker-compose exec postgres psql -U pulseapi pulseapi < backup.sql
```

### Redis Backup

```bash
# Save Redis data
docker-compose exec redis redis-cli BGSAVE

# Copy dump.rdb
docker cp pulseapi-redis:/data/dump.rdb ./redis-backup.rdb
```

## Performance Optimization

### Caching Strategy

1. **Redis** - Cache API responses (60 seconds TTL)
2. **Browser Cache** - Static assets (1 year)
3. **CDN** - Images, CSS, JS (Cloudflare/AWS CloudFront)

### Database Indexing

```sql
CREATE INDEX idx_monitor_created ON monitors(created_at);
CREATE INDEX idx_metrics_monitor ON metrics(monitor_id);
CREATE INDEX idx_metrics_checked ON metrics(checked_at);
```

### Load Balancing

```nginx
upstream backend {
  server backend1:8000;
  server backend2:8000;
  server backend3:8000;
}

server {
  location /api/ {
    proxy_pass http://backend;
  }
}
```

## Scaling Considerations

### Horizontal Scaling

1. **Multiple Backend Instances**
   - Load balancer distributes requests
   - Shared PostgreSQL database
   - Shared Redis cache

2. **Database Replication**
   - Primary-replica setup
   - Read replicas for analytics

3. **AI Service Scaling**
   - Multiple workers processing metrics
   - Message queue (RabbitMQ/Kafka)

### Vertical Scaling

- Increase container resources
- Add CPU/memory limits in docker-compose

## Health Checks & Monitoring

### Container Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Monitoring Tools

1. **Prometheus** - Metrics collection
2. **Grafana** - Visualization
3. **AlertManager** - Alerts

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build images
        run: docker-compose build
      
      - name: Push to registry
        run: docker push myregistry/pulseapi-*
      
      - name: Deploy
        run: |
          ssh deploy@server "cd /app && docker-compose pull && docker-compose up -d"
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process using port
lsof -ti:8000 | xargs kill -9

# Or use different port
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

### Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose up -d --build backend

# Force restart
docker-compose restart backend
```

### Database Connection Issues

```bash
# Test connection
docker-compose exec postgres psql -U pulseapi -d pulseapi -c "SELECT 1"

# Check credentials in .env
cat backend/.env
```

## Rollback Procedure

```bash
# Keep previous image
docker tag pulseapi-backend:latest pulseapi-backend:v1.0.0

# Deploy new version
docker-compose up -d --build

# If issues, rollback
docker-compose down
docker tag pulseapi-backend:v1.0.0 pulseapi-backend:latest
docker-compose up -d
```

## Success Checklist

- [x] All services start without errors
- [ ] Web dashboard loads (http://localhost:4200)
- [ ] Backend responds to health check
- [ ] AI service responds to health check
- [ ] Database connected
- [ ] Redis connected
- [ ] API endpoints work
- [ ] Mobile app connects
- [ ] Logs are clean (no errors)
- [ ] Response times acceptable (<500ms)
