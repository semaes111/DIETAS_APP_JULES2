import { NextRequest, NextResponse } from "next/server"
import { RequirePermission } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { Cache } from "@/lib/cache"

// GET /api/metrics - System metrics for monitoring (admin only)
export const GET = RequirePermission.viewAnalytics(async (req: NextRequest, context) => {
  try {
    const [
      userCount,
      foodCount,
      recipeCount,
      mealPlanCount,
      recentUserCount,
      cacheStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.food.count(),
      prisma.recipe.count(),
      prisma.mealPlan.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      Cache.getStats()
    ])

    // System metrics
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()

    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: Math.round(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        nodeVersion: process.version,
      },
      database: {
        totalUsers: userCount,
        totalFoods: foodCount,
        totalRecipes: recipeCount,
        totalMealPlans: mealPlanCount,
        newUsersLast7Days: recentUserCount,
      },
      cache: {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: Math.round(cacheStats.hitRate * 100) / 100,
        size: cacheStats.size,
        evictions: cacheStats.evictions,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        arch: process.arch,
      }
    }

    return NextResponse.json({
      success: true,
      data: metrics
    })

  } catch (error) {
    throw error
  }
})