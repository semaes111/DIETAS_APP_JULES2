import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { DataImporter } from '@/lib/import-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain']
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Parse CSV data
    const parsedData = await DataImporter.parseCSV(file)
    
    if (parsedData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No data found in file' },
        { status: 400 }
      )
    }

    // Import the data
    const result = await DataImporter.importFoods(parsedData)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Foods import error:', error)
    
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

// Get sample CSV format
export async function GET() {
  try {
    await requireAdmin()

    const sampleData = `name,brand,category,serving_size,calories_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,fiber_per_100g,sugar_per_100g,sodium_per_100g
Chicken Breast,Generic,Protein,100,165,31,0,3.6,0,0,74
Brown Rice,Generic,Grains,100,111,2.6,23,0.9,1.8,0.4,5
Broccoli,Fresh,Vegetables,100,34,2.8,7,0.4,2.6,1.5,33
Banana,Fresh,Fruits,100,89,1.1,23,0.3,2.6,12,1
Olive Oil,Extra Virgin,Fats,100,884,0,0,100,0,0,2`

    return new NextResponse(sampleData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=sample_foods.csv'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Admin access required' },
      { status: 403 }
    )
  }
}