import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check if this is already initialized
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database already initialized',
          userCount: existingUsers 
        }, 
        { status: 400 }
      )
    }

    // Run migrations (this should be done during build, but just in case)
    console.log('Starting database initialization...')

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nutrimed.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrator',
        password: hashedPassword,
        isAdmin: true,
      },
    })

    // Seed basic foods
    const basicFoods = [
      {
        name: 'Arroz blanco cocido',
        category: 'Cereales y granos',
        servingSize: 100,
        caloriesPer100g: 130,
        proteinPer100g: 2.7,
        carbsPer100g: 28.0,
        fatPer100g: 0.3,
        fiberPer100g: 0.4,
        isVerified: true
      },
      {
        name: 'Pechuga de pollo cocida',
        category: 'Carnes y aves',
        servingSize: 100,
        caloriesPer100g: 165,
        proteinPer100g: 31.0,
        carbsPer100g: 0.0,
        fatPer100g: 3.6,
        fiberPer100g: 0.0,
        isVerified: true
      },
      {
        name: 'Brócoli',
        category: 'Verduras y hortalizas',
        servingSize: 100,
        caloriesPer100g: 34,
        proteinPer100g: 2.8,
        carbsPer100g: 7.0,
        fatPer100g: 0.4,
        fiberPer100g: 2.6,
        isVerified: true
      },
      {
        name: 'Plátano',
        category: 'Frutas',
        servingSize: 120,
        caloriesPer100g: 89,
        proteinPer100g: 1.1,
        carbsPer100g: 23.0,
        fatPer100g: 0.3,
        fiberPer100g: 2.6,
        sugarPer100g: 12.2,
        isVerified: true
      }
    ]

    await prisma.food.createMany({
      data: basicFoods,
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        adminEmail: adminUser.email,
        adminCreated: true,
        foodsSeeded: basicFoods.length,
        defaultPassword: !process.env.ADMIN_PASSWORD ? adminPassword : 'Custom password set'
      }
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to initialize database',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const foodCount = await prisma.food.count()
    const adminUsers = await prisma.user.count({ where: { isAdmin: true } })

    return NextResponse.json({
      success: true,
      status: {
        initialized: userCount > 0,
        userCount,
        foodCount,
        adminUsers,
        databaseProvider: process.env.DATABASE_PROVIDER || 'unknown',
        environment: process.env.NODE_ENV || 'unknown'
      }
    })

  } catch (error) {
    console.error('Database status check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check database status',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}