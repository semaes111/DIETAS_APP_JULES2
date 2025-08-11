# 🚀 Vercel Deployment Checklist

## Pre-Deployment
- [ ] Code committed and pushed to GitHub
- [ ] All environment variables documented in `.env.production`
- [ ] Database connection string obtained
- [ ] NextAuth secret generated using `openssl rand -base64 32`

## Database Setup
- [ ] PostgreSQL database created (Vercel Postgres/Supabase/Railway)
- [ ] Database connection string copied
- [ ] SSL mode configured if required

## Vercel Configuration
- [ ] Project imported to Vercel from GitHub
- [ ] Environment variables added to Vercel dashboard:
  - [ ] `DATABASE_PROVIDER=postgresql`
  - [ ] `DATABASE_URL=your_connection_string`
  - [ ] `DIRECT_URL=your_connection_string`
  - [ ] `NEXTAUTH_SECRET=your_generated_secret`
  - [ ] `NEXTAUTH_URL=https://your-app.vercel.app`
  - [ ] `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
  - [ ] `NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api`
  - [ ] `APP_NAME=Dietas NutriMed`
  - [ ] `NODE_ENV=production`

## Post-Deployment
- [ ] First deployment successful
- [ ] Database initialization: Visit `/api/admin/init-db` (POST request) or run seed script
- [ ] Admin user created and accessible
- [ ] Admin password changed from default
- [ ] Basic functionality tested:
  - [ ] Homepage loads
  - [ ] User registration works
  - [ ] User login works
  - [ ] Dashboard accessible
  - [ ] Food search works
  - [ ] Admin panel accessible

## Optional Configuration
- [ ] OAuth providers configured (Google, etc.)
- [ ] Email service configured (SendGrid, etc.)
- [ ] Custom domain added (if applicable)
- [ ] Analytics/monitoring enabled
- [ ] Food database imported via admin panel

## Final Verification
- [ ] All pages load without errors
- [ ] Database operations work correctly
- [ ] Authentication flow complete
- [ ] Admin functions operational
- [ ] Performance acceptable (< 3s page loads)
- [ ] Mobile responsiveness verified

## Emergency Rollback Plan
- [ ] Previous working deployment identified
- [ ] Database backup available
- [ ] Rollback procedure documented
- [ ] Team notified of deployment

---

**Quick Commands:**

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Check deployment status
curl https://your-app.vercel.app/api/admin/init-db

# View logs
npx vercel logs your-app
```

**Useful Links:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Deployment](https://nextjs.org/docs/deployment)