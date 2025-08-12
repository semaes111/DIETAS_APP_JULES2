import { NextRequest, NextResponse } from "next/server"
import { Middleware, validateQuery, validateBody } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { CacheKeys } from "@/lib/cache"
import { foodSearchSchema, foodSchema } from "@/lib/validations"
import { requirePermission, Permission } from "@/lib/rbac"

export const dynamic = 'force-dynamic'

// GET /api/foods - Search and list foods
export const GET = Middleware.protected({
  cache: { ttl: 1800 }, // 30 minutes cache for food searches
})(async (req: NextRequest, context) => {
  const url = new URL(req.url)
  
  try {
    const query = validateQuery(foodSearchSchema, url)
    
    // Create cache key for this search
    const cacheKey = CacheKeys.foodSearch(query.search || '', query.category)

    const where: any = {
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ]
      }),
      ...(query.category && { 
        category: { 
          contains: query.category, 
          mode: 'insensitive' 
        } 
      })
    }

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: [
          { isVerified: 'desc' },
          { name: 'asc' }
        ]
      }),
      prisma.food.count({ where })
    ])

    return NextResponse.json({ 
      success: true,
      data: {
        foods,
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total
        }
      }
    })
  } catch (error) {
    throw error
  }
})

// POST /api/foods - Create new food entry
export const POST = Middleware.protected({
  validation: foodSchema,
})(async (req: NextRequest, context) => {
  // Check if user has permission to create foods
  requirePermission(Permission.CREATE_FOODS)(context.user!)
  
  const body = await validateBody(foodSchema)(req)

  try {
    // Check for duplicate barcode if provided
    if (body.barcode) {
      const existingFood = await prisma.food.findUnique({
        where: { barcode: body.barcode }
      })

      if (existingFood) {
        return NextResponse.json(
          { 
            error: 'Duplicate barcode',
            message: 'A food item with this barcode already exists',
            existingFood: existingFood
          },
          { status: 409 }
        )
      }
    }

    const food = await prisma.food.create({
      data: {
        ...body,
        isVerified: false // New foods are not verified by default
      }
    })

    // Clear relevant caches
    const cachePattern = 'foods:*'
    const { Cache } = await import('@/lib/cache')
    Cache.deletePattern(cachePattern)

    return NextResponse.json({
      success: true,
      data: { food },
      message: 'Food created successfully'
    }, { status: 201 })
  } catch (error) {
    throw error
  }
})