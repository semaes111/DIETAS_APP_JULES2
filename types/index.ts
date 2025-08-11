import { 
  User, 
  UserProfile, 
  Food, 
  MealPlan, 
  Meal, 
  MealItem,
  UserMeal,
  Recipe,
  RecipeIngredient,
  RecipeNutrition,
  ProgressLog,
  ShoppingList,
  ShoppingListItem,
  Gender,
  ActivityLevel,
  Goal,
  MealType
} from '@prisma/client'

export type {
  User,
  UserProfile,
  Food,
  MealPlan,
  Meal,
  MealItem,
  UserMeal,
  Recipe,
  RecipeIngredient,
  RecipeNutrition,
  ProgressLog,
  ShoppingList,
  ShoppingListItem,
  Gender,
  ActivityLevel,
  Goal,
  MealType
}

// Extended types with relations
export type UserWithProfile = User & {
  profile?: UserProfile | null
}

export type MealPlanWithMeals = MealPlan & {
  meals: (Meal & {
    mealItems: (MealItem & {
      food: Food
    })[]
  })[]
}

export type RecipeWithDetails = Recipe & {
  ingredients: (RecipeIngredient & {
    food: Food
  })[]
  nutrition?: RecipeNutrition | null
}

export type ShoppingListWithItems = ShoppingList & {
  items: ShoppingListItem[]
}

// Form types
export interface ProfileFormData {
  name: string
  age: number
  gender: Gender
  height: number
  weight: number
  activityLevel: ActivityLevel
  goal: Goal
  dietaryRestrictions: string[]
  healthConditions: string[]
}

export interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface DayNutritionSummary {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  meals: {
    [key in MealType]: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }
}

export interface WeeklyProgressData {
  weight: { date: string; value: number }[]
  calories: { date: string; consumed: number; target: number }[]
  macros: {
    date: string
    protein: { consumed: number; target: number }
    carbs: { consumed: number; target: number }
    fat: { consumed: number; target: number }
  }[]
}