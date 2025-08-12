/**
 * Health Check API Route for Supabase Deployment
 * Verifies database connectivity and application status
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { Cache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 1. Check database connection via Prisma
    const dbCheck = await Promise.race([
      prisma.$queryRaw`SELECT 1 as connected`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ])

    // 2. Check Supabase connection
    const supabaseCheck = await supabase.from('users').select('count').limit(1)
    
    // 3. Check cache
    let cacheCheck = false
    try {
      const testKey = 'health-check-test'
      Cache.set(testKey, 'test-value', 10)
      const value = Cache.get(testKey)
      Cache.delete(testKey)
      cacheCheck = value === 'test-value'
    } catch (error) {
      console.warn('Cache check failed:', error)
    }
    
    // 4. Get basic system info
    const responseTime = Date.now() - startTime
    const memoryUsage = process.memoryUsage()
    
    // 5. Environment check
    const envCheck = {
      hasDatabase: !!process.env.DATABASE_URL,
      hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAuth: !!process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
      databaseProvider: process.env.DATABASE_PROVIDER
    }

    // 6. Get database stats (if accessible)
    let dbStats = null
    try {
      const userCount = await prisma.user.count()
      const foodCount = await prisma.food.count()
      const mealCount = await prisma.userMeal.count()
      
      dbStats = {
        users: userCount,
        foods: foodCount,
        meals: mealCount
      }
    } catch (error) {
      console.warn('Could not fetch database stats:', error)
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: envCheck,
      database: {
        connected: !!dbCheck,
        provider: 'postgresql',
        stats: dbStats
      },
      supabase: {
        connected: !supabaseCheck.error,
        error: supabaseCheck.error?.message || null
      },
      cache: {
        working: cacheCheck
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      },
      services: {
        prisma: '✅ Connected',
        supabase: supabaseCheck.error ? '❌ Error' : '✅ Connected',
        nextauth: envCheck.hasAuth ? '✅ Configured' : '❌ Missing',
        cache: cacheCheck ? '✅ Working' : '❌ Error'
      }
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAuth: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// Also support HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new Response(null, { status: 200 })
  } catch (error) {
    return new Response(null, { status: 503 })
  }
}