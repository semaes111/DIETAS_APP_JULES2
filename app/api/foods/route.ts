import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }),
      ...(category && { category })
    }

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' }
      }),
      prisma.food.count({ where })
    ])

    return NextResponse.json({ 
      foods, 
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }, { status: 200 })
  } catch (error) {
    console.error("Foods fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}