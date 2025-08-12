// Shopping list generation and management service
import { Food, MealPlan, Recipe, ShoppingList, ShoppingListItem } from "@prisma/client"
import { prisma } from "./prisma"
import { logger } from "./logger"

// Shopping list interfaces
export interface ShoppingItem {
  name: string
  category: string
  quantity: number
  unit: string
  notes?: string
  isRecurring?: boolean
  estimatedCost?: number
}

export interface GroupedShoppingList {
  [category: string]: ShoppingItem[]
}

export interface ShoppingListSummary {
  totalItems: number
  totalCategories: number
  estimatedCost?: number
  completionRate: number
}

// Common food units and conversions
const UNIT_CONVERSIONS = {
  // Weight
  'kg': { grams: 1000, display: 'kg' },
  'g': { grams: 1, display: 'g' },
  'lb': { grams: 453.592, display: 'lb' },
  'oz': { grams: 28.3495, display: 'oz' },
  
  // Volume
  'l': { ml: 1000, display: 'L' },
  'ml': { ml: 1, display: 'ml' },
  'cup': { ml: 240, display: 'cup' },
  'tbsp': { ml: 15, display: 'tbsp' },
  'tsp': { ml: 5, display: 'tsp' },
  
  // Count
  'pcs': { pieces: 1, display: 'pcs' },
  'dozen': { pieces: 12, display: 'dozen' },
}

// Food category to shopping category mapping
const SHOPPING_CATEGORIES = {
  'vegetables': 'Fresh Produce',
  'fruits': 'Fresh Produce',
  'leafy greens': 'Fresh Produce',
  'herbs': 'Fresh Produce',
  'fish': 'Meat & Seafood',
  'seafood': 'Meat & Seafood',
  'poultry': 'Meat & Seafood',
  'chicken': 'Meat & Seafood',
  'meat': 'Meat & Seafood',
  'dairy': 'Dairy & Eggs',
  'milk': 'Dairy & Eggs',
  'cheese': 'Dairy & Eggs',
  'yogurt': 'Dairy & Eggs',
  'eggs': 'Dairy & Eggs',
  'grains': 'Pantry & Dry Goods',
  'pasta': 'Pantry & Dry Goods',
  'rice': 'Pantry & Dry Goods',
  'bread': 'Bakery',
  'cereals': 'Pantry & Dry Goods',
  'legumes': 'Pantry & Dry Goods',
  'beans': 'Pantry & Dry Goods',
  'nuts': 'Pantry & Dry Goods',
  'seeds': 'Pantry & Dry Goods',
  'oils': 'Pantry & Dry Goods',
  'spices': 'Pantry & Dry Goods',
  'condiments': 'Pantry & Dry Goods',
  'beverages': 'Beverages',
  'frozen': 'Frozen Foods',
  'canned': 'Pantry & Dry Goods',
}

export class ShoppingListService {
  // Get appropriate shopping category for a food
  private getShoppingCategory(food: Food): string {
    const category = food.category.toLowerCase()
    
    for (const [keyword, shoppingCategory] of Object.entries(SHOPPING_CATEGORIES)) {
      if (category.includes(keyword)) {
        return shoppingCategory
      }
    }
    
    return 'Other'
  }

  // Calculate appropriate unit for shopping
  private calculateShoppingUnit(food: Food, totalGrams: number): { quantity: number; unit: string } {
    const category = food.category.toLowerCase()
    
    // For liquids, convert to liters if > 1000ml
    if (category.includes('milk') || category.includes('oil') || category.includes('juice')) {
      if (totalGrams > 1000) {
        return { quantity: Math.round(totalGrams / 1000 * 10) / 10, unit: 'L' }
      }
      return { quantity: Math.round(totalGrams), unit: 'ml' }
    }
    
    // For small items (spices, herbs), keep in grams
    if (category.includes('spice') || category.includes('herb') || totalGrams < 50) {
      return { quantity: Math.round(totalGrams), unit: 'g' }
    }
    
    // For larger quantities, convert to kg
    if (totalGrams >= 1000) {
      return { quantity: Math.round(totalGrams / 1000 * 100) / 100, unit: 'kg' }
    }
    
    return { quantity: Math.round(totalGrams), unit: 'g' }
  }

  // Consolidate similar items
  private consolidateItems(items: ShoppingItem[]): ShoppingItem[] {
    const consolidated = new Map<string, ShoppingItem>()
    
    items.forEach(item => {
      const key = `${item.name.toLowerCase()}-${item.category}`
      
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!
        // Add quantities if same unit, otherwise keep separate
        if (existing.unit === item.unit) {
          existing.quantity += item.quantity
          existing.quantity = Math.round(existing.quantity * 100) / 100
          if (item.notes && !existing.notes?.includes(item.notes)) {
            existing.notes = existing.notes ? `${existing.notes}, ${item.notes}` : item.notes
          }
        } else {
          // Different units, create unique key
          const uniqueKey = `${key}-${item.unit}`
          consolidated.set(uniqueKey, item)
        }
      } else {
        consolidated.set(key, { ...item })
      }
    })
    
    return Array.from(consolidated.values())
  }

  // Generate shopping list from meal plan
  async generateFromMealPlan(mealPlanId: string): Promise<GroupedShoppingList> {
    try {
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
        include: {
          meals: {
            include: {
              mealItems: {
                include: {
                  food: true
                }
              }
            }
          }
        }
      })

      if (!mealPlan) {
        throw new Error('Meal plan not found')
      }

      const shoppingItems: ShoppingItem[] = []

      // Process all meal items
      for (const meal of mealPlan.meals) {
        for (const mealItem of meal.mealItems) {
          const food = mealItem.food
          const category = this.getShoppingCategory(food)
          const { quantity, unit } = this.calculateShoppingUnit(food, mealItem.quantity)
          
          shoppingItems.push({
            name: food.name,
            category,
            quantity,
            unit,
            notes: `For ${meal.type.toLowerCase()} on ${meal.date.toDateString()}`,
          })
        }
      }

      // Consolidate similar items
      const consolidated = this.consolidateItems(shoppingItems)

      // Group by category
      const grouped = consolidated.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push(item)
        return acc
      }, {} as GroupedShoppingList)

      // Sort items within each category
      Object.keys(grouped).forEach(category => {
        grouped[category].sort((a, b) => a.name.localeCompare(b.name))
      })

      return grouped
    } catch (error) {
      logger.error('Error generating shopping list from meal plan', error, { mealPlanId })
      throw error
    }
  }

  // Generate shopping list from recipes
  async generateFromRecipes(recipeIds: string[]): Promise<GroupedShoppingList> {
    try {
      const recipes = await prisma.recipe.findMany({
        where: {
          id: { in: recipeIds }
        },
        include: {
          ingredients: {
            include: {
              food: true
            }
          }
        }
      })

      const shoppingItems: ShoppingItem[] = []

      for (const recipe of recipes) {
        for (const ingredient of recipe.ingredients) {
          const food = ingredient.food
          const category = this.getShoppingCategory(food)
          const { quantity, unit } = this.calculateShoppingUnit(food, ingredient.quantity)
          
          shoppingItems.push({
            name: food.name,
            category,
            quantity,
            unit,
            notes: `For ${recipe.name}${ingredient.notes ? ` - ${ingredient.notes}` : ''}`,
          })
        }
      }

      const consolidated = this.consolidateItems(shoppingItems)

      const grouped = consolidated.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push(item)
        return acc
      }, {} as GroupedShoppingList)

      Object.keys(grouped).forEach(category => {
        grouped[category].sort((a, b) => a.name.localeCompare(b.name))
      })

      return grouped
    } catch (error) {
      logger.error('Error generating shopping list from recipes', error, { recipeIds })
      throw error
    }
  }

  // Save shopping list to database
  async saveShoppingList(
    userId: string,
    name: string,
    groupedItems: GroupedShoppingList
  ): Promise<ShoppingList> {
    try {
      // Create shopping list
      const shoppingList = await prisma.shoppingList.create({
        data: {
          userId,
          name,
          date: new Date(),
        }
      })

      // Create shopping list items
      const items: any[] = []
      Object.entries(groupedItems).forEach(([category, categoryItems]) => {
        categoryItems.forEach(item => {
          items.push({
            shoppingListId: shoppingList.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes,
          })
        })
      })

      await prisma.shoppingListItem.createMany({
        data: items
      })

      logger.info('Shopping list saved', { userId, shoppingListId: shoppingList.id, itemCount: items.length })

      return shoppingList
    } catch (error) {
      logger.error('Error saving shopping list', error, { userId, name })
      throw error
    }
  }

  // Get user's shopping lists
  async getUserShoppingLists(userId: string, limit: number = 20): Promise<ShoppingList[]> {
    try {
      return await prisma.shoppingList.findMany({
        where: { userId },
        include: {
          items: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    } catch (error) {
      logger.error('Error getting user shopping lists', error, { userId })
      throw error
    }
  }

  // Get shopping list summary
  async getShoppingListSummary(shoppingListId: string): Promise<ShoppingListSummary> {
    try {
      const items = await prisma.shoppingListItem.findMany({
        where: { shoppingListId }
      })

      const totalItems = items.length
      const completedItems = items.filter(item => item.isCompleted).length
      const categories = new Set(items.map(item => item.category)).size

      return {
        totalItems,
        totalCategories: categories,
        completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      }
    } catch (error) {
      logger.error('Error getting shopping list summary', error, { shoppingListId })
      throw error
    }
  }

  // Update shopping list item status
  async updateItemStatus(itemId: string, isCompleted: boolean): Promise<void> {
    try {
      await prisma.shoppingListItem.update({
        where: { id: itemId },
        data: { isCompleted }
      })

      logger.debug('Shopping list item status updated', { itemId, isCompleted })
    } catch (error) {
      logger.error('Error updating shopping list item status', error, { itemId })
      throw error
    }
  }

  // Add custom item to shopping list
  async addCustomItem(
    shoppingListId: string,
    name: string,
    category: string,
    quantity?: number,
    unit?: string,
    notes?: string
  ): Promise<ShoppingListItem> {
    try {
      const item = await prisma.shoppingListItem.create({
        data: {
          shoppingListId,
          name,
          category,
          quantity,
          unit,
          notes,
        }
      })

      logger.info('Custom item added to shopping list', { shoppingListId, itemName: name })

      return item
    } catch (error) {
      logger.error('Error adding custom item to shopping list', error, { shoppingListId, name })
      throw error
    }
  }

  // Generate recurring shopping list based on user's meal patterns
  async generateRecurringList(userId: string, days: number = 7): Promise<GroupedShoppingList> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get user's recent meals to identify patterns
      const recentMeals = await prisma.userMeal.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          food: true
        }
      })

      // Count frequency of each food
      const foodFrequency = new Map<string, { food: Food; count: number }>()
      
      recentMeals.forEach(meal => {
        const key = meal.food.id
        if (foodFrequency.has(key)) {
          foodFrequency.get(key)!.count++
        } else {
          foodFrequency.set(key, { food: meal.food, count: 1 })
        }
      })

      // Generate shopping items for frequently used foods
      const shoppingItems: ShoppingItem[] = []
      
      foodFrequency.forEach(({ food, count }) => {
        // Include foods used more than 20% of days
        if (count >= days * 0.2) {
          const avgDailyQuantity = recentMeals
            .filter(meal => meal.foodId === food.id)
            .reduce((sum, meal) => sum + meal.quantity, 0) / count

          const weeklyQuantity = avgDailyQuantity * 7
          const category = this.getShoppingCategory(food)
          const { quantity, unit } = this.calculateShoppingUnit(food, weeklyQuantity)
          
          shoppingItems.push({
            name: food.name,
            category,
            quantity,
            unit,
            notes: `Recurring item (used ${count}/${days} days)`,
            isRecurring: true
          })
        }
      })

      const consolidated = this.consolidateItems(shoppingItems)

      const grouped = consolidated.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push(item)
        return acc
      }, {} as GroupedShoppingList)

      Object.keys(grouped).forEach(category => {
        grouped[category].sort((a, b) => a.name.localeCompare(b.name))
      })

      return grouped
    } catch (error) {
      logger.error('Error generating recurring shopping list', error, { userId, days })
      throw error
    }
  }

  // Smart shopping suggestions based on Mediterranean diet
  async getMediterraneanSuggestions(): Promise<GroupedShoppingList> {
    try {
      const suggestions: ShoppingItem[] = [
        // Fresh Produce
        { name: 'Extra Virgin Olive Oil', category: 'Pantry & Dry Goods', quantity: 1, unit: 'bottle', notes: 'Mediterranean staple' },
        { name: 'Tomatoes', category: 'Fresh Produce', quantity: 1, unit: 'kg', notes: 'Rich in lycopene' },
        { name: 'Spinach', category: 'Fresh Produce', quantity: 500, unit: 'g', notes: 'Iron and vitamins' },
        { name: 'Greek Yogurt', category: 'Dairy & Eggs', quantity: 1, unit: 'kg', notes: 'Probiotics and protein' },
        { name: 'Salmon Fillet', category: 'Meat & Seafood', quantity: 500, unit: 'g', notes: 'Omega-3 fatty acids' },
        { name: 'Whole Grain Bread', category: 'Bakery', quantity: 1, unit: 'loaf', notes: 'Complex carbohydrates' },
        { name: 'Mixed Nuts', category: 'Pantry & Dry Goods', quantity: 200, unit: 'g', notes: 'Healthy fats and protein' },
        { name: 'Chickpeas', category: 'Pantry & Dry Goods', quantity: 400, unit: 'g', notes: 'Plant protein and fiber' },
        { name: 'Lemons', category: 'Fresh Produce', quantity: 6, unit: 'pcs', notes: 'Vitamin C and flavor' },
        { name: 'Fresh Herbs (Basil, Oregano)', category: 'Fresh Produce', quantity: 1, unit: 'bunch', notes: 'Antioxidants' },
      ]

      const grouped = suggestions.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push(item)
        return acc
      }, {} as GroupedShoppingList)

      return grouped
    } catch (error) {
      logger.error('Error getting Mediterranean suggestions', error)
      throw error
    }
  }
}