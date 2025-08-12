import { NextRequest, NextResponse } from "next/server"
import { Middleware, validateQuery } from "@/lib/api-middleware"
import { MealPlanningService } from "@/lib/meal-planning-service"
import { CacheKeys } from "@/lib/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { calculateMealTargets, calculateNutritionTargets } from "@/lib/nutrition-service"
import { MealType } from "@prisma/client"

const recommendationsQuerySchema = z.object({
  mealType: z.nativeEnum(MealType),
  excludeFoodIds: z.string().optional().transform(str => str ? str.split(',') : []),
  limit: z.coerce.number().min(1).max(50).optional().default(20)
})

const mealPlanningService = new MealPlanningService()

// GET /api/meal-plans/recommendations - Get meal recommendations
export const GET = Middleware.protected({
  cache: { ttl: 1800 }, // 30 minutes cache
})(async (req: NextRequest, context) => {
  const url = new URL(req.url)
  
  try {
    const query = validateQuery(recommendationsQuerySchema, url)
    const userId = context.user!.id

    // Get user profile for nutrition targets
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

    // Calculate nutrition targets for the specific meal type
    const dailyTargets = calculateNutritionTargets(profile)
    const mealTargets = calculateMealTargets(dailyTargets, query.mealType)

    // Generate cache key based on meal type and target calories
    const cacheKey = CacheKeys.mealPlanRecommendations(
      query.mealType, 
      mealTargets.calories
    )

    // Get recommendations
    const recommendations = await mealPlanningService.generateMealRecommendations(
      query.mealType,
      mealTargets,
      profile,
      query.excludeFoodIds
    )

    // Limit results
    const limitedRecommendations = recommendations.slice(0, query.limit)

    return NextResponse.json({
      success: true,
      data: {
        recommendations: limitedRecommendations,
        mealType: query.mealType,
        targets: mealTargets,
        totalFound: recommendations.length
      }
    })
  } catch (error) {
    throw error
  }
})