/**
 * Production Database Initialization Script
 * Run this script after deploying to Vercel to set up the database
 */

const { execSync } = require('child_process')

function runCommand(command, description) {
  console.log(`🔄 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Initializing production database...')
  
  try {
    // Generate Prisma client
    runCommand('npx prisma generate', 'Generating Prisma client')
    
    // Deploy migrations
    runCommand('npx prisma migrate deploy', 'Deploying database migrations')
    
    // Seed the database
    runCommand('npm run db:seed', 'Seeding database with initial data')
    
    console.log('🎉 Production database initialization completed!')
    console.log('📝 Next steps:')
    console.log('  1. Verify the database connection')
    console.log('  2. Test the admin login')
    console.log('  3. Import additional food data if needed')
    
  } catch (error) {
    console.error('❌ Production database initialization failed:', error.message)
    console.log('🔍 Troubleshooting steps:')
    console.log('  1. Check DATABASE_URL environment variable')
    console.log('  2. Verify PostgreSQL database is accessible')
    console.log('  3. Check Vercel function logs')
    console.log('  4. Ensure all environment variables are set')
    process.exit(1)
  }
}

main()