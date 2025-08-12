/**
 * Supabase Deployment Script
 * Handles complete deployment process to Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployToSupabase() {
  console.log('🚀 Starting Supabase deployment process...\n');

  try {
    // 1. Environment validation
    console.log('1️⃣ Validating environment variables...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'DIRECT_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    console.log('✅ Environment variables validated\n');

    // 2. Setup Supabase schema
    console.log('2️⃣ Setting up Supabase-optimized schema...');
    execSync('npm run db:setup-supabase', { stdio: 'inherit' });
    console.log('✅ Supabase schema configured\n');

    // 3. Generate Prisma client
    console.log('3️⃣ Generating Prisma client...');
    execSync('npm run db:generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');

    // 4. Deploy database migrations
    console.log('4️⃣ Deploying database migrations...');
    execSync('npm run db:migrate:deploy', { stdio: 'inherit' });
    console.log('✅ Database migrations deployed\n');

    // 5. Build application
    console.log('5️⃣ Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Application built successfully\n');

    // 6. Deployment instructions
    console.log('🎉 Deployment preparation complete!\n');
    console.log('📋 Next steps to complete deployment:\n');
    
    console.log('1. Run the RLS policies in Supabase:');
    console.log('   - Go to your Supabase dashboard');
    console.log('   - Navigate to SQL Editor');
    console.log('   - Run the contents of scripts/setup-rls-policies.sql\n');
    
    console.log('2. Deploy to your hosting platform:');
    console.log('   - Vercel: git push origin main (with environment variables set)');
    console.log('   - Netlify: Connect repository and set environment variables');
    console.log('   - Or deploy manually using npm run start\n');
    
    console.log('3. Seed initial data (optional):');
    console.log('   - Visit: https://your-domain.com/api/admin/seed');
    console.log('   - Or run: npm run db:seed\n');
    
    console.log('4. Create admin user:');
    console.log('   - Run: node scripts/make-admin.js [email]\n');

    console.log('✨ Deployment guide complete!');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Utility function to check if file exists
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployToSupabase();
}

module.exports = { deployToSupabase };