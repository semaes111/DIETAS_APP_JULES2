import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mediterraneanFoods } from "@/lib/food-data"

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if foods already exist
    const existingFoodsCount = await prisma.food.count()
    
    if (existingFoodsCount > 0) {
      return NextResponse.json(
        { message: "Food database already seeded", count: existingFoodsCount },
        { status: 200 }
      )
    }

    // Seed the database with Mediterranean foods
    const foods = await prisma.food.createMany({
      data: mediterraneanFoods.map(food => ({
        ...food,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    })

    return NextResponse.json(
      { 
        message: "Food database seeded successfully", 
        count: foods.count 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Food seeding error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}