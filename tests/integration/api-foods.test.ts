// Integration tests for Foods API endpoints
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/foods/route'

// Mock Prisma
const mockPrisma = {
  food: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  }
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

// Mock authentication
jest.mock('@/lib/auth-utils', () => ({
  requireUser: jest.fn().mockResolvedValue(global.testUtils.mockUser),
  getUserFromRequest: jest.fn().mockResolvedValue(global.testUtils.mockUser),
}))

// Mock RBAC
jest.mock('@/lib/rbac', () => ({
  requirePermission: jest.fn(() => jest.fn()),
  Permission: {
    CREATE_FOODS: 'CREATE_FOODS',
  }
}))

// Mock rate limiting
jest.mock('@/lib/rate-limit', () => ({
  generalRateLimit: jest.fn(),
}))

describe('Foods API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/foods', () => {
    it('should return paginated foods list', async () => {
      const mockFoods = [
        { ...global.testUtils.mockFood, id: '1', name: 'Apple' },
        { ...global.testUtils.mockFood, id: '2', name: 'Banana' },
      ]

      mockPrisma.food.findMany.mockResolvedValue(mockFoods)
      mockPrisma.food.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/foods?limit=10&offset=0')
      const response = await GET(request, {})

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.foods).toHaveLength(2)
      expect(data.data.pagination.total).toBe(2)
      expect(data.data.pagination.limit).toBe(10)
      expect(data.data.pagination.hasMore).toBe(false)
    })

    it('should handle search parameters', async () => {
      const mockFoods = [
        { ...global.testUtils.mockFood, name: 'Apple Juice' },
      ]

      mockPrisma.food.findMany.mockResolvedValue(mockFoods)
      mockPrisma.food.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/foods?search=apple&category=fruits')
      const response = await GET(request, {})

      expect(mockPrisma.food.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'apple', mode: 'insensitive' } },
            { description: { contains: 'apple', mode: 'insensitive' } },
          ],
          category: { contains: 'fruits', mode: 'insensitive' }
        },
        take: 50,
        skip: 0,
        orderBy: [
          { isVerified: 'desc' },
          { name: 'asc' }
        ]
      })

      expect(response.status).toBe(200)
    })

    it('should handle empty results', async () => {
      mockPrisma.food.findMany.mockResolvedValue([])
      mockPrisma.food.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/foods?search=nonexistent')
      const response = await GET(request, {})

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.data.foods).toHaveLength(0)
      expect(data.data.pagination.total).toBe(0)
    })
  })

  describe('POST /api/foods', () => {
    it('should create a new food successfully', async () => {
      const newFood = {
        name: 'New Food',
        category: 'vegetables',
        servingSize: 100,
        caloriesPer100g: 25,
        proteinPer100g: 2.8,
        carbsPer100g: 4.6,
        fatPer100g: 0.3,
      }

      const createdFood = { ...newFood, id: 'new-food-id', isVerified: false }
      mockPrisma.food.findUnique.mockResolvedValue(null) // No duplicate barcode
      mockPrisma.food.create.mockResolvedValue(createdFood)

      const request = new NextRequest('http://localhost:3000/api/foods', {
        method: 'POST',
        body: JSON.stringify(newFood),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request, {})

      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.food.name).toBe(newFood.name)
      expect(data.data.food.isVerified).toBe(false)
      expect(data.message).toBe('Food created successfully')
    })

    it('should reject duplicate barcode', async () => {
      const newFood = {
        name: 'New Food',
        category: 'vegetables',
        barcode: '1234567890',
        servingSize: 100,
        caloriesPer100g: 25,
        proteinPer100g: 2.8,
        carbsPer100g: 4.6,
        fatPer100g: 0.3,
      }

      // Mock existing food with same barcode
      mockPrisma.food.findUnique.mockResolvedValue({
        id: 'existing-id',
        barcode: '1234567890',
        name: 'Existing Food'
      })

      const request = new NextRequest('http://localhost:3000/api/foods', {
        method: 'POST',
        body: JSON.stringify(newFood),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request, {})

      expect(response.status).toBe(409)
      
      const data = await response.json()
      expect(data.error).toBe('Duplicate barcode')
      expect(data.existingFood).toBeDefined()
    })

    it('should validate required fields', async () => {
      const incompleteFood = {
        name: 'Incomplete Food',
        // Missing required fields
      }

      const request = new NextRequest('http://localhost:3000/api/foods', {
        method: 'POST',
        body: JSON.stringify(incompleteFood),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request, {})

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Validation Error')
      expect(data.details).toBeDefined()
    })

    it('should reject invalid nutrition values', async () => {
      const invalidFood = {
        name: 'Invalid Food',
        category: 'test',
        servingSize: 100,
        caloriesPer100g: -10, // Invalid negative value
        proteinPer100g: 2.8,
        carbsPer100g: 4.6,
        fatPer100g: 0.3,
      }

      const request = new NextRequest('http://localhost:3000/api/foods', {
        method: 'POST',
        body: JSON.stringify(invalidFood),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request, {})

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Validation Error')
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockPrisma.food.findMany.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/foods')
      const response = await GET(request, {})

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Internal Server Error')
    })

    it('should handle malformed JSON in POST requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/foods', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request, {})

      expect(response.status).toBe(400)
    })
  })

  describe('Security', () => {
    it('should require authentication for GET requests', async () => {
      const { requireUser } = await import('@/lib/auth-utils')
      ;(requireUser as jest.Mock).mockRejectedValue(new Error('Authentication required'))

      const request = new NextRequest('http://localhost:3000/api/foods')
      const response = await GET(request, {})

      expect(response.status).toBe(401)
    })

    it('should check permissions for POST requests', async () => {
      const { requirePermission } = await import('@/lib/rbac')
      const mockPermissionCheck = jest.fn().mockImplementation(() => {
        throw new Error('Permission denied')
      })
      ;(requirePermission as jest.Mock).mockReturnValue(mockPermissionCheck)

      const request = new NextRequest('http://localhost:3000/api/foods', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request, {})

      expect(response.status).toBe(403)
    })
  })
})