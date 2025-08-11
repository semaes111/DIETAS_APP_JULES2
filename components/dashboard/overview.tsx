"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  Flame, 
  TrendingUp, 
  Activity,
  Calendar
} from "lucide-react"

interface DashboardStats {
  targetCalories: number
  consumedCalories: number
  targetProtein: number
  consumedProtein: number
  targetCarbs: number
  consumedCarbs: number
  targetFat: number
  consumedFat: number
  currentWeight: number
  goalWeight: number
  streakDays: number
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-2 w-full bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Default stats for demo if no data loaded
  const defaultStats: DashboardStats = {
    targetCalories: 2000,
    consumedCalories: 1450,
    targetProtein: 150,
    consumedProtein: 89,
    targetCarbs: 200,
    consumedCarbs: 145,
    targetFat: 67,
    consumedFat: 45,
    currentWeight: 75,
    goalWeight: 70,
    streakDays: 7
  }
  
  const currentStats = stats || defaultStats

  const calorieProgress = (currentStats.consumedCalories / currentStats.targetCalories) * 100
  const proteinProgress = (currentStats.consumedProtein / currentStats.targetProtein) * 100
  const carbProgress = (currentStats.consumedCarbs / currentStats.targetCarbs) * 100
  const fatProgress = (currentStats.consumedFat / currentStats.targetFat) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Calories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calorías</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentStats.consumedCalories}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            de {currentStats.targetCalories} kcal
          </p>
          <Progress value={calorieProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(calorieProgress)}% completado
          </p>
        </CardContent>
      </Card>

      {/* Protein */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proteínas</CardTitle>
          <Target className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentStats.consumedProtein}g
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            de {currentStats.targetProtein}g
          </p>
          <Progress value={proteinProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(proteinProgress)}% completado
          </p>
        </CardContent>
      </Card>

      {/* Carbs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carbohidratos</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentStats.consumedCarbs}g
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            de {currentStats.targetCarbs}g
          </p>
          <Progress value={carbProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(carbProgress)}% completado
          </p>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Racha</CardTitle>
          <Calendar className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentStats.streakDays}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            días consecutivos
          </p>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            ¡Sigue así!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}