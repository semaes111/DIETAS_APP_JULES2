/**
 * Production Database Seeding Script
 * This script seeds the production database with essential data
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedBasicFoods() {
  console.log('🌱 Seeding basic foods...')
  
  const basicFoods = [
    // Grains & Cereals
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
      name: 'Pan integral',
      category: 'Cereales y granos',
      servingSize: 30,
      caloriesPer100g: 247,
      proteinPer100g: 13.0,
      carbsPer100g: 41.0,
      fatPer100g: 4.2,
      fiberPer100g: 7.0,
      isVerified: true
    },
    {
      name: 'Avena en hojuelas',
      category: 'Cereales y granos',
      servingSize: 40,
      caloriesPer100g: 389,
      proteinPer100g: 16.9,
      carbsPer100g: 66.3,
      fatPer100g: 6.9,
      fiberPer100g: 10.6,
      isVerified: true
    },
    
    // Proteins
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
      name: 'Huevo entero',
      category: 'Huevos y derivados',
      servingSize: 50,
      caloriesPer100g: 155,
      proteinPer100g: 13.0,
      carbsPer100g: 1.1,
      fatPer100g: 11.0,
      fiberPer100g: 0.0,
      isVerified: true
    },
    {
      name: 'Salmón',
      category: 'Pescados y mariscos',
      servingSize: 100,
      caloriesPer100g: 208,
      proteinPer100g: 25.4,
      carbsPer100g: 0.0,
      fatPer100g: 12.4,
      fiberPer100g: 0.0,
      isVerified: true
    },
    
    // Vegetables
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
      name: 'Espinacas',
      category: 'Verduras y hortalizas',
      servingSize: 100,
      caloriesPer100g: 23,
      proteinPer100g: 2.9,
      carbsPer100g: 3.6,
      fatPer100g: 0.4,
      fiberPer100g: 2.2,
      isVerified: true
    },
    {
      name: 'Tomate',
      category: 'Verduras y hortalizas',
      servingSize: 100,
      caloriesPer100g: 18,
      proteinPer100g: 0.9,
      carbsPer100g: 3.9,
      fatPer100g: 0.2,
      fiberPer100g: 1.2,
      isVerified: true
    },
    
    // Fruits
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
    },
    {
      name: 'Manzana',
      category: 'Frutas',
      servingSize: 180,
      caloriesPer100g: 52,
      proteinPer100g: 0.3,
      carbsPer100g: 14.0,
      fatPer100g: 0.2,
      fiberPer100g: 2.4,
      sugarPer100g: 10.4,
      isVerified: true
    }
  ]

  for (const food of basicFoods) {
    await prisma.food.upsert({
      where: { name: food.name },
      update: food,
      create: food,
    })
  }

  console.log(`✅ Seeded ${basicFoods.length} basic foods`)
}

async function seedAdminUser() {
  console.log('👤 Creating admin user...')
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nutrimed.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      isAdmin: true,
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: 'Administrator',
      password: hashedPassword,
      isAdmin: true,
    },
  })

  console.log(`✅ Admin user created: ${adminUser.email}`)
  
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`⚠️  Default admin password: ${adminPassword}`)
    console.log('⚠️  Please change the admin password after first login!')
  }
}

async function main() {
  console.log('🚀 Starting production database seeding...')
  
  try {
    await seedBasicFoods()
    await seedAdminUser()
    
    console.log('🎉 Production seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding production database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })