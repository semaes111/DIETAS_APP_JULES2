import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const mediterraneanFoods = [
  {
    name: "Aceite de oliva virgen extra",
    category: "Grasas saludables",
    serving_size: 15,
    calories_per_100g: 884,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 100,
    fiber_per_100g: 0,
    is_verified: true
  },
  {
    name: "Salmón fresco",
    category: "Pescados",
    serving_size: 150,
    calories_per_100g: 208,
    protein_per_100g: 25.4,
    carbs_per_100g: 0,
    fat_per_100g: 12.4,
    fiber_per_100g: 0,
    is_verified: true
  },
  {
    name: "Quinoa cocida",
    category: "Cereales",
    serving_size: 100,
    calories_per_100g: 120,
    protein_per_100g: 4.4,
    carbs_per_100g: 21.3,
    fat_per_100g: 1.9,
    fiber_per_100g: 2.8,
    is_verified: true
  },
  {
    name: "Aguacate",
    category: "Frutas",
    serving_size: 100,
    calories_per_100g: 160,
    protein_per_100g: 2,
    carbs_per_100g: 8.5,
    fat_per_100g: 14.7,
    fiber_per_100g: 6.7,
    is_verified: true
  },
  {
    name: "Almendras",
    category: "Frutos secos",
    serving_size: 30,
    calories_per_100g: 579,
    protein_per_100g: 21.2,
    carbs_per_100g: 21.6,
    fat_per_100g: 49.9,
    fiber_per_100g: 12.5,
    is_verified: true
  },
  {
    name: "Yogur griego natural",
    category: "Lácteos",
    serving_size: 150,
    calories_per_100g: 59,
    protein_per_100g: 10,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    fiber_per_100g: 0,
    is_verified: true
  },
  {
    name: "Tomate cherry",
    category: "Verduras",
    serving_size: 100,
    calories_per_100g: 18,
    protein_per_100g: 0.9,
    carbs_per_100g: 3.9,
    fat_per_100g: 0.2,
    fiber_per_100g: 1.2,
    is_verified: true
  },
  {
    name: "Espinacas frescas",
    category: "Verduras",
    serving_size: 100,
    calories_per_100g: 23,
    protein_per_100g: 2.9,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    fiber_per_100g: 2.2,
    is_verified: true
  },
  {
    name: "Pechuga de pollo",
    category: "Carnes",
    serving_size: 150,
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0,
    is_verified: true
  },
  {
    name: "Lentejas cocidas",
    category: "Legumbres",
    serving_size: 150,
    calories_per_100g: 116,
    protein_per_100g: 9,
    carbs_per_100g: 20,
    fat_per_100g: 0.4,
    fiber_per_100g: 7.9,
    is_verified: true
  },
  {
    name: "Pan integral",
    category: "Cereales",
    serving_size: 50,
    calories_per_100g: 247,
    protein_per_100g: 13,
    carbs_per_100g: 41,
    fat_per_100g: 4.2,
    fiber_per_100g: 7,
    is_verified: true
  },
  {
    name: "Queso feta",
    category: "Lácteos",
    serving_size: 50,
    calories_per_100g: 264,
    protein_per_100g: 14,
    carbs_per_100g: 4.1,
    fat_per_100g: 21,
    fiber_per_100g: 0,
    is_verified: true
  },
  {
    name: "Sardinas en aceite",
    category: "Pescados",
    serving_size: 100,
    calories_per_100g: 208,
    protein_per_100g: 25,
    carbs_per_100g: 0,
    fat_per_100g: 11,
    fiber_per_100g: 0,
    is_verified: true
  },
  {
    name: "Brócoli",
    category: "Verduras",
    serving_size: 150,
    calories_per_100g: 34,
    protein_per_100g: 2.8,
    carbs_per_100g: 7,
    fat_per_100g: 0.4,
    fiber_per_100g: 2.6,
    is_verified: true
  },
  {
    name: "Naranja",
    category: "Frutas",
    serving_size: 150,
    calories_per_100g: 47,
    protein_per_100g: 0.9,
    carbs_per_100g: 12,
    fat_per_100g: 0.1,
    fiber_per_100g: 2.4,
    is_verified: true
  },
  {
    name: "Garbanzos cocidos",
    category: "Legumbres",
    serving_size: 150,
    calories_per_100g: 164,
    protein_per_100g: 8.9,
    carbs_per_100g: 27,
    fat_per_100g: 2.6,
    fiber_per_100g: 7.6,
    is_verified: true
  },
  {
    name: "Atún al natural",
    category: "Pescados",
    serving_size: 100,
    calories_per_100g: 116,
    protein_per_100g: 26,
    carbs_per_100g: 0,
    fat_per_100g: 1,
    fiber_per_100g: 0,
    is_verified: true
  },
  {
    name: "Nueces",
    category: "Frutos secos",
    serving_size: 30,
    calories_per_100g: 654,
    protein_per_100g: 15,
    carbs_per_100g: 14,
    fat_per_100g: 65,
    fiber_per_100g: 6.7,
    is_verified: true
  },
  {
    name: "Mozzarella",
    category: "Lácteos",
    serving_size: 50,
    calories_per_100g: 300,
    protein_per_100g: 22,
    carbs_per_100g: 2.2,
    fat_per_100g: 22,
    fiber_per_100g: 0,
    is_verified: true
  },
  {
    name: "Berenjenas",
    category: "Verduras",
    serving_size: 150,
    calories_per_100g: 25,
    protein_per_100g: 1,
    carbs_per_100g: 6,
    fat_per_100g: 0.2,
    fiber_per_100g: 3,
    is_verified: true
  }
]

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Insert foods
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .insert(mediterraneanFoods)
      .select()

    if (foodsError) {
      console.error('Error inserting foods:', foodsError)
      return NextResponse.json({ error: 'Error al insertar alimentos' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Datos iniciales creados exitosamente',
      foods: foods?.length || 0
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint para crear datos iniciales. Usar POST para ejecutar.' 
  })
}