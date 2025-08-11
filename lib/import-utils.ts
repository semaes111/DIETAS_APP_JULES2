import { prisma } from '@/lib/prisma'
import { Food, Recipe, MealPlan } from '@prisma/client'
import Papa from 'papaparse'

export interface ImportResult {
  success: boolean
  message: string
  processed: number
  errors: string[]
  data?: any[]
}

export interface FoodImportData {
  name: string
  brand?: string
  barcode?: string
  description?: string
  category: string
  servingSize: number
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
  sugarPer100g?: number
  sodiumPer100g?: number
}

export interface RecipeImportData {
  name: string
  description?: string
  instructions: string
  servings: number
  prepTime?: number
  cookTime?: number
  difficulty?: string
  category?: string
  image?: string
  ingredients: Array<{
    foodName: string
    quantity: number
    notes?: string
  }>
}

export interface MealPlanImportData {
  name: string
  startDate: string
  endDate: string
  meals: Array<{
    date: string
    type: string
    name?: string
    foods: Array<{
      foodName: string
      quantity: number
    }>
  }>
}

export class DataImporter {
  static async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalize header names
          return header
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w_]/g, '')
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`))
          } else {
            resolve(results.data as any[])
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`))
        }
      })
    })
  }

  static validateFoodData(data: any): FoodImportData | null {
    try {
      const requiredFields = ['name', 'category', 'calories_per_100g', 'protein_per_100g', 'carbs_per_100g', 'fat_per_100g']
      
      for (const field of requiredFields) {
        if (!data[field] && data[field] !== 0) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      return {
        name: String(data.name).trim(),
        brand: data.brand ? String(data.brand).trim() : undefined,
        barcode: data.barcode ? String(data.barcode).trim() : undefined,
        description: data.description ? String(data.description).trim() : undefined,
        category: String(data.category).trim(),
        servingSize: Number(data.serving_size) || 100,
        caloriesPer100g: Number(data.calories_per_100g),
        proteinPer100g: Number(data.protein_per_100g),
        carbsPer100g: Number(data.carbs_per_100g),
        fatPer100g: Number(data.fat_per_100g),
        fiberPer100g: data.fiber_per_100g ? Number(data.fiber_per_100g) : undefined,
        sugarPer100g: data.sugar_per_100g ? Number(data.sugar_per_100g) : undefined,
        sodiumPer100g: data.sodium_per_100g ? Number(data.sodium_per_100g) : undefined,
      }
    } catch (error) {
      return null
    }
  }

  static async importFoods(data: any[]): Promise<ImportResult> {
    const errors: string[] = []
    const validFoods: FoodImportData[] = []

    // Validate all records first
    data.forEach((row, index) => {
      const validFood = this.validateFoodData(row)
      if (validFood) {
        validFoods.push(validFood)
      } else {
        errors.push(`Row ${index + 1}: Invalid food data`)
      }
    })

    let processed = 0
    try {
      // Use transaction for bulk insert
      await prisma.$transaction(async (tx) => {
        for (const foodData of validFoods) {
          try {
            await tx.food.create({
              data: {
                name: foodData.name,
                brand: foodData.brand,
                barcode: foodData.barcode,
                description: foodData.description,
                category: foodData.category,
                servingSize: foodData.servingSize,
                caloriesPer100g: foodData.caloriesPer100g,
                proteinPer100g: foodData.proteinPer100g,
                carbsPer100g: foodData.carbsPer100g,
                fatPer100g: foodData.fatPer100g,
                fiberPer100g: foodData.fiberPer100g,
                sugarPer100g: foodData.sugarPer100g,
                sodiumPer100g: foodData.sodiumPer100g,
                isVerified: true // Mark imported foods as verified
              }
            })
            processed++
          } catch (error) {
            errors.push(`Failed to import food "${foodData.name}": ${error}`)
          }
        }
      })

      return {
        success: processed > 0,
        message: `Successfully imported ${processed} foods${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        processed,
        errors
      }
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error}`,
        processed: 0,
        errors: [...errors, String(error)]
      }
    }
  }

  static validateRecipeData(data: any): RecipeImportData | null {
    try {
      if (!data.name || !data.instructions || !data.servings) {
        return null
      }

      return {
        name: String(data.name).trim(),
        description: data.description ? String(data.description).trim() : undefined,
        instructions: String(data.instructions).trim(),
        servings: Number(data.servings),
        prepTime: data.prep_time ? Number(data.prep_time) : undefined,
        cookTime: data.cook_time ? Number(data.cook_time) : undefined,
        difficulty: data.difficulty ? String(data.difficulty).trim() : undefined,
        category: data.category ? String(data.category).trim() : undefined,
        image: data.image ? String(data.image).trim() : undefined,
        ingredients: data.ingredients || []
      }
    } catch (error) {
      return null
    }
  }

  static async importRecipes(data: any[], userId: string): Promise<ImportResult> {
    const errors: string[] = []
    const validRecipes: RecipeImportData[] = []

    data.forEach((row, index) => {
      const validRecipe = this.validateRecipeData(row)
      if (validRecipe) {
        validRecipes.push(validRecipe)
      } else {
        errors.push(`Row ${index + 1}: Invalid recipe data`)
      }
    })

    let processed = 0
    try {
      for (const recipeData of validRecipes) {
        try {
          // Create recipe
          const recipe = await prisma.recipe.create({
            data: {
              userId,
              name: recipeData.name,
              description: recipeData.description,
              instructions: recipeData.instructions,
              servings: recipeData.servings,
              prepTime: recipeData.prepTime,
              cookTime: recipeData.cookTime,
              difficulty: recipeData.difficulty,
              category: recipeData.category,
              image: recipeData.image,
              isPublic: true // Make imported recipes public
            }
          })

          // Add ingredients if provided
          if (recipeData.ingredients && recipeData.ingredients.length > 0) {
            for (const ingredient of recipeData.ingredients) {
              // Find matching food
              const food = await prisma.food.findFirst({
                where: {
                  name: {
                    contains: ingredient.foodName,
                    mode: 'insensitive'
                  }
                }
              })

              if (food) {
                await prisma.recipeIngredient.create({
                  data: {
                    recipeId: recipe.id,
                    foodId: food.id,
                    quantity: ingredient.quantity,
                    notes: ingredient.notes
                  }
                })
              }
            }
          }

          processed++
        } catch (error) {
          errors.push(`Failed to import recipe "${recipeData.name}": ${error}`)
        }
      }

      return {
        success: processed > 0,
        message: `Successfully imported ${processed} recipes${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        processed,
        errors
      }
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error}`,
        processed: 0,
        errors: [...errors, String(error)]
      }
    }
  }

  static async clearAllData(): Promise<ImportResult> {
    try {
      // Delete in correct order to avoid foreign key constraints
      await prisma.$transaction([
        prisma.mealItem.deleteMany(),
        prisma.meal.deleteMany(),
        prisma.mealPlan.deleteMany(),
        prisma.userMeal.deleteMany(),
        prisma.recipeNutrition.deleteMany(),
        prisma.recipeIngredient.deleteMany(),
        prisma.recipe.deleteMany(),
        prisma.progressLog.deleteMany(),
        prisma.shoppingListItem.deleteMany(),
        prisma.shoppingList.deleteMany(),
        prisma.food.deleteMany(),
      ])

      return {
        success: true,
        message: 'All data cleared successfully',
        processed: 0,
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to clear data: ${error}`,
        processed: 0,
        errors: [String(error)]
      }
    }
  }

  static async getImportStats() {
    try {
      const stats = await Promise.all([
        prisma.food.count(),
        prisma.recipe.count(),
        prisma.mealPlan.count(),
        prisma.user.count()
      ])

      return {
        foods: stats[0],
        recipes: stats[1],
        mealPlans: stats[2],
        users: stats[3]
      }
    } catch (error) {
      return {
        foods: 0,
        recipes: 0,
        mealPlans: 0,
        users: 0
      }
    }
  }
}

export default DataImporter