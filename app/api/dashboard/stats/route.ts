import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get user profile for targets
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      )
    }

    // Get today's consumed nutrition
    const todaysMeals = await prisma.userMeal.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const consumedCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0)
    const consumedProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0)
    const consumedCarbs = todaysMeals.reduce((sum, meal) => sum + meal.carbs, 0)
    const consumedFat = todaysMeals.reduce((sum, meal) => sum + meal.fat, 0)

    // Calculate streak (simplified - just return a demo value for now)
    const streakDays = 7

    // Get latest weight
    const latestProgress = await prisma.progressLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { weight: true }
    })

    const currentWeight = latestProgress?.weight || profile.weight

    const stats = {
      targetCalories: profile.targetCalories || 2000,
      consumedCalories: Math.round(consumedCalories),
      targetProtein: profile.targetProtein || 150,
      consumedProtein: Math.round(consumedProtein),
      targetCarbs: profile.targetCarbs || 200,
      consumedCarbs: Math.round(consumedCarbs),
      targetFat: profile.targetFat || 67,
      consumedFat: Math.round(consumedFat),
      currentWeight,
      goalWeight: profile.goal === 'LOSE' ? (profile.weight || 70) - 5 : 
                   profile.goal === 'GAIN' ? (profile.weight || 70) + 5 : (profile.weight || 70),
      streakDays
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}