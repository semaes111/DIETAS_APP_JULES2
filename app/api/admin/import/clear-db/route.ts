import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { DataImporter } from '@/lib/import-utils'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin()

    const body = await request.json()
    
    // Require confirmation for safety
    if (body.confirm !== 'CLEAR_ALL_DATA') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Confirmation required. Send { "confirm": "CLEAR_ALL_DATA" } to proceed.' 
        },
        { status: 400 }
      )
    }

    // Clear all data
    const result = await DataImporter.clearAllData()

    return NextResponse.json(result)

  } catch (error) {
    console.error('Clear database error:', error)
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

// Get current database stats
export async function GET() {
  try {
    await requireAdmin()

    const stats = await DataImporter.getImportStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to get stats' },
      { status: 500 }
    )
  }
}