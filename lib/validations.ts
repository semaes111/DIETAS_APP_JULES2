import { z } from "zod"

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number, and special character"),
})

export const userProfileSchema = z.object({
  age: z.number().min(16, "Must be at least 16 years old").max(120, "Invalid age"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  height: z.number().min(140, "Height too low").max(220, "Height too high"),
  weight: z.number().min(40, "Weight too low").max(300, "Weight too high"),
  activityLevel: z.enum([
    "SEDENTARY",
    "LIGHTLY_ACTIVE", 
    "MODERATELY_ACTIVE",
    "VERY_ACTIVE",
    "EXTREMELY_ACTIVE"
  ]),
  goal: z.enum(["LOSE", "MAINTAIN", "GAIN"]),
  dietaryRestrictions: z.array(z.string()).optional(),
  healthConditions: z.array(z.string()).optional(),
  bmr: z.number().min(1000).max(3000),
  tdee: z.number().min(1200).max(5000),
  targetCalories: z.number().min(1200).max(5000),
  targetProtein: z.number().min(50).max(300),
  targetCarbs: z.number().min(100).max(500),
  targetFat: z.number().min(30).max(200),
})

// Food validation schemas
export const foodSchema = z.object({
  name: z.string().min(1, "Food name is required").max(200, "Name too long"),
  brand: z.string().max(100, "Brand name too long").optional(),
  barcode: z.string().max(50, "Barcode too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  category: z.string().min(1, "Category is required").max(100, "Category too long"),
  servingSize: z.number().min(0.1, "Serving size must be positive").max(1000),
  caloriesPer100g: z.number().min(0).max(900),
  proteinPer100g: z.number().min(0).max(100),
  carbsPer100g: z.number().min(0).max(100),
  fatPer100g: z.number().min(0).max(100),
  fiberPer100g: z.number().min(0).max(50).optional(),
  sugarPer100g: z.number().min(0).max(100).optional(),
  sodiumPer100g: z.number().min(0).max(10000).optional(),
  isVerified: z.boolean().optional().default(false),
})

export const foodSearchSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
})

// Meal validation schemas
export const mealItemSchema = z.object({
  foodId: z.string().cuid("Invalid food ID"),
  quantity: z.number().min(0.1, "Quantity must be positive").max(2000),
})

export const userMealSchema = z.object({
  foodId: z.string().cuid("Invalid food ID"),
  date: z.coerce.date(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  quantity: z.number().min(0.1, "Quantity must be positive").max(2000),
})

export const mealPlanSchema = z.object({
  name: z.string().min(1, "Meal plan name is required").max(200, "Name too long"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  meals: z.array(z.object({
    date: z.coerce.date(),
    type: z.string().max(50),
    name: z.string().max(200).optional(),
    items: z.array(mealItemSchema),
  })),
})

// Recipe validation schemas
export const recipeIngredientSchema = z.object({
  foodId: z.string().cuid("Invalid food ID"),
  quantity: z.number().min(0.1, "Quantity must be positive").max(2000),
  notes: z.string().max(500).optional(),
})

export const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required").max(200, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  instructions: z.string().min(10, "Instructions are required").max(5000, "Instructions too long"),
  servings: z.number().min(1, "Must serve at least 1 person").max(20),
  prepTime: z.number().min(0).max(480).optional(), // max 8 hours
  cookTime: z.number().min(0).max(480).optional(), // max 8 hours
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  category: z.string().max(100).optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, "At least one ingredient is required"),
  isPublic: z.boolean().optional().default(false),
})

// Progress tracking validation
export const progressLogSchema = z.object({
  date: z.coerce.date(),
  weight: z.number().min(40).max(300).optional(),
  bodyFat: z.number().min(5).max(50).optional(),
  muscleMass: z.number().min(20).max(100).optional(),
  waist: z.number().min(50).max(200).optional(),
  chest: z.number().min(70).max(200).optional(),
  hips: z.number().min(70).max(200).optional(),
  notes: z.string().max(1000).optional(),
  mood: z.number().min(1).max(5).optional(),
  energyLevel: z.number().min(1).max(5).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  waterIntake: z.number().min(0).max(10).optional(), // liters
})

// Shopping list validation
export const shoppingListItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200, "Name too long"),
  category: z.string().max(100).optional(),
  quantity: z.number().min(0.1).max(100).optional(),
  unit: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
})

export const shoppingListSchema = z.object({
  name: z.string().min(1, "Shopping list name is required").max(200, "Name too long"),
  items: z.array(shoppingListItemSchema),
})

// Pagination schema
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
})

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.startDate <= data.endDate, {
  message: "Start date must be before end date",
  path: ["endDate"],
})

// Bulk operations schema
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid("Invalid ID")).min(1, "At least one ID is required").max(100, "Too many IDs"),
})

// CSV import validation
export const csvImportSchema = z.object({
  data: z.array(z.record(z.string(), z.any())).min(1, "No data to import").max(10000, "Too many records"),
  skipValidation: z.boolean().optional().default(false),
})

// Export refined types for better TypeScript support
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type FoodInput = z.infer<typeof foodSchema>
export type FoodSearchInput = z.infer<typeof foodSearchSchema>
export type UserMealInput = z.infer<typeof userMealSchema>
export type MealPlanInput = z.infer<typeof mealPlanSchema>
export type RecipeInput = z.infer<typeof recipeSchema>
export type ProgressLogInput = z.infer<typeof progressLogSchema>
export type ShoppingListInput = z.infer<typeof shoppingListSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>