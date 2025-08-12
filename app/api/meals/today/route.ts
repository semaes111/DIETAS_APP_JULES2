import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const today = new Date().toISOString().split('T')[0]

    const { data: meals, error } = await supabase
      .from('user_meals')
      .select(`
        *,
        foods (
          id,
          name,
          category
        )
      `)
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching meals:', error)
      return NextResponse.json({ error: 'Error al obtener las comidas' }, { status: 500 })
    }

    // Group meals by type
    const groupedMeals = meals?.reduce((acc, meal) => {
      const type = meal.meal_type
      if (!acc[type]) {
        acc[type] = {
          id: type,
          type,
          name: getMealName(type),
          time: getMealTime(type),
          calories: 0,
          foods: [],
          completed: false
        }
      }
      
      acc[type].calories += meal.calories
      acc[type].foods.push(meal.foods?.name || 'Alimento desconocido')
      acc[type].completed = true
      
      return acc
    }, {} as Record<string, any>) || {}

    // Add missing meal types with default data
    const allMealTypes = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER']
    const todaysMeals = allMealTypes.map(type => {
      if (groupedMeals[type]) {
        return {
          ...groupedMeals[type],
          calories: Math.round(groupedMeals[type].calories),
          foods: [...new Set(groupedMeals[type].foods)] // Remove duplicates
        }
      } else {
        return {
          id: type,
          type,
          name: getMealName(type),
          time: getMealTime(type),
          calories: 0,
          foods: [],
          completed: false
        }
      }
    })

    return NextResponse.json(todaysMeals)
  } catch (error) {
    console.error('Error fetching today meals:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function getMealName(type: string): string {
  switch (type) {
    case 'BREAKFAST': return 'Desayuno'
    case 'LUNCH': return 'Almuerzo'
    case 'SNACK': return 'Merienda'
    case 'DINNER': return 'Cena'
    default: return 'Comida'
  }
}

function getMealTime(type: string): string {
  switch (type) {
    case 'BREAKFAST': return '08:30'
    case 'LUNCH': return '13:00'
    case 'SNACK': return '16:30'
    case 'DINNER': return '20:00'
    default: return '12:00'
  }
}