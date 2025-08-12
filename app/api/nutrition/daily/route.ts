import { NextRequest, NextResponse } from "next/server"
import { Middleware } from "@/lib/api-middleware"
import { CacheKeys } from "@/lib/cache"
import { NutritionService } from "@/lib/nutrition-service"
import { validateQuery } from "@/lib/api-middleware"
import { dateRangeSchema } from "@/lib/validations"

const nutritionService = new NutritionService()

// GET /api/nutrition/daily - Get daily nutrition summary
export const GET = Middleware.protected({
  cache: { ttl: 300 }, // 5 minutes cache
})(async (req: NextRequest, context) => {
  const url = new URL(req.url)
  const dateParam = url.searchParams.get('date')
  
  if (!dateParam) {
    return NextResponse.json(
      { error: 'Date parameter is required' },
      { status: 400 }
    )
  }

  const date = new Date(dateParam)
  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date format' },
      { status: 400 }
    )
  }

  const userId = context.user!.id
  const cacheKey = CacheKeys.userMealSummary(userId, dateParam)

  try {
    const summary = await nutritionService.getDailyNutritionSummary(userId, date)
    
    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error) {
    throw error
  }
})