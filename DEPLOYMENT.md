# 🚀 Deployment Guide - DIETAS APP

This guide will walk you through deploying the DIETAS-APP to Vercel with a PostgreSQL database.

## 📋 Prerequisites

- Node.js 18+ installed locally
- Vercel CLI installed: `npm i -g vercel`
- A Vercel account
- A PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)

## ✅ Recent Deployment Fixes Applied

This repository has been optimized for Vercel deployment with the following fixes:

### 🔧 Technical Fixes Applied
- **Fixed viewport metadata export** in root layout for Next.js 14 compatibility
- **Added force-dynamic exports** to all API routes requiring server-side execution
- **Optimized Next.js configuration** with standalone output and improved webpack settings
- **Fixed server/client-side rendering issues** with proper 'use client' directives
- **Enhanced TypeScript configuration** with strict mode maintained
- **Added comprehensive production environment templates**

### 🚀 Build Verification
- ✅ Local build process tested and verified
- ✅ All API routes properly configured for dynamic server usage
- ✅ TypeScript compilation successful with zero errors
- ✅ No client-side code executing on server
- ✅ Metadata configuration compliant with Next.js 14

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to the "Storage" tab
3. Create a new Postgres database
4. Copy the connection strings

### Option 2: Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

### Option 3: Railway

1. Create a new project at [railway.app](https://railway.app)
2. Add a PostgreSQL service
3. Copy the connection string from the service variables

## 🔐 Environment Variables Setup

### Step 1: Generate Secure Keys

Generate a secure NextAuth secret:
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

### Step 2: Set Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables and add:

**Required Variables:**
```env
DATABASE_PROVIDER=postgresql
DATABASE_URL=your_postgresql_connection_string
DIRECT_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app/api
APP_NAME=Dietas NutriMed
NODE_ENV=production
```

**Optional Variables:**
```env
# Admin user for initial setup (optional)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password

# OAuth providers (if using social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Additional services
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@yourdomain.com
```

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all changes are committed:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project
5. Add the environment variables (see step above)
6. Click "Deploy"

#### Option B: Using Vercel CLI

1. Login to Vercel:
```bash
npx vercel login
```

2. Deploy the project:
```bash
npx vercel
```

3. Follow the prompts:
   - Link to existing project or create new one
   - Choose your project settings

### Step 3: Initialize Production Database

After the first deployment, you need to run database migrations:

#### Option A: Using Vercel CLI
```bash
npx vercel env pull .env.production
npx prisma migrate deploy
npx prisma generate
node scripts/seed-production.js
```

#### Option B: Trigger via API (Recommended)

The app includes an initialization endpoint. Visit:
```
https://your-app-name.vercel.app/api/admin/init-db
```

Or run the init script manually in Vercel's function logs.

## 🔧 Post-Deployment Configuration

### 1. Verify Database Connection

Visit your app and check:
- ✅ Homepage loads correctly
- ✅ Authentication works
- ✅ Database connections are working

### 2. Admin Access

1. If you set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, use those credentials
2. Otherwise, the seed script creates: `admin@nutrimed.com` / `AdminPassword123!`
3. **Important:** Change the admin password immediately after first login

### 3. Import Food Data

1. Login as admin
2. Go to `/admin/import`
3. Import your food database CSV files
4. Verify the data was imported correctly

## 🔍 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Check build logs in Vercel dashboard
# Common fixes:
- Ensure all environment variables are set
- Check for TypeScript errors
- Verify database connection string format
```

#### Database Connection Issues
```bash
# Verify environment variables:
- DATABASE_URL format is correct
- DATABASE_PROVIDER is set to "postgresql"
- Connection string includes SSL parameters if required
```

#### NextAuth Issues
```bash
# Check:
- NEXTAUTH_URL matches your domain exactly
- NEXTAUTH_SECRET is properly generated
- OAuth credentials (if using) are correct
```

### Debug Steps

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions
   - Click on failed functions to see logs

2. **Test Database Connection:**
   ```bash
   # Locally with production env
   cp .env.production .env
   npx prisma db push
   ```

3. **Verify Environment Variables:**
   ```bash
   npx vercel env ls
   ```

## 📊 Performance Optimization

### 1. Database Optimization

- **Indexes:** Consider adding database indexes for frequently queried fields
- **Connection Pooling:** Use connection pooling for high-traffic applications
- **Query Optimization:** Monitor slow queries and optimize as needed

### 2. Caching Strategy

- **Static Assets:** Vercel automatically caches static assets
- **API Responses:** Implement caching for frequently accessed data
- **Database Queries:** Use Redis for caching if needed

### 3. Monitoring

- **Vercel Analytics:** Enable Vercel Analytics for performance monitoring
- **Sentry:** Add Sentry for error tracking (optional)
- **Database Monitoring:** Monitor database performance and connection usage

## 🔒 Security Checklist

- ✅ Strong NEXTAUTH_SECRET generated
- ✅ Database uses SSL connections
- ✅ Admin password changed from default
- ✅ Environment variables properly set
- ✅ HTTPS enforced (automatic with Vercel)
- ✅ Security headers configured (via next.config.js)

## 📱 Testing Production Deployment

### 1. Functional Tests
- [ ] User registration works
- [ ] User login/logout works
- [ ] Food search and logging works
- [ ] Meal planning works
- [ ] Admin functions work
- [ ] Recipe management works

### 2. Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Database queries optimized
- [ ] Images load properly

### 3. Security Tests
- [ ] Authentication required for protected routes
- [ ] Admin routes protected
- [ ] SQL injection protection
- [ ] XSS protection

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review Vercel function logs
3. Verify all environment variables are correctly set
4. Test database connection independently

---

**Deployment Checklist:**
- [ ] Database set up and connection string obtained
- [ ] All environment variables added to Vercel
- [ ] Repository deployed to Vercel
- [ ] Database migrations run successfully
- [ ] Admin user created and password changed
- [ ] Food data imported
- [ ] Production testing completed
- [ ] Performance and security verified

🎉 **Congratulations!** Your DIETAS-APP is now running in production on Vercel!