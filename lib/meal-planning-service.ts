// Comprehensive meal planning and recommendation service
import { Food, MealType, UserProfile, Recipe } from "@prisma/client"
import { prisma } from "./prisma"
import { logger } from "./logger"
import { 
  NutritionData, 
  calculateFoodNutrition, 
  sumNutritionData, 
  calculateMealTargets,
  DailyNutritionTarget,
  getMealDistribution
} from "./nutrition-service"

// Meal planning interfaces
export interface MealPlanItem {
  foodId: string
  quantity: number
  nutrition: NutritionData
}

export interface MealPlanMeal {
  type: MealType
  name?: string
  items: MealPlanItem[]
  totalNutrition: NutritionData
}

export interface DayMealPlan {
  date: string
  meals: MealPlanMeal[]
  totalNutrition: NutritionData
  adherenceScore: number
}

export interface WeeklyMealPlan {
  startDate: string
  endDate: string
  days: DayMealPlan[]
  averageNutrition: NutritionData
  averageAdherenceScore: number
}

// Mediterranean food categories for recommendations
export const MEDITERRANEAN_FOOD_CATEGORIES = {
  VEGETABLES: ['vegetables', 'leafy greens', 'tomatoes', 'peppers', 'onions', 'garlic'],
  FRUITS: ['fruits', 'berries', 'citrus', 'stone fruits', 'melons'],
  WHOLE_GRAINS: ['whole grains', 'oats', 'quinoa', 'brown rice', 'whole wheat'],
  LEGUMES: ['legumes', 'beans', 'lentils', 'chickpeas', 'peas'],
  NUTS_SEEDS: ['nuts', 'seeds', 'almonds', 'walnuts', 'pistachios', 'olive oil'],
  FISH_SEAFOOD: ['fish', 'seafood', 'salmon', 'sardines', 'tuna', 'shellfish'],
  POULTRY: ['poultry', 'chicken', 'turkey'],
  DAIRY: ['dairy', 'yogurt', 'cheese', 'milk'],
  HERBS_SPICES: ['herbs', 'spices', 'basil', 'oregano', 'thyme', 'rosemary'],
}

// Food recommendation scoring
export interface FoodScore {
  food: Food
  score: number
  reasons: string[]
}

export class MealPlanningService {
  // Get Mediterranean diet compliant foods
  async getMediterraneanFoods(limit: number = 100): Promise<Food[]> {
    try {
      const mediterraneanCategories = Object.values(MEDITERRANEAN_FOOD_CATEGORIES).flat()
      
      const foods = await prisma.food.findMany({
        where: {
          OR: mediterraneanCategories.map(category => ({
            category: {
              contains: category,
              mode: 'insensitive'
            }
          }))
        },
        orderBy: [
          { isVerified: 'desc' },
          { name: 'asc' }
        ],
        take: limit
      })

      return foods
    } catch (error) {
      logger.error('Error getting Mediterranean foods', error)
      throw error
    }
  }

  // Score foods based on Mediterranean diet principles and nutrition targets
  scoreFoodsForMeal(
    foods: Food[], 
    mealType: MealType, 
    targetNutrition: NutritionData,
    userProfile?: UserProfile
  ): FoodScore[] {
    return foods.map(food => {
      let score = 0
      const reasons: string[] = []

      // Base Mediterranean diet scoring
      const category = food.category.toLowerCase()
      
      // High scores for Mediterranean staples
      if (MEDITERRANEAN_FOOD_CATEGORIES.VEGETABLES.some(cat => category.includes(cat))) {
        score += 30
        reasons.push('Rich in vegetables')
      }
      
      if (MEDITERRANEAN_FOOD_CATEGORIES.FRUITS.some(cat => category.includes(cat))) {
        score += 25
        reasons.push('Mediterranean fruit')
      }
      
      if (MEDITERRANEAN_FOOD_CATEGORIES.FISH_SEAFOOD.some(cat => category.includes(cat))) {
        score += 35
        reasons.push('Healthy seafood')
      }
      
      if (MEDITERRANEAN_FOOD_CATEGORIES.WHOLE_GRAINS.some(cat => category.includes(cat))) {
        score += 20
        reasons.push('Whole grains')
      }
      
      if (MEDITERRANEAN_FOOD_CATEGORIES.LEGUMES.some(cat => category.includes(cat))) {
        score += 25
        reasons.push('Plant protein')
      }
      
      if (MEDITERRANEAN_FOOD_CATEGORIES.NUTS_SEEDS.some(cat => category.includes(cat))) {
        score += 20
        reasons.push('Healthy fats')
      }

      // Nutrition-based scoring
      const nutrition = calculateFoodNutrition(food, 100) // Per 100g for comparison

      // Protein scoring (important for satiety and muscle maintenance)
      if (nutrition.protein > 15) {
        score += 15
        reasons.push('High protein')
      } else if (nutrition.protein > 8) {
        score += 8
        reasons.push('Good protein')
      }

      // Fiber scoring (important for Mediterranean diet)
      if (nutrition.fiber && nutrition.fiber > 5) {
        score += 15
        reasons.push('High fiber')
      } else if (nutrition.fiber && nutrition.fiber > 3) {
        score += 8
        reasons.push('Good fiber')
      }

      // Calorie density considerations
      if (nutrition.calories < 100) {
        score += 10
        reasons.push('Low calorie density')
      } else if (nutrition.calories > 400) {
        score -= 10
        reasons.push('High calorie density')
      }

      // Meal-specific adjustments
      switch (mealType) {
        case MealType.BREAKFAST:
          if (MEDITERRANEAN_FOOD_CATEGORIES.WHOLE_GRAINS.some(cat => category.includes(cat))) {
            score += 10
            reasons.push('Great for breakfast')
          }
          if (MEDITERRANEAN_FOOD_CATEGORIES.FRUITS.some(cat => category.includes(cat))) {
            score += 10
            reasons.push('Perfect breakfast fruit')
          }
          break
          
        case MealType.LUNCH:
          if (MEDITERRANEAN_FOOD_CATEGORIES.VEGETABLES.some(cat => category.includes(cat))) {
            score += 10
            reasons.push('Ideal lunch vegetable')
          }
          if (MEDITERRANEAN_FOOD_CATEGORIES.LEGUMES.some(cat => category.includes(cat))) {
            score += 10
            reasons.push('Satisfying lunch protein')
          }
          break
          
        case MealType.DINNER:
          if (MEDITERRANEAN_FOOD_CATEGORIES.FISH_SEAFOOD.some(cat => category.includes(cat))) {
            score += 15
            reasons.push('Perfect dinner protein')
          }
          if (MEDITERRANEAN_FOOD_CATEGORIES.VEGETABLES.some(cat => category.includes(cat))) {
            score += 10
            reasons.push('Essential dinner vegetables')
          }
          break
          
        case MealType.SNACK:
          if (MEDITERRANEAN_FOOD_CATEGORIES.NUTS_SEEDS.some(cat => category.includes(cat))) {
            score += 15
            reasons.push('Perfect healthy snack')
          }
          if (MEDITERRANEAN_FOOD_CATEGORIES.FRUITS.some(cat => category.includes(cat))) {
            score += 12
            reasons.push('Ideal snack fruit')
          }
          break
      }

      // Avoid highly processed foods
      if (food.name.toLowerCase().includes('processed') || 
          food.name.toLowerCase().includes('refined')) {
        score -= 20
        reasons.push('Avoid processed foods')
      }

      // Verified foods get bonus
      if (food.isVerified) {
        score += 5
        reasons.push('Verified nutrition data')
      }

      return {
        food,
        score: Math.max(0, score), // Ensure non-negative score
        reasons
      }
    }).sort((a, b) => b.score - a.score)
  }

  // Generate meal recommendations
  async generateMealRecommendations(
    mealType: MealType,
    targetNutrition: NutritionData,
    userProfile?: UserProfile,
    excludeFoodIds: string[] = []
  ): Promise<FoodScore[]> {
    try {
      const mediterraneanFoods = await this.getMediterraneanFoods(200)
      
      const availableFoods = mediterraneanFoods.filter(food => 
        !excludeFoodIds.includes(food.id)
      )

      const scoredFoods = this.scoreFoodsForMeal(
        availableFoods, 
        mealType, 
        targetNutrition, 
        userProfile
      )

      return scoredFoods.slice(0, 20) // Return top 20 recommendations
    } catch (error) {
      logger.error('Error generating meal recommendations', error, { mealType })
      throw error
    }
  }

  // Generate a complete meal plan for a single meal
  async generateMealPlan(
    mealType: MealType,
    targetNutrition: NutritionData,
    userProfile?: UserProfile
  ): Promise<MealPlanMeal> {
    try {
      const recommendations = await this.generateMealRecommendations(
        mealType, 
        targetNutrition, 
        userProfile
      )

      const items: MealPlanItem[] = []
      let currentNutrition: NutritionData = { calories: 0, protein: 0, carbs: 0, fat: 0 }

      // Algorithm to select foods that meet nutritional targets
      for (const { food } of recommendations) {
        if (currentNutrition.calories >= targetNutrition.calories * 0.95) {
          break // Close enough to target
        }

        // Calculate optimal quantity (start with reasonable serving size)
        let quantity = this.getReasonableServingSize(food, mealType)
        
        // Adjust quantity to fit remaining calorie budget
        const remainingCalories = targetNutrition.calories - currentNutrition.calories
        const foodCaloriesPer100g = food.caloriesPer100g
        
        if (foodCaloriesPer100g > 0) {
          const maxQuantity = (remainingCalories / foodCaloriesPer100g) * 100
          quantity = Math.min(quantity, maxQuantity)
        }

        if (quantity < 10) continue // Skip very small quantities

        const itemNutrition = calculateFoodNutrition(food, quantity)
        
        items.push({
          foodId: food.id,
          quantity,
          nutrition: itemNutrition
        })

        currentNutrition = sumNutritionData([currentNutrition, itemNutrition])

        // Don't exceed 5 items per meal
        if (items.length >= 5) break
      }

      return {
        type: mealType,
        items,
        totalNutrition: currentNutrition
      }
    } catch (error) {
      logger.error('Error generating meal plan', error, { mealType })
      throw error
    }
  }

  // Get reasonable serving size based on food type and meal
  private getReasonableServingSize(food: Food, mealType: MealType): number {
    const category = food.category.toLowerCase()
    
    // Base serving sizes (in grams)
    let baseServing = 100

    if (MEDITERRANEAN_FOOD_CATEGORIES.VEGETABLES.some(cat => category.includes(cat))) {
      baseServing = 150 // Generous vegetable portions
    } else if (MEDITERRANEAN_FOOD_CATEGORIES.FRUITS.some(cat => category.includes(cat))) {
      baseServing = 120 // Medium fruit portion
    } else if (MEDITERRANEAN_FOOD_CATEGORIES.FISH_SEAFOOD.some(cat => category.includes(cat))) {
      baseServing = 120 // Standard protein portion
    } else if (MEDITERRANEAN_FOOD_CATEGORIES.POULTRY.some(cat => category.includes(cat))) {
      baseServing = 100 // Lean protein portion
    } else if (MEDITERRANEAN_FOOD_CATEGORIES.WHOLE_GRAINS.some(cat => category.includes(cat))) {
      baseServing = 80 // Moderate grain portion
    } else if (MEDITERRANEAN_FOOD_CATEGORIES.LEGUMES.some(cat => category.includes(cat))) {
      baseServing = 80 // Legume portion
    } else if (MEDITERRANEAN_FOOD_CATEGORIES.NUTS_SEEDS.some(cat => category.includes(cat))) {
      baseServing = 30 // Small nut/seed portion
    } else if (MEDITERRANEAN_FOOD_CATEGORIES.DAIRY.some(cat => category.includes(cat))) {
      baseServing = 150 // Dairy portion
    }

    // Adjust based on meal type
    switch (mealType) {
      case MealType.BREAKFAST:
        return baseServing * 0.8 // Slightly smaller breakfast portions
      case MealType.LUNCH:
        return baseServing * 1.0 // Standard portions
      case MealType.DINNER:
        return baseServing * 1.1 // Slightly larger dinner portions
      case MealType.SNACK:
        return baseServing * 0.5 // Small snack portions
      default:
        return baseServing
    }
  }

  // Generate full day meal plan
  async generateDayMealPlan(
    date: string,
    dailyTargets: DailyNutritionTarget,
    userProfile?: UserProfile
  ): Promise<DayMealPlan> {
    try {
      const mealDistribution = getMealDistribution()
      const meals: MealPlanMeal[] = []

      // Generate each meal
      for (const mealType of Object.values(MealType)) {
        const mealTargets = calculateMealTargets(dailyTargets, mealType)
        const meal = await this.generateMealPlan(mealType, mealTargets, userProfile)
        meals.push(meal)
      }

      const totalNutrition = sumNutritionData(meals.map(meal => meal.totalNutrition))
      
      // Calculate adherence score (simplified)
      const calorieRatio = totalNutrition.calories / dailyTargets.calories
      const adherenceScore = Math.max(0, Math.min(100, 100 - Math.abs((calorieRatio - 1) * 100)))

      return {
        date,
        meals,
        totalNutrition,
        adherenceScore
      }
    } catch (error) {
      logger.error('Error generating day meal plan', error, { date })
      throw error
    }
  }

  // Generate weekly meal plan
  async generateWeeklyMealPlan(
    startDate: Date,
    userProfile: UserProfile
  ): Promise<WeeklyMealPlan> {
    try {
      if (!userProfile.targetCalories || !userProfile.targetProtein || 
          !userProfile.targetCarbs || !userProfile.targetFat) {
        throw new Error('User profile missing nutrition targets')
      }

      const dailyTargets: DailyNutritionTarget = {
        calories: userProfile.targetCalories,
        protein: userProfile.targetProtein,
        carbs: userProfile.targetCarbs,
        fat: userProfile.targetFat,
        fiber: Math.round((userProfile.targetCalories / 1000) * 14),
        sodium: 2300
      }

      const days: DayMealPlan[] = []
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6) // 7 days total

      // Generate meal plan for each day
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(currentDate.getDate() + i)
        
        const dayPlan = await this.generateDayMealPlan(
          currentDate.toISOString().split('T')[0],
          dailyTargets,
          userProfile
        )
        
        days.push(dayPlan)
      }

      // Calculate averages
      const totalNutritionArray = days.map(day => day.totalNutrition)
      const averageNutrition = {
        calories: Math.round(totalNutritionArray.reduce((sum, n) => sum + n.calories, 0) / 7),
        protein: Math.round(totalNutritionArray.reduce((sum, n) => sum + n.protein, 0) / 7 * 10) / 10,
        carbs: Math.round(totalNutritionArray.reduce((sum, n) => sum + n.carbs, 0) / 7 * 10) / 10,
        fat: Math.round(totalNutritionArray.reduce((sum, n) => sum + n.fat, 0) / 7 * 10) / 10,
      }

      const averageAdherenceScore = Math.round(
        days.reduce((sum, day) => sum + day.adherenceScore, 0) / 7
      )

      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days,
        averageNutrition,
        averageAdherenceScore
      }
    } catch (error) {
      logger.error('Error generating weekly meal plan', error)
      throw error
    }
  }

  // Get food alternatives/substitutions
  async getFoodAlternatives(
    originalFoodId: string, 
    mealType: MealType,
    limit: number = 10
  ): Promise<FoodScore[]> {
    try {
      const originalFood = await prisma.food.findUnique({
        where: { id: originalFoodId }
      })

      if (!originalFood) {
        throw new Error('Original food not found')
      }

      // Find foods with similar nutritional profile and category
      const alternatives = await prisma.food.findMany({
        where: {
          AND: [
            { id: { not: originalFoodId } },
            { category: originalFood.category },
            { 
              caloriesPer100g: {
                gte: originalFood.caloriesPer100g * 0.7,
                lte: originalFood.caloriesPer100g * 1.3
              }
            }
          ]
        },
        take: 50
      })

      const targetNutrition = calculateFoodNutrition(originalFood, 100)
      const scoredAlternatives = this.scoreFoodsForMeal(alternatives, mealType, targetNutrition)

      return scoredAlternatives.slice(0, limit)
    } catch (error) {
      logger.error('Error getting food alternatives', error, { originalFoodId, mealType })
      throw error
    }
  }
}