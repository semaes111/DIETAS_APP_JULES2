/**
 * Supabase Helper Functions
 * Utilities for working with Supabase RLS and data operations
 */

import { supabase, supabaseAdmin, handleSupabaseError } from '@/lib/supabase'
import { Database } from '@/types/supabase'

// Type aliases for convenience
type Tables = Database['public']['Tables']
type UserRow = Tables['users']['Row']
type UserMealRow = Tables['user_meals']['Row']
type FoodRow = Tables['foods']['Row']
type ProgressLogRow = Tables['progress_logs']['Row']

/**
 * User Management Functions
 */
export const userHelpers = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  async updateUserProfile(userId: string, updates: Partial<Tables['user_profiles']['Update']>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  async createUserProfile(userId: string, profile: Tables['user_profiles']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({ ...profile, user_id: userId })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  }
}

/**
 * Food Database Functions
 */
export const foodHelpers = {
  async searchFoods(query: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_verified', true)
        .order('name')
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  },

  async getFoodById(foodId: string) {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', foodId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  async getFoodsByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('category', category)
        .eq('is_verified', true)
        .order('name')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  }
}

/**
 * User Meals Functions
 */
export const mealHelpers = {
  async getUserMeals(userId: string, date?: string) {
    try {
      let query = supabase
        .from('user_meals')
        .select(`
          *,
          food:foods(*)
        `)
        .eq('user_id', userId)

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  },

  async addUserMeal(userId: string, meal: Omit<Tables['user_meals']['Insert'], 'user_id'>) {
    try {
      const { data, error } = await supabase
        .from('user_meals')
        .insert({ ...meal, user_id: userId })
        .select(`
          *,
          food:foods(*)
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  async updateUserMeal(userId: string, mealId: string, updates: Partial<Tables['user_meals']['Update']>) {
    try {
      const { data, error } = await supabase
        .from('user_meals')
        .update(updates)
        .eq('id', mealId)
        .eq('user_id', userId)
        .select(`
          *,
          food:foods(*)
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  async deleteUserMeal(userId: string, mealId: string) {
    try {
      const { error } = await supabase
        .from('user_meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: handleSupabaseError(error) }
    }
  },

  async getDailyNutrition(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('user_meals')
        .select('calories, protein, carbs, fat')
        .eq('user_id', userId)
        .eq('date', date)

      if (error) throw error

      const totals = data?.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

      return { data: totals, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  }
}

/**
 * Progress Tracking Functions
 */
export const progressHelpers = {
  async getProgressLogs(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  },

  async addProgressLog(userId: string, progress: Omit<Tables['progress_logs']['Insert'], 'user_id'>) {
    try {
      const { data, error } = await supabase
        .from('progress_logs')
        .insert({ ...progress, user_id: userId })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  async updateProgressLog(userId: string, logId: string, updates: Partial<Tables['progress_logs']['Update']>) {
    try {
      const { data, error } = await supabase
        .from('progress_logs')
        .update(updates)
        .eq('id', logId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  async getWeightProgress(userId: string, days = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('progress_logs')
        .select('date, weight')
        .eq('user_id', userId)
        .not('weight', 'is', null)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  }
}

/**
 * Recipe Functions
 */
export const recipeHelpers = {
  async getUserRecipes(userId: string) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients(
            *,
            food:foods(*)
          ),
          nutrition:recipe_nutrition(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  },

  async getPublicRecipes(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients(
            *,
            food:foods(*)
          ),
          nutrition:recipe_nutrition(*)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  }
}

/**
 * Admin Functions (require service role key)
 */
export const adminHelpers = {
  async getAllUsers(limit = 100) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          profile:user_profiles(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  },

  async makeUserAdmin(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ is_admin: true })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('get_user_stats', { user_uuid: userId })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  }
}

/**
 * Real-time Subscriptions
 */
export const subscriptionHelpers = {
  subscribeToUserMeals(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_meals_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_meals',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToProgressLogs(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`progress_logs_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress_logs',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

/**
 * Batch Operations
 */
export const batchHelpers = {
  async addMultipleUserMeals(userId: string, meals: Omit<Tables['user_meals']['Insert'], 'user_id'>[]) {
    try {
      const mealsWithUserId = meals.map(meal => ({ ...meal, user_id: userId }))
      
      const { data, error } = await supabase
        .from('user_meals')
        .insert(mealsWithUserId)
        .select(`
          *,
          food:foods(*)
        `)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: handleSupabaseError(error) }
    }
  }
}