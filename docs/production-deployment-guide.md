# Production Deployment Guide - DIETAS_APP_JULES2

## Overview

This guide covers the complete deployment process for the DIETAS_APP_JULES2 Mediterranean diet application backend to production environments.

## Pre-Deployment Checklist

### ✅ Code Quality & Security
- [ ] All tests passing (`npm run test:ci`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] ESLint checks passing (`npm run lint`)
- [ ] Security audit complete (`npm audit`)
- [ ] Dependencies up to date
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly configured
- [ ] Rate limiting implemented and tested
- [ ] Input validation comprehensive
- [ ] Error handling complete

### ✅ Database Setup
- [ ] Production PostgreSQL database created
- [ ] Database connection string configured
- [ ] Prisma migrations applied (`npx prisma migrate deploy`)
- [ ] Database indexes optimized
- [ ] Backup strategy implemented
- [ ] Connection pooling configured
- [ ] Database monitoring setup

### ✅ Performance & Monitoring
- [ ] Caching layer configured
- [ ] Health check endpoints tested
- [ ] Logging properly configured
- [ ] Monitoring dashboards setup
- [ ] Error tracking implemented
- [ ] Performance baselines established
- [ ] Load testing completed

### ✅ Infrastructure
- [ ] Production environment provisioned
- [ ] SSL certificates configured
- [ ] CDN setup (if applicable)
- [ ] Backup systems operational
- [ ] Disaster recovery plan documented

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host:port/database?sslmode=require"

# Authentication
NEXTAUTH_SECRET="your-super-secret-jwt-secret-at-least-32-characters-long"
NEXTAUTH_URL="https://your-domain.com"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Logging & Monitoring
LOG_LEVEL="INFO"
NODE_ENV="production"

# Rate Limiting
RATE_LIMIT_WHITELIST="127.0.0.1,your-admin-ip"

# Email (for password reset, verification)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@your-domain.com"

# External APIs (if any)
NUTRITION_API_KEY="your-nutrition-api-key"

# File Storage (if implementing file uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket"

# Monitoring & Analytics
SENTRY_DSN="your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"
```

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Configure Project:**
```bash
vercel
```

4. **Set Environment Variables:**
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all other environment variables
```

5. **Deploy:**
```bash
vercel --prod
```

### Option 2: Docker Deployment

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Build Docker Image:**
```bash
docker build -t dietas-app .
```

3. **Run Container:**
```bash
docker run -p 3000:3000 --env-file .env.production dietas-app
```

### Option 3: Traditional VPS/Server

1. **Install Node.js and PM2:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2
```

2. **Clone Repository:**
```bash
git clone https://github.com/your-username/dietas-app.git
cd dietas-app
```

3. **Install Dependencies:**
```bash
npm ci --only=production
```

4. **Build Application:**
```bash
npm run build
```

5. **Run Database Migrations:**
```bash
npx prisma migrate deploy
```

6. **Create PM2 Ecosystem File:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dietas-app',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
}
```

7. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Database Migration & Seeding

### Production Database Setup

1. **Apply Migrations:**
```bash
npx prisma migrate deploy
```

2. **Generate Prisma Client:**
```bash
npx prisma generate
```

3. **Seed Database (if needed):**
```bash
npm run db:seed
```

### Database Performance Optimization

1. **Create Additional Indexes:**
```sql
-- Performance indexes for common queries
CREATE INDEX CONCURRENTLY idx_user_meals_user_date ON user_meals(user_id, date);
CREATE INDEX CONCURRENTLY idx_foods_search ON foods USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));
CREATE INDEX CONCURRENTLY idx_recipes_public ON recipes(is_public, created_at);
```

2. **Analyze Query Performance:**
```sql
-- Enable query logging for performance analysis
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries > 100ms
SELECT pg_reload_conf();
```

## SSL & Security Configuration

### Nginx Configuration (if using reverse proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring & Alerting Setup

### Health Check Monitoring

1. **Create Monitoring Script:**
```bash
#!/bin/bash
# health-check.sh
ENDPOINT="https://your-domain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)

if [ $RESPONSE -eq 200 ]; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed with status: $RESPONSE"
    exit 1
fi
```

2. **Setup Cron Job:**
```bash
# Add to crontab
*/5 * * * * /path/to/health-check.sh
```

### Log Monitoring with Logrotate

```bash
# /etc/logrotate.d/dietas-app
/path/to/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 nodejs nodejs
    postrotate
        pm2 reload dietas-app
    endscript
}
```

## Backup Strategy

### Database Backups

1. **Automated Backup Script:**
```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="/backups/dietas-app"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="dietas_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

2. **Schedule Backups:**
```bash
# Daily backups at 2 AM
0 2 * * * /path/to/backup-db.sh
```

### Application Code Backups

```bash
#!/bin/bash
# backup-app.sh
BACKUP_DIR="/backups/dietas-app-code"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/path/to/app"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create application backup (excluding node_modules)
tar --exclude='node_modules' --exclude='.next' --exclude='logs' \
    -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Remove backups older than 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: app_backup_$DATE.tar.gz"
```

## Performance Optimization

### 1. Enable Compression

Add to `next.config.js`:
```javascript
module.exports = {
  compress: true,
  experimental: {
    optimizeCss: true,
  },
  swcMinify: true,
}
```

### 2. Database Connection Pooling

Update `lib/prisma.ts` for production:
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Production optimizations
  log: ['error'],
  errorFormat: 'minimal',
})
```

### 3. Memory Management

Add to production startup:
```bash
NODE_OPTIONS="--max_old_space_size=4096" npm start
```

## Troubleshooting Guide

### Common Issues & Solutions

1. **Database Connection Issues:**
```bash
# Check database connectivity
npx prisma db pull

# Reset connections
pm2 reload dietas-app
```

2. **Memory Leaks:**
```bash
# Monitor memory usage
pm2 monit

# Check for memory leaks
node --inspect=0.0.0.0:9229 server.js
```

3. **High CPU Usage:**
```bash
# Check PM2 logs
pm2 logs

# Monitor system resources
htop
```

4. **Database Performance:**
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check database connections
SELECT * FROM pg_stat_activity;
```

## Rollback Procedures

### Application Rollback

1. **Using PM2:**
```bash
# Stop current version
pm2 stop dietas-app

# Restore previous version
git checkout previous-stable-tag
npm ci
npm run build

# Restart application
pm2 start dietas-app
```

2. **Database Rollback:**
```bash
# Create snapshot before rollback
pg_dump $DATABASE_URL > rollback_snapshot.sql

# Apply previous migration
npx prisma migrate reset
```

### Quick Recovery Commands

```bash
# Emergency restart
pm2 restart dietas-app

# Emergency stop
pm2 stop dietas-app

# View real-time logs
pm2 logs dietas-app --lines 100

# Check application status
pm2 status
```

## Maintenance Windows

### Planned Maintenance Checklist

1. **Pre-maintenance:**
   - [ ] Notify users (if applicable)
   - [ ] Create database backup
   - [ ] Test rollback procedures
   - [ ] Prepare maintenance page

2. **During maintenance:**
   - [ ] Enable maintenance mode
   - [ ] Apply updates/patches
   - [ ] Run database migrations
   - [ ] Test critical functionalities

3. **Post-maintenance:**
   - [ ] Verify all services running
   - [ ] Check error logs
   - [ ] Monitor performance metrics
   - [ ] Disable maintenance mode

## Security Hardening

### Server Security

1. **Update System:**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Configure Firewall:**
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

3. **Disable Root Login:**
```bash
# Edit /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
```

### Application Security

1. **Security Headers (already implemented in middleware)**
2. **Rate Limiting (already implemented)**
3. **Input Validation (already implemented with Zod)**
4. **RBAC (already implemented)**

## Final Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Security hardening complete
- [ ] Performance testing passed
- [ ] Error tracking operational
- [ ] Documentation updated
- [ ] Team trained on deployment process

## Contact & Support

For production issues:
1. Check application logs: `pm2 logs`
2. Check system resources: `htop`, `df -h`
3. Verify database connectivity
4. Review error tracking dashboard
5. Contact development team if needed

Remember to always test deployment procedures in a staging environment before applying to production.