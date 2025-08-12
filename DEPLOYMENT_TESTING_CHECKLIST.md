# Supabase Deployment Testing Checklist

Use this comprehensive checklist to verify your DIETAS_APP_JULES2 deployment to Supabase.

## ✅ Pre-Deployment Validation

### Environment Setup
- [ ] All environment variables configured in `.env.local`
- [ ] Database connections strings tested
- [ ] Supabase API keys validated
- [ ] NextAuth secret generated (32+ characters)
- [ ] Build process completes without errors
- [ ] TypeScript compilation successful
- [ ] All tests pass: `npm run test:ci`

### Supabase Configuration
- [ ] Supabase project created and active
- [ ] PostgreSQL database provisioned
- [ ] API keys copied from dashboard
- [ ] Connection pooling enabled
- [ ] SSL mode configured

---

## 🚀 Deployment Process

### Database Migration
- [ ] Supabase schema activated: `npm run db:setup-supabase`
- [ ] Prisma client generated: `npm run db:generate`
- [ ] Database migrations deployed: `npm run db:migrate:deploy`
- [ ] All tables created in Supabase dashboard
- [ ] Indexes and constraints applied

### Row Level Security
- [ ] RLS policies script executed in Supabase SQL Editor
- [ ] All tables have RLS enabled
- [ ] User access policies working
- [ ] Admin policies configured
- [ ] Public food access enabled

### Application Deployment
- [ ] Application builds successfully: `npm run build`
- [ ] No TypeScript errors
- [ ] No ESLint warnings (or acceptable)
- [ ] Production deployment completed
- [ ] Environment variables set in hosting platform

---

## 🔍 Post-Deployment Testing

### Health Checks

#### API Health Check
```bash
curl https://your-domain.com/api/health
```

Expected Response:
```json
{
  "status": "healthy",
  "database": { "connected": true },
  "supabase": { "connected": true },
  "services": {
    "prisma": "✅ Connected",
    "supabase": "✅ Connected",
    "nextauth": "✅ Configured"
  }
}
```

- [ ] Health endpoint returns 200 status
- [ ] Database connection confirmed
- [ ] Supabase connection confirmed
- [ ] All services showing as healthy
- [ ] Response time under 1000ms

### Authentication Testing

#### NextAuth.js Authentication
- [ ] Visit `/auth/signin` page loads
- [ ] Email/password login form visible
- [ ] Google OAuth button present (if configured)
- [ ] Sign up flow functional
- [ ] Password validation working

#### User Registration Test
1. **Create Test User:**
   - [ ] Fill registration form
   - [ ] Email validation works
   - [ ] User created in Supabase `users` table
   - [ ] Profile record created
   - [ ] Session established

2. **Login Test:**
   - [ ] Existing user can log in
   - [ ] Session persists on page refresh
   - [ ] User data displayed correctly
   - [ ] Logout functionality works

#### OAuth Testing (if enabled)
- [ ] Google OAuth redirect works
- [ ] User consent screen appears
- [ ] Account linking successful
- [ ] Profile data populated

### Database Operations

#### User Profile Management
1. **Profile Creation:**
   - [ ] Navigate to profile settings
   - [ ] Fill profile information (age, gender, height, weight)
   - [ ] Select activity level and goals
   - [ ] Save profile successfully
   - [ ] BMR/TDEE calculated correctly

2. **Profile Updates:**
   - [ ] Edit profile fields
   - [ ] Changes save to database
   - [ ] Nutrition targets recalculated
   - [ ] Changes reflect immediately

#### Food Database
1. **Food Search:**
   - [ ] Search for common foods (e.g., "chicken")
   - [ ] Results load within 2 seconds
   - [ ] Search supports partial matches
   - [ ] Categories filter correctly
   - [ ] Pagination works (if implemented)

2. **Food Details:**
   - [ ] Food nutrition information displayed
   - [ ] Per 100g values shown correctly
   - [ ] Brand information (if available)
   - [ ] Serving size calculations accurate

#### Meal Tracking
1. **Add Meals:**
   - [ ] Search and select food items
   - [ ] Enter quantity (grams/servings)
   - [ ] Select meal type (breakfast, lunch, dinner, snack)
   - [ ] Nutrition calculated correctly
   - [ ] Meal saved to database

2. **View Daily Meals:**
   - [ ] Today's meals displayed
   - [ ] Grouped by meal type
   - [ ] Total nutrition summary shown
   - [ ] Progress toward daily goals visible

3. **Edit/Delete Meals:**
   - [ ] Edit meal quantities
   - [ ] Delete individual meals
   - [ ] Nutrition totals update immediately
   - [ ] Changes persist on refresh

#### Progress Tracking
1. **Log Progress:**
   - [ ] Enter weight measurements
   - [ ] Log body measurements (waist, chest, etc.)
   - [ ] Add mood and energy level
   - [ ] Record sleep hours and water intake
   - [ ] Save progress entry

2. **View Progress:**
   - [ ] Progress chart displays correctly
   - [ ] Weight trends visible
   - [ ] Date range selection works
   - [ ] Export functionality (if implemented)

#### Recipe Management
1. **Create Recipe:**
   - [ ] Add recipe title and description
   - [ ] Enter ingredients with quantities
   - [ ] Add cooking instructions
   - [ ] Set servings and cooking time
   - [ ] Save recipe successfully

2. **Recipe Sharing:**
   - [ ] Mark recipe as public
   - [ ] View public recipes from other users
   - [ ] Recipe search functionality
   - [ ] Nutrition information calculated

### Security Testing

#### Row Level Security
1. **User Data Isolation:**
   - [ ] Users can only see their own meals
   - [ ] Profile data protected
   - [ ] Progress logs private
   - [ ] Recipes respect privacy settings

2. **API Security:**
   ```bash
   # Test unauthorized access
   curl -X GET "https://your-domain.com/api/user/profile" \
     -H "Content-Type: application/json"
   # Should return 401 Unauthorized
   ```
   - [ ] API endpoints require authentication
   - [ ] Invalid tokens rejected
   - [ ] Rate limiting functional (if implemented)

#### Admin Access
1. **Create Admin User:**
   ```bash
   npm run make-admin admin@example.com
   ```
   - [ ] Admin user created successfully
   - [ ] Admin flag set in database

2. **Admin Panel Access:**
   - [ ] Admin panel accessible at `/admin`
   - [ ] Non-admin users redirected
   - [ ] Admin can view all users
   - [ ] Food database management available

### Performance Testing

#### Response Times
- [ ] Homepage loads under 2 seconds
- [ ] Food search under 1 second
- [ ] Meal logging under 1 second
- [ ] Profile updates under 1 second
- [ ] Database queries optimized

#### Caching
- [ ] Food search results cached
- [ ] User profile data cached
- [ ] Static assets cached properly
- [ ] Cache invalidation working

#### Mobile Responsiveness
- [ ] Mobile layout renders correctly
- [ ] Touch interactions work
- [ ] Forms usable on mobile
- [ ] Performance acceptable on mobile

---

## 🛠️ Advanced Testing

### Load Testing
```bash
# Using curl for basic load testing
for i in {1..100}; do
  curl -s https://your-domain.com/api/health > /dev/null &
done
wait
```

- [ ] Application handles concurrent requests
- [ ] Database connections stable under load
- [ ] Response times remain acceptable
- [ ] No memory leaks detected

### Data Integrity
1. **Backup and Restore:**
   ```bash
   npm run backup
   ```
   - [ ] Backup completes without errors
   - [ ] All tables exported
   - [ ] Data integrity maintained

2. **Migration Testing:**
   - [ ] Schema migrations apply cleanly
   - [ ] No data loss during updates
   - [ ] Foreign key constraints maintained

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS/Android)

---

## 🚨 Error Handling

### Error Pages
- [ ] 404 page displays correctly
- [ ] 500 error page functional
- [ ] Authentication errors handled gracefully
- [ ] Database errors logged properly

### Validation
- [ ] Form validation working
- [ ] API input validation
- [ ] File upload validation (if implemented)
- [ ] SQL injection prevention

---

## 📊 Monitoring Setup

### Application Monitoring
- [ ] Error logging configured
- [ ] Performance metrics collected
- [ ] Uptime monitoring active
- [ ] Alert thresholds set

### Database Monitoring
- [ ] Connection pool monitoring
- [ ] Slow query detection
- [ ] Storage usage tracking
- [ ] Backup verification

---

## 🎯 User Acceptance Testing

### End-to-End User Flows

#### New User Journey
1. [ ] Visit homepage
2. [ ] Create account
3. [ ] Complete profile setup
4. [ ] Search and log first meal
5. [ ] View nutrition summary
6. [ ] Log progress entry

#### Returning User Journey
1. [ ] Login to account
2. [ ] View dashboard
3. [ ] Log meals for today
4. [ ] Check progress charts
5. [ ] Update profile if needed

#### Recipe Creation Flow
1. [ ] Navigate to recipes
2. [ ] Create new recipe
3. [ ] Add ingredients
4. [ ] Save and test recipe
5. [ ] Share recipe (if desired)

---

## 📝 Final Checklist

Before going live:

### Security Review
- [ ] All API keys secured
- [ ] Environment variables not exposed
- [ ] HTTPS enabled everywhere
- [ ] Security headers configured
- [ ] RLS policies thoroughly tested

### Performance Optimization
- [ ] Database queries optimized
- [ ] Indexes created for common queries
- [ ] Caching strategy implemented
- [ ] CDN configured (if needed)
- [ ] Image optimization enabled

### Documentation
- [ ] API documentation updated
- [ ] User guide available
- [ ] Admin documentation complete
- [ ] Troubleshooting guide accessible

### Backup Strategy
- [ ] Automated backups configured
- [ ] Backup restoration tested
- [ ] Data retention policy defined
- [ ] Disaster recovery plan documented

---

## 🎉 Go Live!

Once all items are checked:

1. **Final Health Check:**
   ```bash
   npm run backup:monitor
   ```

2. **Announce Launch:**
   - Update DNS (if needed)
   - Notify users
   - Monitor initial usage

3. **Post-Launch Monitoring:**
   - Monitor error rates
   - Check performance metrics
   - Verify backup completion
   - Collect user feedback

---

## 📞 Support Contacts

- **Technical Issues:** [Your support email]
- **Supabase Support:** [Supabase Dashboard]
- **Hosting Support:** [Vercel/Netlify Dashboard]

**Emergency Rollback Plan:**
1. Revert to previous deployment
2. Restore database backup if needed
3. Update DNS if necessary
4. Notify users of any downtime