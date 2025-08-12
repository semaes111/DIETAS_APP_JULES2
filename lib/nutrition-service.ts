// Comprehensive nutrition calculation service
import { Food, UserProfile, Gender, ActivityLevel, Goal, MealType } from "@prisma/client"
import { prisma } from "./prisma"
import { logger } from "./logger"

// Nutrition data interfaces
export interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface MacroDistribution {
  proteinPercentage: number
  carbsPercentage: number
  fatPercentage: number
}

export interface DailyNutritionTarget {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
}

export interface MealDistribution {
  [MealType.BREAKFAST]: number
  [MealType.LUNCH]: number
  [MealType.DINNER]: number
  [MealType.SNACK]: number
}

// BMR Calculation using Mifflin-St Jeor Equation
export function calculateBMR(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: Gender
): number {
  let bmr: number

  if (gender === Gender.MALE) {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
  }

  return Math.round(bmr)
}

// TDEE Calculation (Total Daily Energy Expenditure)
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const activityMultipliers = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
    [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
  }

  return Math.round(bmr * activityMultipliers[activityLevel])
}

// Calculate target calories based on goal
export function calculateTargetCalories(tdee: number, goal: Goal): number {
  switch (goal) {
    case Goal.LOSE:
      return Math.round(tdee * 0.8) // 20% deficit
    case Goal.MAINTAIN:
      return tdee
    case Goal.GAIN:
      return Math.round(tdee * 1.1) // 10% surplus
    default:
      return tdee
  }
}

// Mediterranean diet macro distribution
export function getMediterraneanMacroDistribution(): MacroDistribution {
  return {
    proteinPercentage: 20,
    carbsPercentage: 45,
    fatPercentage: 35,
  }
}

// Calculate macro targets
export function calculateMacroTargets(
  targetCalories: number,
  distribution?: MacroDistribution
): { protein: number; carbs: number; fat: number } {
  const macros = distribution || getMediterraneanMacroDistribution()
  
  const proteinCalories = targetCalories * (macros.proteinPercentage / 100)
  const carbsCalories = targetCalories * (macros.carbsPercentage / 100)
  const fatCalories = targetCalories * (macros.fatPercentage / 100)

  return {
    protein: Math.round(proteinCalories / 4), // 4 calories per gram
    carbs: Math.round(carbsCalories / 4), // 4 calories per gram
    fat: Math.round(fatCalories / 9), // 9 calories per gram
  }
}

// Calculate complete nutrition targets
export function calculateNutritionTargets(profile: UserProfile): DailyNutritionTarget {
  const bmr = calculateBMR(
    profile.weight!,
    profile.height!,
    profile.age!,
    profile.gender!
  )

  const tdee = calculateTDEE(bmr, profile.activityLevel)
  const targetCalories = calculateTargetCalories(tdee, profile.goal)
  const macros = calculateMacroTargets(targetCalories)

  // Fiber recommendation: 14g per 1000 calories
  const fiber = Math.round((targetCalories / 1000) * 14)
  
  // Sodium recommendation: max 2300mg per day
  const sodium = 2300

  return {
    calories: targetCalories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    fiber,
    sodium,
  }
}

// Calculate nutrition for a quantity of food
export function calculateFoodNutrition(food: Food, quantityInGrams: number): NutritionData {
  const factor = quantityInGrams / 100 // Convert to per 100g basis

  return {
    calories: Math.round(food.caloriesPer100g * factor),
    protein: Math.round(food.proteinPer100g * factor * 10) / 10, // Round to 1 decimal
    carbs: Math.round(food.carbsPer100g * factor * 10) / 10,
    fat: Math.round(food.fatPer100g * factor * 10) / 10,
    fiber: food.fiberPer100g ? Math.round(food.fiberPer100g * factor * 10) / 10 : undefined,
    sugar: food.sugarPer100g ? Math.round(food.sugarPer100g * factor * 10) / 10 : undefined,
    sodium: food.sodiumPer100g ? Math.round(food.sodiumPer100g * factor) : undefined,
  }
}

// Sum multiple nutrition data objects
export function sumNutritionData(nutritionArray: NutritionData[]): NutritionData {
  return nutritionArray.reduce(
    (total, nutrition) => ({
      calories: total.calories + nutrition.calories,
      protein: Math.round((total.protein + nutrition.protein) * 10) / 10,
      carbs: Math.round((total.carbs + nutrition.carbs) * 10) / 10,
      fat: Math.round((total.fat + nutrition.fat) * 10) / 10,
      fiber: total.fiber && nutrition.fiber 
        ? Math.round((total.fiber + nutrition.fiber) * 10) / 10 
        : total.fiber || nutrition.fiber,
      sugar: total.sugar && nutrition.sugar 
        ? Math.round((total.sugar + nutrition.sugar) * 10) / 10 
        : total.sugar || nutrition.sugar,
      sodium: total.sodium && nutrition.sodium 
        ? total.sodium + nutrition.sodium 
        : total.sodium || nutrition.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

// Get meal distribution percentages (Mediterranean diet style)
export function getMealDistribution(): MealDistribution {
  return {
    [MealType.BREAKFAST]: 0.25, // 25%
    [MealType.LUNCH]: 0.35, // 35%
    [MealType.DINNER]: 0.30, // 30%
    [MealType.SNACK]: 0.10, // 10%
  }
}

// Calculate meal-specific targets
export function calculateMealTargets(
  dailyTargets: DailyNutritionTarget,
  mealType: MealType
): NutritionData {
  const distribution = getMealDistribution()
  const factor = distribution[mealType]

  return {
    calories: Math.round(dailyTargets.calories * factor),
    protein: Math.round(dailyTargets.protein * factor * 10) / 10,
    carbs: Math.round(dailyTargets.carbs * factor * 10) / 10,
    fat: Math.round(dailyTargets.fat * factor * 10) / 10,
    fiber: Math.round(dailyTargets.fiber * factor * 10) / 10,
    sodium: Math.round(dailyTargets.sodium * factor),
  }
}

// Calculate nutrition adherence score (0-100)
export function calculateAdherenceScore(
  consumed: NutritionData,
  targets: NutritionData
): number {
  const scores: number[] = []

  // Calorie score (penalty for going over or under by more than 10%)
  const calorieRatio = consumed.calories / targets.calories
  const calorieScore = calorieRatio >= 0.9 && calorieRatio <= 1.1 ? 100 : 
                      Math.max(0, 100 - Math.abs((calorieRatio - 1) * 100))
  scores.push(calorieScore)

  // Protein score (minimum target, bonus for exceeding)
  const proteinRatio = consumed.protein / targets.protein
  const proteinScore = proteinRatio >= 1 ? 100 : proteinRatio * 100
  scores.push(proteinScore)

  // Carb score (close to target is best)
  const carbRatio = consumed.carbs / targets.carbs
  const carbScore = carbRatio >= 0.8 && carbRatio <= 1.2 ? 100 :
                    Math.max(0, 100 - Math.abs((carbRatio - 1) * 50))
  scores.push(carbScore)

  // Fat score (close to target is best)
  const fatRatio = consumed.fat / targets.fat
  const fatScore = fatRatio >= 0.8 && fatRatio <= 1.2 ? 100 :
                   Math.max(0, 100 - Math.abs((fatRatio - 1) * 50))
  scores.push(fatScore)

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

// Mediterranean diet score calculation
export function calculateMediterraneanScore(nutritionData: NutritionData[]): number {
  // This would implement the Mediterranean Diet Adherence Screener (MEDAS)
  // For now, return a simplified score based on macronutrient distribution
  const totalNutrition = sumNutritionData(nutritionData)
  const totalCalories = totalNutrition.calories
  
  if (totalCalories === 0) return 0

  const proteinPercent = (totalNutrition.protein * 4 / totalCalories) * 100
  const carbPercent = (totalNutrition.carbs * 4 / totalCalories) * 100
  const fatPercent = (totalNutrition.fat * 9 / totalCalories) * 100

  const idealMacros = getMediterraneanMacroDistribution()
  
  const proteinScore = Math.max(0, 100 - Math.abs(proteinPercent - idealMacros.proteinPercentage) * 2)
  const carbScore = Math.max(0, 100 - Math.abs(carbPercent - idealMacros.carbsPercentage) * 1.5)
  const fatScore = Math.max(0, 100 - Math.abs(fatPercent - idealMacros.fatPercentage) * 1.5)

  return Math.round((proteinScore + carbScore + fatScore) / 3)
}

// Service functions for database operations
export class NutritionService {
  // Get user's daily nutrition summary
  async getDailyNutritionSummary(userId: string, date: Date) {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const userMeals = await prisma.userMeal.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          food: true,
        },
      })

      const nutritionByMeal = userMeals.reduce((acc, meal) => {
        if (!acc[meal.mealType]) {
          acc[meal.mealType] = []
        }
        
        acc[meal.mealType].push({
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
        })
        
        return acc
      }, {} as Record<MealType, NutritionData[]>)

      const mealSummaries = Object.entries(nutritionByMeal).reduce((acc, [mealType, nutritionArray]) => {
        acc[mealType as MealType] = sumNutritionData(nutritionArray)
        return acc
      }, {} as Record<MealType, NutritionData>)

      const totalNutrition = sumNutritionData(Object.values(mealSummaries))

      return {
        date: date.toISOString().split('T')[0],
        totalNutrition,
        mealSummaries,
        mealCount: userMeals.length,
      }
    } catch (error) {
      logger.error('Error getting daily nutrition summary', error, { userId, date })
      throw error
    }
  }

  // Get weekly nutrition trend
  async getWeeklyNutritionTrend(userId: string, startDate: Date, endDate: Date) {
    try {
      const userMeals = await prisma.userMeal.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      const dailySummaries = new Map<string, NutritionData[]>()

      userMeals.forEach(meal => {
        const dateKey = meal.date.toISOString().split('T')[0]
        if (!dailySummaries.has(dateKey)) {
          dailySummaries.set(dateKey, [])
        }
        
        dailySummaries.get(dateKey)!.push({
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
        })
      })

      const weeklyData = Array.from(dailySummaries.entries()).map(([date, nutritionArray]) => ({
        date,
        nutrition: sumNutritionData(nutritionArray),
      }))

      return weeklyData.sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      logger.error('Error getting weekly nutrition trend', error, { userId, startDate, endDate })
      throw error
    }
  }

  // Update user profile nutrition targets
  async updateUserNutritionTargets(userId: string) {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
      })

      if (!profile || !profile.age || !profile.weight || !profile.height || !profile.gender) {
        throw new Error('Incomplete user profile for nutrition calculation')
      }

      const targets = calculateNutritionTargets(profile)
      const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender)
      const tdee = calculateTDEE(bmr, profile.activityLevel)

      await prisma.userProfile.update({
        where: { userId },
        data: {
          bmr,
          tdee,
          targetCalories: targets.calories,
          targetProtein: targets.protein,
          targetCarbs: targets.carbs,
          targetFat: targets.fat,
        },
      })

      logger.info('User nutrition targets updated', { userId, targets })
      return targets
    } catch (error) {
      logger.error('Error updating user nutrition targets', error, { userId })
      throw error
    }
  }
}