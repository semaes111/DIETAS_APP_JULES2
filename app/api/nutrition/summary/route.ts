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

    // Get user profile for targets
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Get today's nutrition data
    const today = new Date().toISOString().split('T')[0]
    const { data: todayMeals } = await supabase
      .from('user_meals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)

    // Calculate macros for today
    const macroData = todayMeals?.reduce((acc, meal) => ({
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      calories: acc.calories + meal.calories
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 }) || { protein: 0, carbs: 0, fat: 0, calories: 0 }

    // Get weekly data (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data: weeklyMeals } = await supabase
      .from('user_meals')
      .select('date, calories')
      .eq('user_id', userId)
      .gte('date', weekAgo)
      .order('date', { ascending: true })

    // Group by day and calculate daily totals
    const dailyTotals = weeklyMeals?.reduce((acc, meal) => {
      const date = meal.date
      if (!acc[date]) acc[date] = 0
      acc[date] += meal.calories
      return acc
    }, {} as Record<string, number>) || {}

    // Create weekly data array
    const weeklyData = []
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = days[date.getDay()]
      
      weeklyData.push({
        day: dayName,
        calories: Math.round(dailyTotals[dateStr] || 0),
        target: profile?.target_calories || 2000
      })
    }

    const response = {
      macroData: [
        { 
          name: "Proteínas", 
          value: Math.round(macroData.protein), 
          target: profile?.target_protein || 150, 
          color: "#ef4444" 
        },
        { 
          name: "Carbohidratos", 
          value: Math.round(macroData.carbs), 
          target: profile?.target_carbs || 200, 
          color: "#3b82f6" 
        },
        { 
          name: "Grasas", 
          value: Math.round(macroData.fat), 
          target: profile?.target_fat || 67, 
          color: "#eab308" 
        },
      ],
      pieChartData: [
        { name: "Proteínas", value: Math.round(macroData.protein), color: "#ef4444" },
        { name: "Carbohidratos", value: Math.round(macroData.carbs), color: "#3b82f6" },
        { name: "Grasas", value: Math.round(macroData.fat), color: "#eab308" },
      ],
      weeklyData,
      totalCalories: Math.round(macroData.calories)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching nutrition summary:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}