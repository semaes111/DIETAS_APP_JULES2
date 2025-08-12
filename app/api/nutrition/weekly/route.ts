import { NextRequest, NextResponse } from "next/server"
import { Middleware } from "@/lib/api-middleware"
import { NutritionService } from "@/lib/nutrition-service"
import { validateQuery } from "@/lib/api-middleware"
import { dateRangeSchema } from "@/lib/validations"

const nutritionService = new NutritionService()

// GET /api/nutrition/weekly - Get weekly nutrition trend
export const GET = Middleware.protected({
  cache: { ttl: 600 }, // 10 minutes cache
})(async (req: NextRequest, context) => {
  const url = new URL(req.url)
  
  try {
    const query = validateQuery<any>(dateRangeSchema, url)
    const userId = context.user!.id

    const trend = await nutritionService.getWeeklyNutritionTrend(
      userId, 
      query.startDate, 
      query.endDate
    )
    
    return NextResponse.json({
      success: true,
      data: {
        trend,
        period: {
          startDate: query.startDate.toISOString().split('T')[0],
          endDate: query.endDate.toISOString().split('T')[0]
        }
      }
    })
  } catch (error) {
    throw error
  }
})