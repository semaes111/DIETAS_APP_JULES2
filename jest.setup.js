// Jest setup file
require('dotenv').config({ path: '.env.test' })

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Global test utilities
global.testUtils = {
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  mockAdminUser: {
    id: 'test-admin-id',
    email: 'admin@example.com',
    name: 'Admin User',
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  mockFood: {
    id: 'test-food-id',
    name: 'Test Food',
    brand: 'Test Brand',
    category: 'vegetables',
    servingSize: 100,
    caloriesPer100g: 25,
    proteinPer100g: 2.8,
    carbsPer100g: 4.6,
    fatPer100g: 0.3,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  mockUserProfile: {
    id: 'test-profile-id',
    userId: 'test-user-id',
    age: 30,
    gender: 'MALE',
    height: 175,
    weight: 70,
    activityLevel: 'MODERATELY_ACTIVE',
    goal: 'MAINTAIN',
    bmr: 1650,
    tdee: 2200,
    targetCalories: 2200,
    targetProtein: 110,
    targetCarbs: 248,
    targetFat: 86,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Console suppression for cleaner test output
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})