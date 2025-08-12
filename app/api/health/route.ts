import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Test database connection
    let databaseConnected = false
    let supabaseConnected = false
    let error = null
    
    try {
      // Simple query to test connection
      const { data, error: dbError } = await supabase
        .from('foods')
        .select('count(*)')
        .limit(1)
      
      if (!dbError) {
        databaseConnected = true
        supabaseConnected = true
      } else {
        error = dbError.message
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown database error'
    }
    
    const responseTime = Date.now() - startTime
    
    const healthStatus = {
      status: databaseConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        connected: databaseConnected,
        error: error
      },
      supabase: {
        connected: supabaseConnected,
        error: error
      },
      services: {
        api: 'operational',
        auth: supabaseConnected ? 'operational' : 'degraded'
      },
      responseTime: `${responseTime}ms`
    }
    
    return NextResponse.json(healthStatus, { 
      status: databaseConnected ? 200 : 503 
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      supabase: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      services: {
        api: 'error',
        auth: 'error'
      },
      responseTime: `${Date.now() - startTime}ms`
    }, { status: 503 })
  }
}