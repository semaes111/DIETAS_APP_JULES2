// Comprehensive data import/export service
import { prisma } from "./prisma"
import { logger } from "./logger"
import { validateRequest } from "./errors"
import { foodSchema, recipeSchema } from "./validations"
import { Food, Recipe, User } from "@prisma/client"
import Papa from "papaparse"

// Import/Export interfaces
export interface ImportResult {
  success: boolean
  totalProcessed: number
  successCount: number
  errorCount: number
  errors: ImportError[]
  skippedCount: number
  duplicateCount: number
}

export interface ImportError {
  row: number
  field?: string
  value?: any
  message: string
  data?: any
}

export interface ExportOptions {
  format: 'csv' | 'json'
  includeHeaders?: boolean
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  filters?: Record<string, any>
}

export interface BatchOperationResult {
  success: boolean
  processedCount: number
  errors: string[]
}

// Food CSV import/export service
export class FoodImportExportService {
  // Required CSV headers for food import
  private static readonly REQUIRED_HEADERS = [
    'name',
    'category',
    'caloriesPer100g',
    'proteinPer100g',
    'carbsPer100g',
    'fatPer100g'
  ]

  private static readonly OPTIONAL_HEADERS = [
    'brand',
    'barcode',
    'description',
    'servingSize',
    'fiberPer100g',
    'sugarPer100g',
    'sodiumPer100g',
    'isVerified'
  ]

  // Import foods from CSV data
  static async importFromCSV(
    csvData: string,
    userId: string,
    options: {
      skipDuplicates?: boolean
      validateOnly?: boolean
      batchSize?: number
    } = {}
  ): Promise<ImportResult> {
    const {
      skipDuplicates = true,
      validateOnly = false,
      batchSize = 100
    } = options

    const result: ImportResult = {
      success: false,
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      skippedCount: 0,
      duplicateCount: 0
    }

    try {
      // Parse CSV
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      })

      if (parsed.errors.length > 0) {
        parsed.errors.forEach(error => {
          result.errors.push({
            row: error.row || 0,
            message: `CSV parsing error: ${error.message}`,
          })
        })
      }

      const data = parsed.data as any[]
      result.totalProcessed = data.length

      if (data.length === 0) {
        result.errors.push({
          row: 0,
          message: "No data found in CSV file"
        })
        return result
      }

      // Validate headers
      const headers = Object.keys(data[0])
      const missingHeaders = this.REQUIRED_HEADERS.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        result.errors.push({
          row: 0,
          message: `Missing required headers: ${missingHeaders.join(', ')}`
        })
        return result
      }

      // Process in batches
      const foods: any[] = []
      const existingBarcodes = new Set<string>()

      // Get existing barcodes for duplicate checking
      if (skipDuplicates) {
        const barcodes = data
          .map(row => row.barcode)
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i) // unique

        if (barcodes.length > 0) {
          const existing = await prisma.food.findMany({
            where: { barcode: { in: barcodes } },
            select: { barcode: true }
          })
          existing.forEach(f => f.barcode && existingBarcodes.add(f.barcode))
        }
      }

      // Validate and prepare data
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2 // Account for header row

        try {
          // Check for duplicates
          if (skipDuplicates && row.barcode && existingBarcodes.has(row.barcode)) {
            result.duplicateCount++
            result.skippedCount++
            continue
          }

          // Transform and validate data
          const foodData = {
            name: row.name?.trim(),
            brand: row.brand?.trim() || undefined,
            barcode: row.barcode?.trim() || undefined,
            description: row.description?.trim() || undefined,
            category: row.category?.trim(),
            servingSize: row.servingSize ? parseFloat(row.servingSize) : 100,
            caloriesPer100g: parseFloat(row.caloriesPer100g),
            proteinPer100g: parseFloat(row.proteinPer100g),
            carbsPer100g: parseFloat(row.carbsPer100g),
            fatPer100g: parseFloat(row.fatPer100g),
            fiberPer100g: row.fiberPer100g ? parseFloat(row.fiberPer100g) : undefined,
            sugarPer100g: row.sugarPer100g ? parseFloat(row.sugarPer100g) : undefined,
            sodiumPer100g: row.sodiumPer100g ? parseFloat(row.sodiumPer100g) : undefined,
            isVerified: row.isVerified ? row.isVerified.toLowerCase() === 'true' : false,
          }

          // Validate with Zod schema
          const validated = foodSchema.parse(foodData)
          foods.push(validated)

        } catch (error) {
          result.errorCount++
          result.errors.push({
            row: rowNumber,
            message: error instanceof Error ? error.message : String(error),
            data: row
          })
        }
      }

      // If validation only, return without saving
      if (validateOnly) {
        result.success = true
        result.successCount = foods.length
        return result
      }

      // Save foods in batches
      for (let i = 0; i < foods.length; i += batchSize) {
        const batch = foods.slice(i, i + batchSize)
        
        try {
          await prisma.food.createMany({
            data: batch,
            skipDuplicates: true
          })
          result.successCount += batch.length
        } catch (error) {
          logger.error('Batch import error', error, { 
            batch: i / batchSize + 1,
            size: batch.length 
          })
          result.errorCount += batch.length
          result.errors.push({
            row: i + 2,
            message: `Batch import failed: ${error instanceof Error ? error.message : String(error)}`
          })
        }
      }

      result.success = result.errorCount === 0
      
      logger.info('Food import completed', {
        userId,
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        errorCount: result.errorCount,
        duplicateCount: result.duplicateCount
      })

    } catch (error) {
      logger.error('Food import failed', error, { userId })
      result.errors.push({
        row: 0,
        message: `Import failed: ${error instanceof Error ? error.message : String(error)}`
      })
    }

    return result
  }

  // Export foods to CSV
  static async exportToCSV(options: ExportOptions & {
    includeUnverified?: boolean
    categories?: string[]
  } = {}): Promise<string> {
    const {
      includeUnverified = true,
      categories,
      dateRange,
    } = options

    try {
      const where: any = {
        ...(dateRange && {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate
          }
        }),
        ...(!includeUnverified && { isVerified: true }),
        ...(categories && categories.length > 0 && {
          category: { in: categories }
        })
      }

      const foods = await prisma.food.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      })

      // Convert to CSV format
      const csvData = foods.map(food => ({
        name: food.name,
        brand: food.brand || '',
        barcode: food.barcode || '',
        description: food.description || '',
        category: food.category,
        servingSize: food.servingSize,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
        fiberPer100g: food.fiberPer100g || '',
        sugarPer100g: food.sugarPer100g || '',
        sodiumPer100g: food.sodiumPer100g || '',
        isVerified: food.isVerified,
        createdAt: food.createdAt.toISOString(),
        updatedAt: food.updatedAt.toISOString()
      }))

      return Papa.unparse(csvData, {
        header: true
      })

    } catch (error) {
      logger.error('Food export failed', error)
      throw error
    }
  }

  // Bulk delete foods
  static async bulkDelete(foodIds: string[], userId: string): Promise<BatchOperationResult> {
    try {
      // Verify all foods exist and check permissions
      const foods = await prisma.food.findMany({
        where: { id: { in: foodIds } }
      })

      if (foods.length !== foodIds.length) {
        const foundIds = foods.map(f => f.id)
        const missingIds = foodIds.filter(id => !foundIds.includes(id))
        return {
          success: false,
          processedCount: 0,
          errors: [`Foods not found: ${missingIds.join(', ')}`]
        }
      }

      // Check for dependencies (meal items, recipe ingredients)
      const dependencies = await prisma.mealItem.findMany({
        where: { foodId: { in: foodIds } },
        include: { meal: true }
      })

      if (dependencies.length > 0) {
        return {
          success: false,
          processedCount: 0,
          errors: [`Cannot delete foods that are used in meals or recipes`]
        }
      }

      // Delete foods
      const result = await prisma.food.deleteMany({
        where: { id: { in: foodIds } }
      })

      logger.info('Bulk food deletion completed', { 
        userId, 
        deletedCount: result.count,
        foodIds 
      })

      return {
        success: true,
        processedCount: result.count,
        errors: []
      }

    } catch (error) {
      logger.error('Bulk food deletion failed', error, { userId, foodIds })
      return {
        success: false,
        processedCount: 0,
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }

  // Bulk verify foods (admin operation)
  static async bulkVerify(foodIds: string[], userId: string): Promise<BatchOperationResult> {
    try {
      const result = await prisma.food.updateMany({
        where: { 
          id: { in: foodIds },
          isVerified: false 
        },
        data: { isVerified: true }
      })

      logger.info('Bulk food verification completed', { 
        userId, 
        verifiedCount: result.count,
        foodIds 
      })

      return {
        success: true,
        processedCount: result.count,
        errors: []
      }

    } catch (error) {
      logger.error('Bulk food verification failed', error, { userId, foodIds })
      return {
        success: false,
        processedCount: 0,
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }
}

// Recipe import/export service
export class RecipeImportExportService {
  // Export user recipes to JSON
  static async exportUserRecipes(userId: string): Promise<string> {
    try {
      const recipes = await prisma.recipe.findMany({
        where: { userId },
        include: {
          ingredients: {
            include: {
              food: true
            }
          },
          nutrition: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const exportData = {
        exportDate: new Date().toISOString(),
        totalRecipes: recipes.length,
        recipes: recipes.map(recipe => ({
          name: recipe.name,
          description: recipe.description,
          instructions: recipe.instructions,
          servings: recipe.servings,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          difficulty: recipe.difficulty,
          category: recipe.category,
          ingredients: recipe.ingredients.map(ingredient => ({
            foodName: ingredient.food.name,
            foodCategory: ingredient.food.category,
            quantity: ingredient.quantity,
            notes: ingredient.notes,
            nutrition: {
              caloriesPer100g: ingredient.food.caloriesPer100g,
              proteinPer100g: ingredient.food.proteinPer100g,
              carbsPer100g: ingredient.food.carbsPer100g,
              fatPer100g: ingredient.food.fatPer100g,
            }
          })),
          nutrition: recipe.nutrition,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt
        }))
      }

      return JSON.stringify(exportData, null, 2)

    } catch (error) {
      logger.error('Recipe export failed', error, { userId })
      throw error
    }
  }
}

// User data export service (GDPR compliance)
export class UserDataExportService {
  static async exportUserData(userId: string): Promise<string> {
    try {
      // Get all user data
      const [user, profile, meals, recipes, mealPlans, progressLogs, shoppingLists] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.userProfile.findUnique({ where: { userId } }),
        prisma.userMeal.findMany({ 
          where: { userId },
          include: { food: true },
          orderBy: { date: 'desc' }
        }),
        prisma.recipe.findMany({ 
          where: { userId },
          include: { 
            ingredients: { include: { food: true } },
            nutrition: true 
          }
        }),
        prisma.mealPlan.findMany({ 
          where: { userId },
          include: { 
            meals: { 
              include: { 
                mealItems: { include: { food: true } } 
              } 
            } 
          }
        }),
        prisma.progressLog.findMany({ 
          where: { userId },
          orderBy: { date: 'desc' }
        }),
        prisma.shoppingList.findMany({ 
          where: { userId },
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        })
      ])

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt
        },
        profile,
        statistics: {
          totalMeals: meals.length,
          totalRecipes: recipes.length,
          totalMealPlans: mealPlans.length,
          totalProgressLogs: progressLogs.length,
          totalShoppingLists: shoppingLists.length
        },
        data: {
          meals,
          recipes,
          mealPlans,
          progressLogs,
          shoppingLists
        }
      }

      logger.info('User data export completed', { userId })

      return JSON.stringify(exportData, null, 2)

    } catch (error) {
      logger.error('User data export failed', error, { userId })
      throw error
    }
  }

  // Delete all user data (GDPR right to be forgotten)
  static async deleteUserData(userId: string): Promise<BatchOperationResult> {
    try {
      // Delete in correct order due to foreign key constraints
      await prisma.$transaction([
        prisma.shoppingListItem.deleteMany({ where: { shoppingList: { userId } } }),
        prisma.shoppingList.deleteMany({ where: { userId } }),
        prisma.mealItem.deleteMany({ where: { meal: { mealPlan: { userId } } } }),
        prisma.meal.deleteMany({ where: { mealPlan: { userId } } }),
        prisma.mealPlan.deleteMany({ where: { userId } }),
        prisma.userMeal.deleteMany({ where: { userId } }),
        prisma.recipeNutrition.deleteMany({ where: { recipe: { userId } } }),
        prisma.recipeIngredient.deleteMany({ where: { recipe: { userId } } }),
        prisma.recipe.deleteMany({ where: { userId } }),
        prisma.progressLog.deleteMany({ where: { userId } }),
        prisma.userProfile.deleteMany({ where: { userId } }),
        prisma.session.deleteMany({ where: { userId } }),
        prisma.account.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } })
      ])

      logger.info('User data deletion completed', { userId })

      return {
        success: true,
        processedCount: 1,
        errors: []
      }

    } catch (error) {
      logger.error('User data deletion failed', error, { userId })
      return {
        success: false,
        processedCount: 0,
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }
}