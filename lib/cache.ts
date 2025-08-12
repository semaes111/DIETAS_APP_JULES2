// In-memory caching system (Redis replacement for development/small deployments)
import { logger } from "./logger"

// Cache entry interface
interface CacheEntry<T> {
  value: T
  expiresAt: number
  createdAt: number
  accessCount: number
  lastAccessed: number
}

// Cache statistics
interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  size: number
  hitRate: number
}

// Cache configuration
interface CacheConfig {
  maxSize: number
  defaultTTL: number // in seconds
  checkInterval: number // cleanup interval in seconds
  maxMemoryUsage?: number // in MB
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  }
  private cleanupInterval: NodeJS.Timeout | null = null
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 10000,
      defaultTTL: config.defaultTTL || 3600, // 1 hour
      checkInterval: config.checkInterval || 300, // 5 minutes
      maxMemoryUsage: config.maxMemoryUsage || 100, // 100MB
    }

    this.startCleanup()
  }

  // Start automatic cleanup
  private startCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.config.checkInterval * 1000)
  }

  // Cleanup expired entries
  private cleanup() {
    const now = Date.now()
    let removedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key)
        removedCount++
      }
    }

    if (removedCount > 0) {
      this.stats.evictions += removedCount
      this.stats.size = this.cache.size
      logger.debug(`Cache cleanup: removed ${removedCount} expired entries`)
    }

    // Check memory usage and evict LRU entries if needed
    this.evictIfNeeded()
  }

  // Evict least recently used entries if cache is too large
  private evictIfNeeded() {
    if (this.cache.size <= this.config.maxSize) {
      return
    }

    // Sort by last accessed time (LRU)
    const entries = Array.from(this.cache.entries()).sort((a, b) => 
      a[1].lastAccessed - b[1].lastAccessed
    )

    const evictCount = this.cache.size - this.config.maxSize
    for (let i = 0; i < evictCount; i++) {
      this.cache.delete(entries[i][0])
      this.stats.evictions++
    }

    this.stats.size = this.cache.size
    logger.debug(`Cache eviction: removed ${evictCount} LRU entries`)
  }

  // Set a value in the cache
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds || this.config.defaultTTL
    const now = Date.now()
    
    const entry: CacheEntry<T> = {
      value,
      expiresAt: now + (ttl * 1000),
      createdAt: now,
      accessCount: 0,
      lastAccessed: now,
    }

    this.cache.set(key, entry)
    this.stats.sets++
    this.stats.size = this.cache.size

    // Immediate eviction check if needed
    if (this.cache.size > this.config.maxSize) {
      this.evictIfNeeded()
    }
  }

  // Get a value from the cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    const now = Date.now()

    // Check if expired
    if (entry.expiresAt < now) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      this.stats.size = this.cache.size
      this.updateHitRate()
      return null
    }

    // Update access statistics
    entry.lastAccessed = now
    entry.accessCount++
    this.stats.hits++
    this.updateHitRate()

    return entry.value
  }

  // Update hit rate
  private updateHitRate() {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Delete a specific key
  delete(key: string): boolean {
    const existed = this.cache.delete(key)
    if (existed) {
      this.stats.deletes++
      this.stats.size = this.cache.size
    }
    return existed
  }

  // Delete keys matching a pattern
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    let deletedCount = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      this.stats.deletes += deletedCount
      this.stats.size = this.cache.size
    }

    return deletedCount
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.stats.deletes += size
    this.stats.size = 0
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats }
  }

  // Get all keys (for debugging)
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Get cache size
  size(): number {
    return this.cache.size
  }

  // Destroy cache and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Global cache instance
const globalCache = new InMemoryCache({
  maxSize: 5000,
  defaultTTL: 1800, // 30 minutes
  checkInterval: 300, // 5 minutes
})

// Cache utility functions with different TTL presets
export class Cache {
  // Short-term cache (5 minutes) - for frequently changing data
  static setShort<T>(key: string, value: T): void {
    globalCache.set(key, value, 300) // 5 minutes
    logger.debug('Cache set (short)', { key, ttl: '5min' })
  }

  // Medium-term cache (30 minutes) - for moderate changing data
  static setMedium<T>(key: string, value: T): void {
    globalCache.set(key, value, 1800) // 30 minutes
    logger.debug('Cache set (medium)', { key, ttl: '30min' })
  }

  // Long-term cache (2 hours) - for rarely changing data
  static setLong<T>(key: string, value: T): void {
    globalCache.set(key, value, 7200) // 2 hours
    logger.debug('Cache set (long)', { key, ttl: '2h' })
  }

  // Custom TTL cache
  static set<T>(key: string, value: T, ttlSeconds: number): void {
    globalCache.set(key, value, ttlSeconds)
    logger.debug('Cache set (custom)', { key, ttl: `${ttlSeconds}s` })
  }

  // Get from cache
  static get<T>(key: string): T | null {
    const value = globalCache.get<T>(key)
    if (value !== null) {
      logger.debug('Cache hit', { key })
    } else {
      logger.debug('Cache miss', { key })
    }
    return value
  }

  // Check existence
  static has(key: string): boolean {
    return globalCache.has(key)
  }

  // Delete key
  static delete(key: string): boolean {
    const deleted = globalCache.delete(key)
    if (deleted) {
      logger.debug('Cache delete', { key })
    }
    return deleted
  }

  // Delete pattern
  static deletePattern(pattern: string): number {
    const count = globalCache.deletePattern(pattern)
    logger.debug('Cache delete pattern', { pattern, count })
    return count
  }

  // Clear all cache
  static clear(): void {
    globalCache.clear()
    logger.info('Cache cleared')
  }

  // Get statistics
  static getStats(): CacheStats {
    return globalCache.getStats()
  }

  // Get or set pattern (common caching pattern)
  static async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttlSeconds: number = 1800
  ): Promise<T> {
    let value = Cache.get<T>(key)
    
    if (value === null) {
      value = await factory()
      Cache.set(key, value, ttlSeconds)
    }
    
    return value
  }
}

// Cache key generators for different data types
export class CacheKeys {
  // User-related cache keys
  static userProfile(userId: string): string {
    return `user:profile:${userId}`
  }

  static userNutritionTargets(userId: string): string {
    return `user:nutrition:${userId}`
  }

  static userMealSummary(userId: string, date: string): string {
    return `user:meals:${userId}:${date}`
  }

  // Food-related cache keys
  static foodSearch(query: string, category?: string): string {
    const categoryPart = category ? `:${category}` : ''
    return `foods:search:${query}${categoryPart}`
  }

  static foodDetails(foodId: string): string {
    return `food:${foodId}`
  }

  static mediterraneanFoods(): string {
    return 'foods:mediterranean'
  }

  // Recipe-related cache keys
  static recipeDetails(recipeId: string): string {
    return `recipe:${recipeId}`
  }

  static recipeNutrition(recipeId: string): string {
    return `recipe:nutrition:${recipeId}`
  }

  static userRecipes(userId: string): string {
    return `user:recipes:${userId}`
  }

  // Meal plan cache keys
  static mealPlanRecommendations(mealType: string, targetCalories: number): string {
    return `meal:recommendations:${mealType}:${targetCalories}`
  }

  static weeklyMealPlan(userId: string, startDate: string): string {
    return `user:mealplan:${userId}:${startDate}`
  }

  // Analytics cache keys
  static dashboardStats(userId: string): string {
    return `dashboard:stats:${userId}`
  }

  static nutritionTrend(userId: string, period: string): string {
    return `nutrition:trend:${userId}:${period}`
  }

  // Shopping list cache keys
  static shoppingListFromMealPlan(mealPlanId: string): string {
    return `shopping:mealplan:${mealPlanId}`
  }

  static shoppingListFromRecipes(recipeIds: string[]): string {
    return `shopping:recipes:${recipeIds.sort().join(',')}`
  }
}

// Caching decorators/wrappers for service methods
export function withCache<T extends any[], R>(
  keyGenerator: (...args: T) => string,
  ttlSeconds: number = 1800
) {
  return function decorator(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: T): Promise<R> {
      const cacheKey = keyGenerator(...args)
      
      let result = Cache.get<R>(cacheKey)
      if (result !== null) {
        return result
      }

      result = await method.apply(this, args)
      Cache.set(cacheKey, result, ttlSeconds)
      
      return result
    }

    return descriptor
  }
}

// Cache warming functions
export class CacheWarmer {
  // Warm up Mediterranean foods cache
  static async warmMediterraneanFoods() {
    try {
      const { MealPlanningService } = await import('./meal-planning-service')
      const service = new MealPlanningService()
      const foods = await service.getMediterraneanFoods(200)
      Cache.setLong(CacheKeys.mediterraneanFoods(), foods)
      logger.info('Cache warmed: Mediterranean foods')
    } catch (error) {
      logger.error('Error warming Mediterranean foods cache', error)
    }
  }

  // Warm up user data cache
  static async warmUserData(userId: string) {
    try {
      // Import services dynamically to avoid circular dependencies
      const { prisma } = await import('./prisma')
      
      // Warm profile cache
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        include: { user: { select: { name: true, email: true } } }
      })
      
      if (profile) {
        Cache.setMedium(CacheKeys.userProfile(userId), profile)
        Cache.setMedium(CacheKeys.userNutritionTargets(userId), {
          calories: profile.targetCalories,
          protein: profile.targetProtein,
          carbs: profile.targetCarbs,
          fat: profile.targetFat,
        })
      }

      logger.info('Cache warmed: user data', { userId })
    } catch (error) {
      logger.error('Error warming user data cache', error, { userId })
    }
  }
}

// Auto-cleanup on process exit
process.on('SIGINT', () => {
  globalCache.destroy()
})

process.on('SIGTERM', () => {
  globalCache.destroy()
})

export { globalCache as cache }