import { NextRequest, NextResponse } from "next/server"
import { Middleware, validateBody } from "@/lib/api-middleware"
import { MealPlanningService } from "@/lib/meal-planning-service"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const mealPlanGenerateSchema = z.object({
  startDate: z.coerce.date(),
  name: z.string().min(1).max(200).optional(),
  save: z.boolean().optional().default(true)
})

const mealPlanningService = new MealPlanningService()

// POST /api/meal-plans/generate - Generate weekly meal plan
export const POST = Middleware.protected({
  validation: mealPlanGenerateSchema
})(async (req: NextRequest, context) => {
  const body = await validateBody<any>(mealPlanGenerateSchema)(req)
  const userId = context.user!.id

  try {
    // Get user profile with nutrition targets
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    if (!profile || !profile.targetCalories) {
      return NextResponse.json(
        { 
          error: 'User profile incomplete', 
          message: 'Please complete your profile setup first' 
        },
        { status: 400 }
      )
    }

    // Generate weekly meal plan
    const weeklyPlan = await mealPlanningService.generateWeeklyMealPlan(
      body.startDate,
      profile
    )

    let savedMealPlan = null

    // Save to database if requested
    if (body.save) {
      const endDate = new Date(body.startDate)
      endDate.setDate(endDate.getDate() + 6)

      savedMealPlan = await prisma.mealPlan.create({
        data: {
          userId,
          name: body.name || `Meal Plan - ${body.startDate.toDateString()}`,
          startDate: body.startDate,
          endDate,
          isActive: true,
          meals: {
            create: weeklyPlan.days.flatMap(day =>
              day.meals.map(meal => ({
                date: new Date(day.date),
                type: meal.type,
                name: meal.name,
                mealItems: {
                  create: meal.items.map(item => ({
                    foodId: item.foodId,
                    quantity: item.quantity,
                    calories: item.nutrition.calories,
                    protein: item.nutrition.protein,
                    carbs: item.nutrition.carbs,
                    fat: item.nutrition.fat,
                  }))
                }
              }))
            )
          }
        },
        include: {
          meals: {
            include: {
              mealItems: {
                include: {
                  food: true
                }
              }
            }
          }
        }
      })

      // Deactivate other meal plans
      await prisma.mealPlan.updateMany({
        where: {
          userId,
          id: { not: savedMealPlan.id },
          isActive: true
        },
        data: { isActive: false }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        weeklyPlan,
        ...(savedMealPlan && { savedMealPlan: { id: savedMealPlan.id, name: savedMealPlan.name } })
      }
    })
  } catch (error) {
    throw error
  }
})