import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let foodsQuery = supabase
      .from('foods')
      .select('*')
      .eq('is_verified', true)
      .order('name', { ascending: true })
      .limit(20)

    if (query.trim()) {
      foodsQuery = foodsQuery.ilike('name', `%${query}%`)
    }

    const { data: foods, error } = await foodsQuery

    if (error) {
      console.error('Error fetching foods:', error)
      return NextResponse.json({ error: 'Error al buscar alimentos' }, { status: 500 })
    }

    return NextResponse.json(foods || [])
  } catch (error) {
    console.error('Error in food search:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      category, 
      serving_size, 
      calories_per_100g, 
      protein_per_100g, 
      carbs_per_100g, 
      fat_per_100g,
      fiber_per_100g = null,
      sugar_per_100g = null,
      sodium_per_100g = null
    } = body

    const { data, error } = await supabase
      .from('foods')
      .insert([{
        name,
        category,
        serving_size,
        calories_per_100g,
        protein_per_100g,
        carbs_per_100g,
        fat_per_100g,
        fiber_per_100g,
        sugar_per_100g,
        sodium_per_100g,
        is_verified: false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating food:', error)
      return NextResponse.json({ error: 'Error al crear alimento' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in food creation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}