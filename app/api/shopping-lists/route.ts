import { NextRequest, NextResponse } from "next/server"
import { Middleware, validateQuery } from "@/lib/api-middleware"
import { ShoppingListService } from "@/lib/shopping-list-service"
import { paginationSchema } from "@/lib/validations"
import { z } from "zod"

const shoppingListQuerySchema = paginationSchema.extend({
  type: z.enum(['user', 'mediterranean', 'recurring']).optional().default('user'),
  days: z.coerce.number().min(1).max(30).optional().default(7)
})

const shoppingListService = new ShoppingListService()

// GET /api/shopping-lists - Get user shopping lists or generate suggestions
export const GET = Middleware.protected({
  cache: { ttl: 300 }, // 5 minutes cache
})(async (req: NextRequest, context) => {
  const url = new URL(req.url)
  
  try {
    const query = validateQuery(shoppingListQuerySchema, url)
    const userId = context.user!.id

    let data

    switch (query.type) {
      case 'user':
        data = await shoppingListService.getUserShoppingLists(userId, query.limit)
        break
      
      case 'mediterranean':
        data = await shoppingListService.getMediterraneanSuggestions()
        break
      
      case 'recurring':
        data = await shoppingListService.generateRecurringList(userId, query.days)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        type: query.type,
        ...(query.type === 'user' && {
          pagination: {
            limit: query.limit,
            offset: query.offset
          }
        })
      }
    })
  } catch (error) {
    throw error
  }
})