// Unit tests for validation schemas
import { describe, it, expect } from '@jest/globals'
import {
  userRegistrationSchema,
  userProfileSchema,
  foodSchema,
  foodSearchSchema,
  userMealSchema,
  recipeSchema,
  progressLogSchema,
} from '@/lib/validations'
import { ZodError } from 'zod'

describe('Validation Schemas', () => {
  describe('userRegistrationSchema', () => {
    it('should validate valid user registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      }

      const result = userRegistrationSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!'
      }

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject weak password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak'
      }

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject password without special characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'NoSpecialChar123'
      }

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject too short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'SecurePass123!'
      }

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('userProfileSchema', () => {
    it('should validate valid user profile data', () => {
      const validData = {
        age: 30,
        gender: 'MALE' as const,
        height: 175,
        weight: 70,
        activityLevel: 'MODERATELY_ACTIVE' as const,
        goal: 'MAINTAIN' as const,
        bmr: 1650,
        tdee: 2200,
        targetCalories: 2200,
        targetProtein: 110,
        targetCarbs: 248,
        targetFat: 86,
      }

      const result = userProfileSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid age', () => {
      const invalidData = {
        age: 15, // Too young
        gender: 'MALE' as const,
        height: 175,
        weight: 70,
        activityLevel: 'MODERATELY_ACTIVE' as const,
        goal: 'MAINTAIN' as const,
        bmr: 1650,
        tdee: 2200,
        targetCalories: 2200,
        targetProtein: 110,
        targetCarbs: 248,
        targetFat: 86,
      }

      expect(() => userProfileSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject invalid gender', () => {
      const invalidData = {
        age: 30,
        gender: 'INVALID' as any,
        height: 175,
        weight: 70,
        activityLevel: 'MODERATELY_ACTIVE' as const,
        goal: 'MAINTAIN' as const,
        bmr: 1650,
        tdee: 2200,
        targetCalories: 2200,
        targetProtein: 110,
        targetCarbs: 248,
        targetFat: 86,
      }

      expect(() => userProfileSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject unrealistic weight', () => {
      const invalidData = {
        age: 30,
        gender: 'MALE' as const,
        height: 175,
        weight: 500, // Too heavy
        activityLevel: 'MODERATELY_ACTIVE' as const,
        goal: 'MAINTAIN' as const,
        bmr: 1650,
        tdee: 2200,
        targetCalories: 2200,
        targetProtein: 110,
        targetCarbs: 248,
        targetFat: 86,
      }

      expect(() => userProfileSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('foodSchema', () => {
    it('should validate valid food data', () => {
      const validData = {
        name: 'Spinach',
        category: 'vegetables',
        servingSize: 100,
        caloriesPer100g: 23,
        proteinPer100g: 2.9,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        fiberPer100g: 2.2,
        sodiumPer100g: 79,
        isVerified: true,
      }

      const result = foodSchema.parse(validData)
      expect(result.name).toBe(validData.name)
      expect(result.isVerified).toBe(true)
    })

    it('should reject negative nutrition values', () => {
      const invalidData = {
        name: 'Test Food',
        category: 'test',
        servingSize: 100,
        caloriesPer100g: -10, // Negative calories
        proteinPer100g: 2.9,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
      }

      expect(() => foodSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject empty food name', () => {
      const invalidData = {
        name: '',
        category: 'test',
        servingSize: 100,
        caloriesPer100g: 23,
        proteinPer100g: 2.9,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
      }

      expect(() => foodSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should handle optional fields', () => {
      const minimalData = {
        name: 'Test Food',
        category: 'test',
        servingSize: 100,
        caloriesPer100g: 23,
        proteinPer100g: 2.9,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
      }

      const result = foodSchema.parse(minimalData)
      expect(result.isVerified).toBe(false) // Default value
      expect(result.fiberPer100g).toBeUndefined()
    })
  })

  describe('foodSearchSchema', () => {
    it('should validate search parameters', () => {
      const validData = {
        search: 'spinach',
        category: 'vegetables',
        limit: '20',
        offset: '0',
      }

      const result = foodSearchSchema.parse(validData)
      expect(result.search).toBe('spinach')
      expect(result.limit).toBe(20) // Coerced to number
      expect(result.offset).toBe(0)
    })

    it('should apply defaults for missing parameters', () => {
      const result = foodSearchSchema.parse({})
      expect(result.limit).toBe(50) // Default limit
      expect(result.offset).toBe(0) // Default offset
    })

    it('should reject excessive limit', () => {
      const invalidData = {
        limit: '1000', // Too high
      }

      expect(() => foodSearchSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('userMealSchema', () => {
    it('should validate valid user meal data', () => {
      const validData = {
        foodId: 'clm123456789',
        date: '2024-01-15',
        mealType: 'BREAKFAST' as const,
        quantity: 150,
      }

      const result = userMealSchema.parse(validData)
      expect(result.foodId).toBe(validData.foodId)
      expect(result.date).toBeInstanceOf(Date)
      expect(result.mealType).toBe('BREAKFAST')
      expect(result.quantity).toBe(150)
    })

    it('should reject invalid meal type', () => {
      const invalidData = {
        foodId: 'clm123456789',
        date: '2024-01-15',
        mealType: 'INVALID' as any,
        quantity: 150,
      }

      expect(() => userMealSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject negative quantity', () => {
      const invalidData = {
        foodId: 'clm123456789',
        date: '2024-01-15',
        mealType: 'BREAKFAST' as const,
        quantity: -10,
      }

      expect(() => userMealSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('recipeSchema', () => {
    it('should validate valid recipe data', () => {
      const validData = {
        name: 'Mediterranean Salad',
        description: 'A healthy salad with olive oil dressing',
        instructions: 'Mix all ingredients together and serve.',
        servings: 4,
        prepTime: 15,
        cookTime: 0,
        difficulty: 'EASY' as const,
        category: 'salads',
        ingredients: [
          {
            foodId: 'clm123456789',
            quantity: 200,
            notes: 'Fresh spinach leaves'
          }
        ],
        isPublic: false,
      }

      const result = recipeSchema.parse(validData)
      expect(result.name).toBe(validData.name)
      expect(result.ingredients).toHaveLength(1)
      expect(result.isPublic).toBe(false)
    })

    it('should reject recipe without ingredients', () => {
      const invalidData = {
        name: 'Empty Recipe',
        instructions: 'No ingredients',
        servings: 1,
        ingredients: [],
      }

      expect(() => recipeSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject too many servings', () => {
      const invalidData = {
        name: 'Big Recipe',
        instructions: 'Serves too many',
        servings: 25, // Too many
        ingredients: [
          {
            foodId: 'clm123456789',
            quantity: 200,
          }
        ],
      }

      expect(() => recipeSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('progressLogSchema', () => {
    it('should validate valid progress log data', () => {
      const validData = {
        date: '2024-01-15',
        weight: 70.5,
        bodyFat: 15.2,
        waist: 85,
        mood: 4,
        energyLevel: 3,
        sleepHours: 7.5,
        waterIntake: 2.5,
        notes: 'Feeling great today!',
      }

      const result = progressLogSchema.parse(validData)
      expect(result.date).toBeInstanceOf(Date)
      expect(result.weight).toBe(70.5)
      expect(result.mood).toBe(4)
    })

    it('should reject invalid mood score', () => {
      const invalidData = {
        date: '2024-01-15',
        weight: 70,
        mood: 6, // Too high (max is 5)
      }

      expect(() => progressLogSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject unrealistic sleep hours', () => {
      const invalidData = {
        date: '2024-01-15',
        weight: 70,
        sleepHours: 25, // Too many hours
      }

      expect(() => progressLogSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should handle optional fields', () => {
      const minimalData = {
        date: '2024-01-15',
      }

      const result = progressLogSchema.parse(minimalData)
      expect(result.date).toBeInstanceOf(Date)
      expect(result.weight).toBeUndefined()
      expect(result.notes).toBeUndefined()
    })
  })
})