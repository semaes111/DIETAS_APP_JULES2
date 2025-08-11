import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface MealPlanImportData {
  name: string
  startDate: string
  endDate: string
  meals: Array<{
    date: string
    type: string
    name?: string
    foods: Array<{
      foodName: string
      quantity: number
    }>
  }>
}

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
    let parsedData: MealPlanImportData[]
    
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
        { success: false, message: 'JSON file must contain an array of meal plans' },
        { status: 400 }
      )
    }

    if (parsedData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No meal plans found in file' },
        { status: 400 }
      )
    }

    // Import meal plans
    const errors: string[] = []
    let processed = 0

    try {
      for (const mealPlanData of parsedData) {
        try {
          // Validate required fields
          if (!mealPlanData.name || !mealPlanData.startDate || !mealPlanData.endDate) {
            errors.push(`Meal plan missing required fields: name, startDate, endDate`)
            continue
          }

          // Create meal plan
          const mealPlan = await prisma.mealPlan.create({
            data: {
              userId: session.user.id,
              name: mealPlanData.name,
              startDate: new Date(mealPlanData.startDate),
              endDate: new Date(mealPlanData.endDate),
              isActive: false
            }
          })

          // Add meals if provided
          if (mealPlanData.meals && Array.isArray(mealPlanData.meals)) {
            for (const mealData of mealPlanData.meals) {
              try {
                // Create meal
                const meal = await prisma.meal.create({
                  data: {
                    mealPlanId: mealPlan.id,
                    date: new Date(mealData.date),
                    type: mealData.type.toUpperCase(),
                    name: mealData.name
                  }
                })

                // Add meal items (foods)
                if (mealData.foods && Array.isArray(mealData.foods)) {
                  for (const foodData of mealData.foods) {
                    // Find matching food
                    const food = await prisma.food.findFirst({
                      where: {
                        name: {
                          contains: foodData.foodName,
                          mode: 'insensitive'
                        }
                      }
                    })

                    if (food) {
                      // Calculate nutrition values based on quantity
                      const quantity = foodData.quantity
                      const calories = (food.caloriesPer100g * quantity) / 100
                      const protein = (food.proteinPer100g * quantity) / 100
                      const carbs = (food.carbsPer100g * quantity) / 100
                      const fat = (food.fatPer100g * quantity) / 100

                      await prisma.mealItem.create({
                        data: {
                          mealId: meal.id,
                          foodId: food.id,
                          quantity,
                          calories,
                          protein,
                          carbs,
                          fat
                        }
                      })
                    } else {
                      errors.push(`Food not found: ${foodData.foodName}`)
                    }
                  }
                }
              } catch (error) {
                errors.push(`Failed to create meal for ${mealData.date}: ${error}`)
              }
            }
          }

          processed++
        } catch (error) {
          errors.push(`Failed to import meal plan "${mealPlanData.name}": ${error}`)
        }
      }

      return NextResponse.json({
        success: processed > 0,
        message: `Successfully imported ${processed} meal plans${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        processed,
        errors
      })

    } catch (error) {
      return NextResponse.json({
        success: false,
        message: `Import failed: ${error}`,
        processed: 0,
        errors: [...errors, String(error)]
      })
    }

  } catch (error) {
    console.error('Meal plans import error:', error)
    
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
        name: "Weekly Healthy Meal Plan",
        startDate: "2024-01-01",
        endDate: "2024-01-07",
        meals: [
          {
            date: "2024-01-01",
            type: "BREAKFAST",
            name: "Morning Energy Bowl",
            foods: [
              {
                foodName: "Banana",
                quantity: 120
              },
              {
                foodName: "Brown Rice",
                quantity: 50
              }
            ]
          },
          {
            date: "2024-01-01",
            type: "LUNCH",
            name: "Grilled Chicken Salad",
            foods: [
              {
                foodName: "Chicken Breast",
                quantity: 150
              },
              {
                foodName: "Broccoli",
                quantity: 100
              },
              {
                foodName: "Olive Oil",
                quantity: 10
              }
            ]
          },
          {
            date: "2024-01-01",
            type: "DINNER",
            name: "Balanced Dinner",
            foods: [
              {
                foodName: "Chicken Breast",
                quantity: 120
              },
              {
                foodName: "Brown Rice",
                quantity: 80
              },
              {
                foodName: "Broccoli",
                quantity: 150
              }
            ]
          }
        ]
      }
    ]

    return NextResponse.json(sampleData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=sample_meal_plans.json'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Admin access required' },
      { status: 403 }
    )
  }
}