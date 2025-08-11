import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { DataImporter } from '@/lib/import-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/json', 'text/plain']
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.json')) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload a JSON file.' },
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

    // Parse JSON data
    const fileContent = await file.text()
    let parsedData
    
    try {
      parsedData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    // Ensure data is an array
    if (!Array.isArray(parsedData)) {
      return NextResponse.json(
        { success: false, message: 'JSON file must contain an array of recipes' },
        { status: 400 }
      )
    }

    if (parsedData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No recipes found in file' },
        { status: 400 }
      )
    }

    // Import the data
    const result = await DataImporter.importRecipes(parsedData, session.user.id)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Recipes import error:', error)
    
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

// Get sample JSON format
export async function GET() {
  try {
    await requireAdmin()

    const sampleData = [
      {
        name: "Grilled Chicken Salad",
        description: "A healthy and nutritious grilled chicken salad with mixed greens",
        instructions: "1. Season chicken breast with salt and pepper\n2. Grill chicken for 6-7 minutes per side\n3. Let chicken rest for 5 minutes, then slice\n4. Mix greens in a large bowl\n5. Add sliced chicken on top\n6. Drizzle with olive oil and lemon juice",
        servings: 2,
        prepTime: 15,
        cookTime: 15,
        difficulty: "Easy",
        category: "Main Course",
        ingredients: [
          {
            foodName: "Chicken Breast",
            quantity: 200,
            notes: "boneless, skinless"
          },
          {
            foodName: "Mixed Greens",
            quantity: 100,
            notes: "fresh"
          },
          {
            foodName: "Olive Oil",
            quantity: 15,
            notes: "extra virgin"
          }
        ]
      },
      {
        name: "Vegetable Stir Fry",
        description: "Quick and healthy vegetable stir fry with brown rice",
        instructions: "1. Heat oil in a wok or large pan\n2. Add vegetables and stir fry for 5-7 minutes\n3. Season with soy sauce and garlic\n4. Serve over cooked brown rice",
        servings: 4,
        prepTime: 10,
        cookTime: 10,
        difficulty: "Easy",
        category: "Vegetarian",
        ingredients: [
          {
            foodName: "Broccoli",
            quantity: 150,
            notes: "cut into florets"
          },
          {
            foodName: "Brown Rice",
            quantity: 200,
            notes: "cooked"
          }
        ]
      }
    ]

    return NextResponse.json(sampleData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=sample_recipes.json'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Admin access required' },
      { status: 403 }
    )
  }
}