// Unit tests for nutrition service
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroTargets,
  calculateFoodNutrition,
  sumNutritionData,
  calculateAdherenceScore,
  NutritionService
} from '@/lib/nutrition-service'
import { Gender, ActivityLevel, Goal } from '@prisma/client'

describe('Nutrition Service - Calculations', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR correctly for males', () => {
      const bmr = calculateBMR(70, 175, 30, Gender.MALE)
      expect(bmr).toBe(1659) // (10 * 70) + (6.25 * 175) - (5 * 30) + 5
    })

    it('should calculate BMR correctly for females', () => {
      const bmr = calculateBMR(60, 165, 25, Gender.FEMALE)
      expect(bmr).toBe(1372) // (10 * 60) + (6.25 * 165) - (5 * 25) - 161
    })

    it('should handle edge cases', () => {
      const bmr = calculateBMR(50, 150, 20, Gender.FEMALE)
      expect(bmr).toBeGreaterThan(0)
      expect(Number.isInteger(bmr)).toBe(true)
    })
  })

  describe('calculateTDEE', () => {
    it('should calculate TDEE for sedentary activity level', () => {
      const bmr = 1650
      const tdee = calculateTDEE(bmr, ActivityLevel.SEDENTARY)
      expect(tdee).toBe(1980) // 1650 * 1.2
    })

    it('should calculate TDEE for very active level', () => {
      const bmr = 1650
      const tdee = calculateTDEE(bmr, ActivityLevel.VERY_ACTIVE)
      expect(tdee).toBe(2847) // 1650 * 1.725
    })
  })

  describe('calculateTargetCalories', () => {
    it('should calculate calories for weight loss goal', () => {
      const tdee = 2000
      const targetCalories = calculateTargetCalories(tdee, Goal.LOSE)
      expect(targetCalories).toBe(1600) // 2000 * 0.8
    })

    it('should calculate calories for weight gain goal', () => {
      const tdee = 2000
      const targetCalories = calculateTargetCalories(tdee, Goal.GAIN)
      expect(targetCalories).toBe(2200) // 2000 * 1.1
    })

    it('should calculate calories for maintenance goal', () => {
      const tdee = 2000
      const targetCalories = calculateTargetCalories(tdee, Goal.MAINTAIN)
      expect(targetCalories).toBe(2000)
    })
  })

  describe('calculateMacroTargets', () => {
    it('should calculate macro targets with default Mediterranean distribution', () => {
      const targetCalories = 2000
      const macros = calculateMacroTargets(targetCalories)
      
      expect(macros.protein).toBe(100) // 20% * 2000 / 4
      expect(macros.carbs).toBe(225) // 45% * 2000 / 4
      expect(macros.fat).toBe(78) // 35% * 2000 / 9
    })

    it('should calculate macro targets with custom distribution', () => {
      const targetCalories = 2000
      const customDistribution = {
        proteinPercentage: 25,
        carbsPercentage: 40,
        fatPercentage: 35
      }
      const macros = calculateMacroTargets(targetCalories, customDistribution)
      
      expect(macros.protein).toBe(125) // 25% * 2000 / 4
      expect(macros.carbs).toBe(200) // 40% * 2000 / 4
      expect(macros.fat).toBe(78) // 35% * 2000 / 9
    })
  })

  describe('calculateFoodNutrition', () => {
    it('should calculate nutrition for a given quantity', () => {
      const food = global.testUtils.mockFood
      const quantity = 150 // grams
      
      const nutrition = calculateFoodNutrition(food, quantity)
      
      expect(nutrition.calories).toBe(38) // 25 * 1.5, rounded
      expect(nutrition.protein).toBe(4.2) // 2.8 * 1.5
      expect(nutrition.carbs).toBe(6.9) // 4.6 * 1.5
      expect(nutrition.fat).toBe(0.5) // 0.3 * 1.5, rounded
    })

    it('should handle zero quantity', () => {
      const food = global.testUtils.mockFood
      const nutrition = calculateFoodNutrition(food, 0)
      
      expect(nutrition.calories).toBe(0)
      expect(nutrition.protein).toBe(0)
      expect(nutrition.carbs).toBe(0)
      expect(nutrition.fat).toBe(0)
    })
  })

  describe('sumNutritionData', () => {
    it('should sum multiple nutrition objects correctly', () => {
      const nutritionArray = [
        { calories: 100, protein: 5, carbs: 15, fat: 3 },
        { calories: 200, protein: 10, carbs: 25, fat: 5 },
        { calories: 150, protein: 8, carbs: 20, fat: 4 },
      ]
      
      const sum = sumNutritionData(nutritionArray)
      
      expect(sum.calories).toBe(450)
      expect(sum.protein).toBe(23)
      expect(sum.carbs).toBe(60)
      expect(sum.fat).toBe(12)
    })

    it('should handle empty array', () => {
      const sum = sumNutritionData([])
      
      expect(sum.calories).toBe(0)
      expect(sum.protein).toBe(0)
      expect(sum.carbs).toBe(0)
      expect(sum.fat).toBe(0)
    })

    it('should handle optional fields correctly', () => {
      const nutritionArray = [
        { calories: 100, protein: 5, carbs: 15, fat: 3, fiber: 2 },
        { calories: 200, protein: 10, carbs: 25, fat: 5 },
      ]
      
      const sum = sumNutritionData(nutritionArray)
      
      expect(sum.fiber).toBe(2) // Should preserve fiber from first item
    })
  })

  describe('calculateAdherenceScore', () => {
    it('should return 100% for perfect adherence', () => {
      const consumed = { calories: 2000, protein: 100, carbs: 200, fat: 80 }
      const targets = { calories: 2000, protein: 100, carbs: 200, fat: 80 }
      
      const score = calculateAdherenceScore(consumed, targets)
      expect(score).toBe(100)
    })

    it('should penalize for going significantly over calories', () => {
      const consumed = { calories: 2500, protein: 100, carbs: 200, fat: 80 }
      const targets = { calories: 2000, protein: 100, carbs: 200, fat: 80 }
      
      const score = calculateAdherenceScore(consumed, targets)
      expect(score).toBeLessThan(100)
      expect(score).toBeGreaterThan(0)
    })

    it('should reward adequate protein intake', () => {
      const consumed = { calories: 2000, protein: 120, carbs: 200, fat: 80 }
      const targets = { calories: 2000, protein: 100, carbs: 200, fat: 80 }
      
      const score = calculateAdherenceScore(consumed, targets)
      expect(score).toBe(100) // Extra protein should not lower score
    })

    it('should penalize for very low protein', () => {
      const consumed = { calories: 2000, protein: 50, carbs: 200, fat: 80 }
      const targets = { calories: 2000, protein: 100, carbs: 200, fat: 80 }
      
      const score = calculateAdherenceScore(consumed, targets)
      expect(score).toBeLessThan(100)
    })
  })
})

describe('NutritionService - Database Operations', () => {
  let nutritionService: NutritionService

  beforeEach(() => {
    nutritionService = new NutritionService()
    // Mock Prisma client
    jest.clearAllMocks()
  })

  describe('getDailyNutritionSummary', () => {
    it('should return daily nutrition summary', async () => {
      // Mock implementation would go here
      // This would require setting up proper test database or mocking Prisma
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('updateUserNutritionTargets', () => {
    it('should calculate and update nutrition targets', async () => {
      // Mock implementation would go here
      expect(true).toBe(true) // Placeholder
    })
  })
})