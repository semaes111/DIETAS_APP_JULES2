# DIETAS_APP_JULES2 - API Documentation

## Overview

The DIETAS_APP_JULES2 is a comprehensive Mediterranean diet application backend built with Next.js 14, providing powerful nutrition tracking, meal planning, and health monitoring capabilities.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

The API uses NextAuth.js with JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes  
- **Admin endpoints**: 10 requests per hour

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {}, 
  "message": "Optional message",
  "error": "Error details (if success: false)",
  "code": "ERROR_CODE (if success: false)"
}
```

## Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Authentication required
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `CONFLICT_ERROR`: Resource conflict
- `RATE_LIMIT_ERROR`: Rate limit exceeded
- `INTERNAL_ERROR`: Server error

---

# Endpoints

## Authentication

### POST `/auth/register`
Register a new user account.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### POST `/auth/signin`
Sign in to existing account.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

## User Profile

### GET `/profile`
Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile-id",
      "userId": "user-id",
      "age": 30,
      "gender": "MALE",
      "height": 175,
      "weight": 70,
      "activityLevel": "MODERATELY_ACTIVE",
      "goal": "MAINTAIN",
      "targetCalories": 2200,
      "targetProtein": 110,
      "targetCarbs": 248,
      "targetFat": 86
    }
  }
}
```

### POST `/profile`
Create or update user profile.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "age": 30,
  "gender": "MALE",
  "height": 175,
  "weight": 70,
  "activityLevel": "MODERATELY_ACTIVE",
  "goal": "MAINTAIN",
  "bmr": 1650,
  "tdee": 2200,
  "targetCalories": 2200,
  "targetProtein": 110,
  "targetCarbs": 248,
  "targetFat": 86
}
```

## Foods

### GET `/foods`
Search and list foods with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `search` (string, optional): Search term
- `category` (string, optional): Food category
- `limit` (number, optional): Items per page (1-100, default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "id": "food-id",
        "name": "Spinach",
        "brand": "Fresh Farms",
        "category": "vegetables",
        "servingSize": 100,
        "caloriesPer100g": 23,
        "proteinPer100g": 2.9,
        "carbsPer100g": 3.6,
        "fatPer100g": 0.4,
        "fiberPer100g": 2.2,
        "isVerified": true
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### POST `/foods`
Create a new food entry.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `CREATE_FOODS`

**Body:**
```json
{
  "name": "Spinach",
  "brand": "Fresh Farms",
  "category": "vegetables", 
  "servingSize": 100,
  "caloriesPer100g": 23,
  "proteinPer100g": 2.9,
  "carbsPer100g": 3.6,
  "fatPer100g": 0.4,
  "fiberPer100g": 2.2,
  "sodiumPer100g": 79
}
```

## Nutrition

### GET `/nutrition/daily`
Get daily nutrition summary for a specific date.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `date` (string, required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "totalNutrition": {
      "calories": 1850,
      "protein": 95.5,
      "carbs": 210.2,
      "fat": 78.1
    },
    "mealSummaries": {
      "BREAKFAST": {
        "calories": 450,
        "protein": 20.1,
        "carbs": 55.3,
        "fat": 18.2
      }
    },
    "mealCount": 12
  }
}
```

### GET `/nutrition/weekly`
Get weekly nutrition trend.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (string, required): Start date in YYYY-MM-DD format
- `endDate` (string, required): End date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "trend": [
      {
        "date": "2024-01-15",
        "nutrition": {
          "calories": 1850,
          "protein": 95.5,
          "carbs": 210.2,
          "fat": 78.1
        }
      }
    ],
    "period": {
      "startDate": "2024-01-15", 
      "endDate": "2024-01-21"
    }
  }
}
```

## Meal Planning

### POST `/meal-plans/generate`
Generate a weekly meal plan.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "startDate": "2024-01-15",
  "name": "Weekly Plan - Jan 15",
  "save": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "weeklyPlan": {
      "startDate": "2024-01-15",
      "endDate": "2024-01-21", 
      "days": [
        {
          "date": "2024-01-15",
          "meals": [
            {
              "type": "BREAKFAST",
              "items": [
                {
                  "foodId": "food-id",
                  "quantity": 150,
                  "nutrition": {
                    "calories": 200,
                    "protein": 8.5,
                    "carbs": 25.2,
                    "fat": 6.1
                  }
                }
              ],
              "totalNutrition": {
                "calories": 450,
                "protein": 20.1,
                "carbs": 55.3,
                "fat": 18.2
              }
            }
          ],
          "totalNutrition": {
            "calories": 2100,
            "protein": 105.5,
            "carbs": 240.2,
            "fat": 85.1
          },
          "adherenceScore": 95
        }
      ],
      "averageNutrition": {
        "calories": 2050,
        "protein": 103.2,
        "carbs": 235.1,
        "fat": 82.5
      },
      "averageAdherenceScore": 93
    },
    "savedMealPlan": {
      "id": "meal-plan-id",
      "name": "Weekly Plan - Jan 15"
    }
  }
}
```

### GET `/meal-plans/recommendations`
Get meal recommendations for a specific meal type.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `mealType` (string, required): BREAKFAST, LUNCH, DINNER, or SNACK
- `excludeFoodIds` (string, optional): Comma-separated food IDs to exclude
- `limit` (number, optional): Max recommendations (1-50, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "food": {
          "id": "food-id",
          "name": "Greek Yogurt",
          "category": "dairy"
        },
        "score": 85,
        "reasons": [
          "High protein",
          "Perfect breakfast protein",
          "Mediterranean staple"
        ]
      }
    ],
    "mealType": "BREAKFAST",
    "targets": {
      "calories": 550,
      "protein": 27.5,
      "carbs": 62.0,
      "fat": 21.5
    },
    "totalFound": 45
  }
}
```

## Shopping Lists

### POST `/shopping-lists/generate`
Generate shopping list from meal plan or recipes.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "type": "mealPlan",
  "mealPlanId": "meal-plan-id",
  "name": "Weekly Shopping List",
  "save": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shoppingList": {
      "Fresh Produce": [
        {
          "name": "Spinach",
          "category": "Fresh Produce",
          "quantity": 500,
          "unit": "g",
          "notes": "For breakfast on Monday"
        }
      ],
      "Dairy & Eggs": [
        {
          "name": "Greek Yogurt", 
          "category": "Dairy & Eggs",
          "quantity": 1,
          "unit": "kg"
        }
      ]
    },
    "saved": {
      "id": "shopping-list-id",
      "name": "Weekly Shopping List"
    }
  }
}
```

### GET `/shopping-lists`
Get user shopping lists or suggestions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (string, optional): user, mediterranean, or recurring (default: user)
- `limit` (number, optional): Items per page (default: 20)
- `days` (number, optional): Days for recurring list (default: 7)

## Admin Endpoints

### POST `/admin/import/foods-csv`
Import foods from CSV data.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `IMPORT_DATA`

**Body:**
```json
{
  "csvData": "name,category,caloriesPer100g,proteinPer100g,carbsPer100g,fatPer100g\nSpinach,vegetables,23,2.9,3.6,0.4",
  "skipDuplicates": true,
  "validateOnly": false,
  "batchSize": 100
}
```

### GET `/admin/export/foods`
Export foods to CSV.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `EXPORT_DATA`

**Query Parameters:**
- `includeUnverified` (boolean, optional): Include unverified foods (default: true)
- `categories` (string, optional): Comma-separated categories
- `startDate` (string, optional): Start date filter
- `endDate` (string, optional): End date filter

### GET `/admin/system/stats`
Get detailed system statistics.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `VIEW_ANALYTICS`

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "users": {
      "total": 1250,
      "active24h": 45,
      "active7d": 230,
      "new7d": 12,
      "growthRate7d": 0.96
    },
    "content": {
      "foods": {
        "total": 5420,
        "verified": 4890,
        "verificationRate": 90
      },
      "recipes": {
        "total": 850,
        "public": 340,
        "publicRate": 40
      }
    },
    "activity": {
      "mealsLogged": {
        "last24h": 180,
        "last7d": 1260,
        "avgPerDay": 180
      }
    }
  }
}
```

## Monitoring

### GET `/health`
Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "cache": true,
    "memory": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET `/metrics`
System metrics for monitoring.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `VIEW_ANALYTICS`

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "system": {
      "uptime": 86400,
      "memory": {
        "rss": 120,
        "heapTotal": 80,
        "heapUsed": 65
      }
    },
    "database": {
      "totalUsers": 1250,
      "totalFoods": 5420
    },
    "cache": {
      "hits": 15420,
      "misses": 2340,
      "hitRate": 86.8,
      "size": 1250
    }
  }
}
```

## User Data Export

### GET `/users/export`
Export user's own data (GDPR compliance).

**Headers:** `Authorization: Bearer <token>`

Returns a JSON file containing all user data including profile, meals, recipes, meal plans, and progress logs.

---

# Rate Limits by Endpoint

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| Admin Operations | 10 requests | 1 hour |
| Data Export | 2 requests | 1 hour |
| File Upload | 20 requests | 1 hour |

# Error Response Examples

## Validation Error
```json
{
  "success": false,
  "error": "Validation Error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address",
      "code": "invalid_string"
    }
  ]
}
```

## Authentication Error
```json
{
  "success": false,
  "error": "Authentication Error", 
  "code": "AUTHENTICATION_ERROR",
  "message": "Authentication required"
}
```

## Rate Limit Error
```json
{
  "success": false,
  "error": "Rate Limit Error",
  "code": "RATE_LIMIT_ERROR", 
  "message": "Too many requests. Limit: 100 per 15 minutes"
}
```

# SDK Examples

## JavaScript/TypeScript

```typescript
const API_BASE = 'https://your-domain.com/api'

class DietasAPI {
  constructor(private token: string) {}

  async getFoods(params?: {
    search?: string
    category?: string
    limit?: number
    offset?: number
  }) {
    const url = new URL(`${API_BASE}/foods`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, value.toString())
        }
      })
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    return response.json()
  }

  async createFood(food: {
    name: string
    category: string
    caloriesPer100g: number
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
  }) {
    const response = await fetch(`${API_BASE}/foods`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(food),
    })

    return response.json()
  }
}
```

---

This API provides a comprehensive foundation for building nutrition tracking and meal planning applications with Mediterranean diet focus, featuring robust security, performance optimization, and production-ready monitoring capabilities.