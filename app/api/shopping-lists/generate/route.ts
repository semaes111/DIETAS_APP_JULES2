import { NextRequest, NextResponse } from "next/server"
import { Middleware, validateBody } from "@/lib/api-middleware"
import { ShoppingListService } from "@/lib/shopping-list-service"
import { z } from "zod"

const generateShoppingListSchema = z.object({
  type: z.enum(['mealPlan', 'recipes']),
  mealPlanId: z.string().cuid().optional(),
  recipeIds: z.array(z.string().cuid()).optional(),
  name: z.string().min(1).max(200),
  save: z.boolean().optional().default(true)
}).refine(
  (data) => 
    (data.type === 'mealPlan' && data.mealPlanId) ||
    (data.type === 'recipes' && data.recipeIds && data.recipeIds.length > 0),
  {
    message: "Either mealPlanId or recipeIds must be provided based on type",
  }
)

const shoppingListService = new ShoppingListService()

// POST /api/shopping-lists/generate - Generate shopping list from meal plan or recipes
export const POST = Middleware.protected({
  validation: generateShoppingListSchema,
})(async (req: NextRequest, context) => {
  const body = await validateBody(generateShoppingListSchema)(req)
  const userId = context.user!.id

  try {
    let groupedItems

    if (body.type === 'mealPlan' && body.mealPlanId) {
      groupedItems = await shoppingListService.generateFromMealPlan(body.mealPlanId)
    } else if (body.type === 'recipes' && body.recipeIds) {
      groupedItems = await shoppingListService.generateFromRecipes(body.recipeIds)
    } else {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    let savedShoppingList = null

    if (body.save) {
      savedShoppingList = await shoppingListService.saveShoppingList(
        userId,
        body.name,
        groupedItems
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        shoppingList: groupedItems,
        ...(savedShoppingList && { 
          saved: { 
            id: savedShoppingList.id, 
            name: savedShoppingList.name 
          } 
        })
      }
    })
  } catch (error) {
    throw error
  }
})