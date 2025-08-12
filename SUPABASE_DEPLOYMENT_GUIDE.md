# DIETAS_APP_JULES2 - Complete Supabase Deployment Guide

This guide provides step-by-step instructions to deploy your Mediterranean diet application to Supabase production environment.

## 🗂️ Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [Row Level Security Setup](#row-level-security-setup)
6. [Application Deployment](#application-deployment)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Git repository with your application code
- ✅ Supabase account (free tier available)
- ✅ Vercel/Netlify account for hosting (optional)
- ✅ Basic PostgreSQL knowledge

### Required Tools

```bash
# Install dependencies
npm install

# Verify Prisma CLI
npx prisma --version

# Verify build process
npm run build
```

---

## 2. Supabase Project Setup

### 2.1 Create Supabase Project

1. **Visit Supabase Dashboard:**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in or create account

2. **Create New Project:**
   - Click "New Project"
   - Organization: Choose or create
   - Name: `dietas-app-jules2-prod`
   - Database Password: **Generate strong password and save securely**
   - Region: Choose closest to your users
   - Click "Create new project"

3. **Wait for Setup:**
   - Project initialization takes 2-3 minutes
   - Note your project reference ID (e.g., `abcdefghijk`)

### 2.2 Get Connection Details

Navigate to **Settings > Database** in your Supabase dashboard:

```bash
# Connection Pooler (for DATABASE_URL)
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Direct Connection (for DIRECT_URL)
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### 2.3 Get API Keys

Navigate to **Settings > API**:

- **Project URL:** `https://[PROJECT-REF].supabase.co`
- **Anon Key:** `eyJ...` (public key)
- **Service Role Key:** `eyJ...` (private key, keep secure)

---

## 3. Environment Configuration

### 3.1 Create Environment File

Create `.env.local` for development and `.env.production` for production:

```bash
# Copy template
cp .env.production.example .env.local

# Edit with your values
nano .env.local
```

### 3.2 Required Environment Variables

```env
# Database Configuration
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3.3 Generate NextAuth Secret

```bash
# Generate secure secret
openssl rand -base64 32

# Or use online generator
# Visit: https://generate-secret.vercel.app/32
```

---

## 4. Database Migration

### 4.1 Setup Supabase Schema

```bash
# Switch to Supabase-optimized schema
npm run db:setup-supabase

# Generate Prisma client
npm run db:generate
```

### 4.2 Deploy Migrations

```bash
# Create and deploy migrations
npx prisma migrate dev --name "initial_supabase_migration"

# For production deployment
npm run db:migrate:deploy
```

### 4.3 Verify Database Schema

```bash
# Open Prisma Studio to verify
npm run db:studio

# Or check in Supabase dashboard
# Go to Table Editor to see your tables
```

---

## 5. Row Level Security Setup

### 5.1 Enable RLS in Supabase

1. **Open Supabase Dashboard:**
   - Navigate to **SQL Editor**

2. **Run RLS Setup Script:**
   - Copy contents of `scripts/setup-rls-policies.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Policies:**
   - Go to **Authentication > Policies**
   - Verify all tables have appropriate RLS policies

### 5.2 Test RLS Policies

```bash
# Test API endpoints with authentication
curl -X GET "https://your-project.supabase.co/rest/v1/users" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"

# Should return empty or error (protected by RLS)
```

---

## 6. Application Deployment

### 6.1 Deploy Using Script

```bash
# Run automated deployment
npm run deploy:supabase

# Or deploy manually step by step
npm run deploy:prepare
npm run build
```

### 6.2 Deploy to Vercel

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository

2. **Configure Environment Variables:**
   - In Vercel dashboard: Settings > Environment Variables
   - Add all variables from your `.env.production`
   - Set for Production, Preview, and Development

3. **Deploy:**
   - Push to main branch or click "Deploy" in Vercel
   - Monitor build logs for errors

### 6.3 Deploy to Other Platforms

**Netlify:**
```bash
# Add environment variables in Netlify dashboard
# Build settings:
# Build command: npm run build
# Publish directory: .next
```

**Self-hosted:**
```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name "dietas-app" -- start
```

---

## 7. Post-Deployment Testing

### 7.1 Health Check

```bash
# Test application health
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "database": { "connected": true },
  "supabase": { "connected": true }
}
```

### 7.2 Test Authentication

1. **Visit Application:**
   - Go to `https://your-domain.com`
   - Click "Sign In"

2. **Test Registration:**
   - Create new account
   - Verify email functionality
   - Check database for user record

3. **Test Google OAuth (if configured):**
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Verify user creation

### 7.3 Test Core Functionality

**User Profile:**
- [ ] Create/update profile
- [ ] Set dietary preferences
- [ ] Calculate nutrition targets

**Meal Tracking:**
- [ ] Search foods
- [ ] Add meals
- [ ] View nutrition summary
- [ ] Edit/delete meals

**Progress Tracking:**
- [ ] Log weight
- [ ] Log measurements
- [ ] View progress charts

**Recipes:**
- [ ] Create recipes
- [ ] Share recipes
- [ ] View public recipes

**Admin Features:**
- [ ] Create admin user: `npm run make-admin admin@example.com`
- [ ] Access admin panel
- [ ] Import food data
- [ ] View user statistics

---

## 8. Monitoring and Maintenance

### 8.1 Setup Monitoring

```bash
# Run health monitoring
npm run backup:monitor

# Schedule automated backups
npm run backup:full
```

### 8.2 Performance Monitoring

1. **Monitor Response Times:**
   - Check `/api/health` endpoint regularly
   - Set up uptime monitoring (UptimeRobot, Pingdom)

2. **Database Performance:**
   - Monitor slow queries in Supabase dashboard
   - Check connection pool usage
   - Review RLS policy performance

3. **Application Metrics:**
   - Monitor memory usage
   - Track API error rates
   - Check cache hit rates

### 8.3 Regular Maintenance

**Daily:**
- [ ] Check application health
- [ ] Monitor error logs
- [ ] Verify backup completion

**Weekly:**
- [ ] Review performance metrics
- [ ] Update dependencies if needed
- [ ] Clean old logs and backups

**Monthly:**
- [ ] Database performance review
- [ ] Security audit
- [ ] Capacity planning review

---

## 9. Troubleshooting

### 9.1 Common Issues

**Database Connection Errors:**
```bash
# Check environment variables
echo $DATABASE_URL
echo $DIRECT_URL

# Test connection
npx prisma db pull
```

**Authentication Issues:**
```bash
# Verify NextAuth configuration
curl -X GET "https://your-domain.com/api/auth/providers"

# Check session
curl -X GET "https://your-domain.com/api/auth/session"
```

**RLS Policy Issues:**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test policy
SELECT * FROM users WHERE id = auth.uid();
```

### 9.2 Performance Issues

**Slow Queries:**
```sql
-- Enable query logging in Supabase
-- Check slow query log in Dashboard > Settings > Database

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_user_meals_user_date 
ON user_meals(user_id, date);
```

**High Memory Usage:**
```bash
# Check memory usage
npm run backup:monitor

# Restart application if needed
pm2 restart dietas-app
```

### 9.3 Getting Help

**Logs and Debugging:**
```bash
# Application logs
tail -f logs/application.log

# Database logs
# Check in Supabase Dashboard > Logs

# Vercel logs
vercel logs your-deployment-url
```

**Support Resources:**
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 🎉 Deployment Complete!

Your DIETAS_APP_JULES2 Mediterranean diet application is now deployed to Supabase! 

**Next Steps:**
1. Create your first admin user
2. Import initial food data
3. Configure monitoring alerts
4. Share with your users

**Quick Commands:**
```bash
# Create admin
npm run make-admin your-email@domain.com

# Seed data
npm run db:seed

# Monitor health
npm run backup:monitor

# Full backup
npm run backup:full
```

For questions or issues, check the troubleshooting section above or create an issue in the repository.