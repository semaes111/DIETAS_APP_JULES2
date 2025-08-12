import { NextRequest, NextResponse } from "next/server"
import { RequirePermission } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { CacheKeys } from "@/lib/cache"

// GET /api/admin/system/stats - Detailed system statistics
export const GET = RequirePermission.viewAnalytics(async (req: NextRequest, context) => {
  try {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // User statistics
    const [
      totalUsers,
      activeUsers24h,
      activeUsers7d,
      newUsers24h,
      newUsers7d,
      newUsers30d,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.userMeal.findMany({
        where: { createdAt: { gte: last24Hours } },
        distinct: ['userId']
      }).then(meals => meals.length),
      prisma.userMeal.findMany({
        where: { createdAt: { gte: last7Days } },
        distinct: ['userId']
      }).then(meals => meals.length),
      prisma.user.count({ where: { createdAt: { gte: last24Hours } } }),
      prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
    ])

    // Content statistics
    const [
      totalFoods,
      verifiedFoods,
      totalRecipes,
      publicRecipes,
      totalMealPlans,
      activeMealPlans,
    ] = await Promise.all([
      prisma.food.count(),
      prisma.food.count({ where: { isVerified: true } }),
      prisma.recipe.count(),
      prisma.recipe.count({ where: { isPublic: true } }),
      prisma.mealPlan.count(),
      prisma.mealPlan.count({ where: { isActive: true } }),
    ])

    // Activity statistics
    const [
      mealsLogged24h,
      mealsLogged7d,
      recipesCreated7d,
      mealPlansCreated7d,
    ] = await Promise.all([
      prisma.userMeal.count({ where: { createdAt: { gte: last24Hours } } }),
      prisma.userMeal.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.recipe.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.mealPlan.count({ where: { createdAt: { gte: last7Days } } }),
    ])

    // Popular categories
    const foodCategories = await prisma.food.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 10
    })

    // User engagement levels
    const userEngagement = await prisma.userMeal.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { createdAt: { gte: last7Days } },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    })

    const stats = {
      timestamp: now.toISOString(),
      users: {
        total: totalUsers,
        active24h: activeUsers24h,
        active7d: activeUsers7d,
        new24h: newUsers24h,
        new7d: newUsers7d,
        new30d: newUsers30d,
        growthRate7d: totalUsers > 0 ? Math.round((newUsers7d / totalUsers) * 100 * 100) / 100 : 0,
      },
      content: {
        foods: {
          total: totalFoods,
          verified: verifiedFoods,
          verificationRate: totalFoods > 0 ? Math.round((verifiedFoods / totalFoods) * 100) : 0,
        },
        recipes: {
          total: totalRecipes,
          public: publicRecipes,
          publicRate: totalRecipes > 0 ? Math.round((publicRecipes / totalRecipes) * 100) : 0,
        },
        mealPlans: {
          total: totalMealPlans,
          active: activeMealPlans,
          activeRate: totalMealPlans > 0 ? Math.round((activeMealPlans / totalMealPlans) * 100) : 0,
        },
      },
      activity: {
        mealsLogged: {
          last24h: mealsLogged24h,
          last7d: mealsLogged7d,
          avgPerDay: Math.round(mealsLogged7d / 7),
        },
        content: {
          recipesCreated7d,
          mealPlansCreated7d,
        },
      },
      insights: {
        popularFoodCategories: foodCategories.map(cat => ({
          category: cat.category,
          count: cat._count.category
        })),
        topUsers: userEngagement.map(user => ({
          userId: user.userId,
          mealsLogged: user._count.id
        })),
      },
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    throw error
  }
})