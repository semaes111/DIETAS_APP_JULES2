/**
 * Supabase Setup Script
 * This script prepares the application for Supabase deployment
 */

const fs = require('fs');
const path = require('path');

async function setupSupabase() {
  console.log('🚀 Setting up Supabase configuration...\n');

  try {
    // 1. Backup current schema
    const currentSchema = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const backupSchema = path.join(process.cwd(), 'prisma', 'schema.sqlite.backup.prisma');
    
    if (fs.existsSync(currentSchema)) {
      fs.copyFileSync(currentSchema, backupSchema);
      console.log('✅ Current schema backed up to schema.sqlite.backup.prisma');
    }

    // 2. Copy Supabase-optimized schema
    const supabaseSchema = path.join(process.cwd(), 'prisma', 'schema.supabase.prisma');
    
    if (fs.existsSync(supabaseSchema)) {
      fs.copyFileSync(supabaseSchema, currentSchema);
      console.log('✅ Supabase schema activated');
    } else {
      throw new Error('Supabase schema not found');
    }

    // 3. Update environment variables guide
    console.log('\n📋 Next steps:');
    console.log('1. Create your .env.local file with Supabase credentials');
    console.log('2. Run: npm run db:generate');
    console.log('3. Run: npm run db:migrate:deploy');
    console.log('4. Run: npm run db:seed');
    
    console.log('\n🔧 Required environment variables:');
    console.log('- DATABASE_URL (Supabase connection pooler)');
    console.log('- DIRECT_URL (Supabase direct connection)');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    console.log('- NEXTAUTH_SECRET');

    console.log('\n✨ Setup complete! Ready for Supabase deployment.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupSupabase();