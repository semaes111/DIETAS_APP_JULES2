/**
 * Performance Optimization Utilities for Supabase Deployment
 * Includes caching, connection pooling, and query optimization
 */

import { supabase } from '@/lib/supabase'
import { Cache } from '@/lib/cache'

// Cache configuration
const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  VERY_LONG: 3600 // 1 hour
}

/**
 * Query optimization helpers
 */
export const queryOptimizer = {
  /**
   * Cached food search with intelligent caching
   */
  async searchFoods(query: string, limit = 50) {
    const cacheKey = `foods:search:${query}:${limit}`
    const cached = Cache.get(cacheKey)
    
    if (cached) {
      return cached
    }
    
    const { data, error } = await supabase
      .from('foods')
      .select('id, name, brand, category, serving_size, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_verified')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_verified', true)
      .order('name')
      .limit(limit)
    
    if (!error && data) {
      Cache.set(cacheKey, { data, error }, CACHE_DURATIONS.MEDIUM)
    }
    
    return { data, error }
  },

  /**
   * Cached user meals with date-based caching
   */
  async getUserMealsOptimized(userId: string, date: string) {
    const cacheKey = `meals:user:${userId}:${date}`
    const cached = Cache.get(cacheKey)
    
    if (cached) {
      return cached
    }
    
    const { data, error } = await supabase
      .from('user_meals')
      .select(`
        id,
        meal_type,
        quantity,
        calories,
        protein,
        carbs,
        fat,
        created_at,
        food:foods!inner(
          id,
          name,
          brand,
          serving_size,
          calories_per_100g,
          protein_per_100g,
          carbs_per_100g,
          fat_per_100g
        )
      `)
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      // Cache for shorter time if it's today's data, longer for historical data
      const isToday = date === new Date().toISOString().split('T')[0]
      const cacheDuration = isToday ? CACHE_DURATIONS.SHORT : CACHE_DURATIONS.LONG
      Cache.set(cacheKey, { data, error }, cacheDuration)
    }
    
    return { data, error }
  },

  /**
   * Optimized daily nutrition calculation with caching
   */
  async getDailyNutritionOptimized(userId: string, date: string) {
    const cacheKey = `nutrition:daily:${userId}:${date}`
    const cached = Cache.get(cacheKey)
    
    if (cached) {
      return cached
    }
    
    const { data, error } = await supabase
      .from('user_meals')
      .select('calories, protein, carbs, fat')
      .eq('user_id', userId)
      .eq('date', date)
    
    if (error) {
      return { data: null, error }
    }
    
    const totals = data?.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
    
    // Cache nutrition totals
    const isToday = date === new Date().toISOString().split('T')[0]
    const cacheDuration = isToday ? CACHE_DURATIONS.SHORT : CACHE_DURATIONS.VERY_LONG
    Cache.set(cacheKey, { data: totals, error: null }, cacheDuration)
    
    return { data: totals, error: null }
  },

  /**
   * Batch insert with optimized performance
   */
  async batchInsertUserMeals(userId: string, meals: any[]) {
    // Clear cache for affected dates
    const affectedDates = [...new Set(meals.map(meal => meal.date))]
    affectedDates.forEach(date => {
      Cache.delete(`meals:user:${userId}:${date}`)
      Cache.delete(`nutrition:daily:${userId}:${date}`)
    })
    
    // Use batch insert for better performance
    const mealsWithUserId = meals.map(meal => ({
      ...meal,
      user_id: userId
    }))
    
    const { data, error } = await supabase
      .from('user_meals')
      .insert(mealsWithUserId)
      .select(`
        id,
        meal_type,
        quantity,
        calories,
        protein,
        carbs,
        fat,
        created_at,
        food:foods(name)
      `)
    
    return { data, error }
  }
}

/**
 * Connection pool management
 */
export const connectionManager = {
  /**
   * Test database connection with timeout
   */
  async testConnection(timeout = 5000): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      const { data, error } = await Promise.race([
        supabase.from('users').select('count').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), timeout)
        )
      ]) as any
      
      const responseTime = Date.now() - startTime
      
      if (error) {
        return { success: false, responseTime, error: error.message }
      }
      
      return { success: true, responseTime }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      return { 
        success: false, 
        responseTime, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  },

  /**
   * Get connection pool status
   */
  getPoolStatus() {
    // This would typically integrate with your connection pool library
    return {
      active: 1,
      idle: 0,
      total: 1,
      waiting: 0
    }
  }
}

/**
 * Performance monitoring
 */
export const performanceMonitor = {
  /**
   * Track query performance
   */
  async trackQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T & { __performance?: { duration: number; timestamp: string } }> {
    const startTime = Date.now()
    
    try {
      const result = await queryFn()
      const duration = Date.now() - startTime
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration}ms`)
      }
      
      // Add performance metadata
      if (typeof result === 'object' && result !== null) {
        (result as any).__performance = {
          duration,
          timestamp: new Date().toISOString(),
          query: queryName
        }
      }
      
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`Query failed: ${queryName} (${duration}ms)`, error)
      throw error
    }
  },

  /**
   * Get performance metrics
   */
  getMetrics() {
    const memUsage = process.memoryUsage()
    
    return {
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      uptime: `${Math.round(process.uptime())}s`,
      cache: {
        size: Cache.size(),
        hitRate: Cache.getHitRate()
      }
    }
  }
}

/**
 * Database optimization utilities
 */
export const dbOptimizer = {
  /**
   * Suggest indexes for better performance
   */
  getSuggestedIndexes() {
    return [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_meals_user_date ON user_meals(user_id, date);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_meals_date_meal_type ON user_meals(date, meal_type);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_foods_name_trgm ON foods USING gin(name gin_trgm_ops);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_logs_user_date ON progress_logs(user_id, date);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_user_public ON recipes(user_id, is_public);'
    ]
  },

  /**
   * Get table statistics
   */
  async getTableStats() {
    try {
      const tables = ['users', 'foods', 'user_meals', 'progress_logs', 'recipes']
      const stats: Record<string, any> = {}
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        stats[table] = {
          rowCount: count || 0,
          error: error?.message || null
        }
      }
      
      return stats
      
    } catch (error) {
      console.error('Failed to get table stats:', error)
      return {}
    }
  }
}

/**
 * Cache warming utilities
 */
export const cacheWarmer = {
  /**
   * Warm up common food categories
   */
  async warmFoodCategories() {
    const categories = ['Vegetables', 'Fruits', 'Proteins', 'Grains', 'Dairy']
    
    const promises = categories.map(async (category) => {
      const cacheKey = `foods:category:${category}`
      
      const { data, error } = await supabase
        .from('foods')
        .select('id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
        .eq('category', category)
        .eq('is_verified', true)
        .order('name')
        .limit(50)
      
      if (!error && data) {
        Cache.set(cacheKey, { data, error }, CACHE_DURATIONS.VERY_LONG)
      }
    })
    
    await Promise.all(promises)
    console.log('Food categories cache warmed')
  },

  /**
   * Warm up user profile data
   */
  async warmUserProfile(userId: string) {
    const cacheKey = `profile:${userId}`
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!error && data) {
      Cache.set(cacheKey, { data, error }, CACHE_DURATIONS.LONG)
    }
  }
}

/**
 * Export all performance utilities
 */
export const performance = {
  query: queryOptimizer,
  connection: connectionManager,
  monitor: performanceMonitor,
  db: dbOptimizer,
  cache: cacheWarmer
}