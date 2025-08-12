import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
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

    // Get today's meals
    const today = new Date().toISOString().split('T')[0]
    const { data: todayMeals } = await supabase
      .from('user_meals')
      .select(`
        *,
        foods (*)
      `)
      .eq('user_id', userId)
      .eq('date', today)

    // Calculate consumed values
    const consumed = todayMeals?.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 }) || { calories: 0, protein: 0, carbs: 0, fat: 0 }

    // Get current weight from latest progress log
    const { data: latestProgress } = await supabase
      .from('progress_logs')
      .select('weight')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    // Calculate streak (simplified - count consecutive days with meals)
    const { data: mealDays } = await supabase
      .from('user_meals')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)

    let streakDays = 0
    if (mealDays && mealDays.length > 0) {
      const uniqueDays = [...new Set(mealDays.map(m => m.date))]
      let currentDate = new Date()
      
      for (const dayStr of uniqueDays) {
        const dayDate = new Date(dayStr)
        const diffTime = Math.abs(currentDate.getTime() - dayDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays <= streakDays + 1) {
          streakDays++
          currentDate = dayDate
        } else {
          break
        }
      }
    }

    const stats = {
      targetCalories: profile?.target_calories || 2000,
      consumedCalories: Math.round(consumed.calories),
      targetProtein: profile?.target_protein || 150,
      consumedProtein: Math.round(consumed.protein),
      targetCarbs: profile?.target_carbs || 200,
      consumedCarbs: Math.round(consumed.carbs),
      targetFat: profile?.target_fat || 67,
      consumedFat: Math.round(consumed.fat),
      currentWeight: latestProgress?.weight || 75,
      goalWeight: profile?.goal === 'LOSE' ? 70 : profile?.goal === 'GAIN' ? 80 : 75,
      streakDays
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}