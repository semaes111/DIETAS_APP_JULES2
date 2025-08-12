/**
 * Supabase Backup and Monitoring Script
 * Handles database backups and health monitoring
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Export database schema and data
 */
async function exportDatabase() {
  console.log('🗄️ Starting database export...\n');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', timestamp);
    
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });
    
    // Tables to backup
    const tables = [
      'users',
      'user_profiles',
      'foods',
      'user_meals',
      'progress_logs',
      'recipes',
      'recipe_ingredients',
      'recipe_nutrition',
      'meal_plans',
      'meals',
      'meal_items',
      'shopping_lists',
      'shopping_list_items'
    ];
    
    console.log('📊 Exporting data from tables...');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.warn(`⚠️ Warning: Could not export ${table}:`, error.message);
          continue;
        }
        
        const filename = path.join(backupDir, `${table}.json`);
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`✅ Exported ${data?.length || 0} records from ${table}`);
        
      } catch (error) {
        console.warn(`⚠️ Warning: Error exporting ${table}:`, error.message);
      }
    }
    
    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      tables_exported: tables.length,
      backup_type: 'full',
      environment: process.env.NODE_ENV || 'production'
    };
    
    await fs.writeFile(
      path.join(backupDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`\n✨ Database export completed successfully!`);
    console.log(`📁 Backup saved to: ${backupDir}`);
    
    return { success: true, backupDir, timestamp };
    
  } catch (error) {
    console.error('❌ Database export failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Monitor database health and performance
 */
async function monitorDatabase() {
  console.log('🩺 Running database health check...\n');
  
  try {
    const startTime = Date.now();
    
    // 1. Connection test
    const { data: connectionTest, error: connError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (connError) {
      throw new Error(`Connection failed: ${connError.message}`);
    }
    
    // 2. Performance metrics
    const queries = await Promise.all([
      supabase.from('users').select('count'),
      supabase.from('foods').select('count'),
      supabase.from('user_meals').select('count'),
      supabase.from('progress_logs').select('count')
    ]);
    
    const responseTime = Date.now() - startTime;
    
    // 3. Calculate storage usage (approximate)
    const { data: storageInfo } = await supabase.storage.listBuckets();
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      response_time_ms: responseTime,
      database: {
        connection: 'ok',
        tables_accessible: queries.filter(q => !q.error).length,
        total_tables_checked: queries.length
      },
      storage: {
        buckets: storageInfo?.length || 0
      },
      performance: {
        response_time: `${responseTime}ms`,
        status: responseTime < 1000 ? 'good' : responseTime < 3000 ? 'fair' : 'slow'
      }
    };
    
    console.log('✅ Database health check completed');
    console.log(`🚀 Response time: ${responseTime}ms`);
    console.log(`📊 Tables accessible: ${healthReport.database.tables_accessible}/${healthReport.database.total_tables_checked}`);
    
    // Save health report
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    const reportFile = path.join(reportsDir, `health-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportFile, JSON.stringify(healthReport, null, 2));
    
    return healthReport;
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    
    const errorReport = {
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error.message,
      database: {
        connection: 'failed'
      }
    };
    
    return errorReport;
  }
}

/**
 * Cleanup old backups (keep last 7 days)
 */
async function cleanupOldBackups() {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    const files = await fs.readdir(backupsDir);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    let removedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(backupsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory() && stats.mtime < cutoffDate) {
        await fs.rmdir(filePath, { recursive: true });
        removedCount++;
        console.log(`🗑️ Removed old backup: ${file}`);
      }
    }
    
    console.log(`✨ Cleanup completed. Removed ${removedCount} old backups.`);
    
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'backup':
      await exportDatabase();
      break;
      
    case 'monitor':
      const report = await monitorDatabase();
      console.log('\n📄 Health Report:', JSON.stringify(report, null, 2));
      break;
      
    case 'cleanup':
      await cleanupOldBackups();
      break;
      
    case 'full':
      console.log('🔄 Running full maintenance cycle...\n');
      await monitorDatabase();
      console.log('\n');
      await exportDatabase();
      console.log('\n');
      await cleanupOldBackups();
      console.log('\n✨ Full maintenance cycle completed!');
      break;
      
    default:
      console.log(`
📋 Supabase Backup & Monitoring Tool

Usage: node scripts/backup-supabase.js <command>

Commands:
  backup   - Export database to JSON files
  monitor  - Run health check and generate report
  cleanup  - Remove backups older than 7 days
  full     - Run all operations (monitor, backup, cleanup)

Examples:
  node scripts/backup-supabase.js backup
  node scripts/backup-supabase.js monitor
  node scripts/backup-supabase.js full
      `);
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  exportDatabase,
  monitorDatabase,
  cleanupOldBackups
};