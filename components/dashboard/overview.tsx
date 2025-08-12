"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Target, 
  Flame, 
  TrendingUp, 
  Activity,
  Calendar,
  Droplets,
  Zap,
  Heart
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

const StatCard = ({ 
  title, 
  icon: Icon, 
  value, 
  target, 
  unit, 
  color, 
  progress, 
  trend 
}: {
  title: string
  icon: any
  value: number
  target?: number
  unit: string
  color: string
  progress?: number
  trend?: 'up' | 'down' | 'stable'
}) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-gray-900">
            {value}
          </div>
          <span className={`text-sm ${color.replace('bg-', 'text-')} font-medium opacity-80`}>
            {unit}
          </span>
          {trend && (
            <div className={`flex items-center ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'transform rotate-180' : ''}`} />
            </div>
          )}
        </div>
        
        {target && (
          <>
            <p className="text-xs text-muted-foreground mb-2 mt-1">
              de {target} {unit}
            </p>
            <div className="relative">
              <Progress value={progress} className="h-2 bg-gray-100" />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-700 ease-out ${color}`}
                style={{ width: `${Math.min(progress || 0, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {Math.round(progress || 0)}% completado
            </p>
          </>
        )}
        
        {!target && (
          <p className="text-xs text-muted-foreground mt-1">
            {title === 'Racha' ? 'días consecutivos' : 'actual'}
          </p>
        )}
      </CardContent>
    </Card>
  )
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
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-2 w-full" />
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
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Calorías"
          icon={Flame}
          value={currentStats.consumedCalories}
          target={currentStats.targetCalories}
          unit="kcal"
          color="bg-orange-500"
          progress={calorieProgress}
          trend={calorieProgress > 90 ? 'up' : calorieProgress < 70 ? 'down' : 'stable'}
        />

        <StatCard
          title="Proteínas"
          icon={Target}
          value={currentStats.consumedProtein}
          target={currentStats.targetProtein}
          unit="g"
          color="bg-red-500"
          progress={proteinProgress}
          trend={proteinProgress > 80 ? 'up' : 'stable'}
        />

        <StatCard
          title="Carbohidratos"
          icon={Zap}
          value={currentStats.consumedCarbs}
          target={currentStats.targetCarbs}
          unit="g"
          color="bg-blue-500"
          progress={carbProgress}
          trend={carbProgress > 85 ? 'up' : 'stable'}
        />

        <StatCard
          title="Racha"
          icon={Calendar}
          value={currentStats.streakDays}
          unit="días"
          color="bg-green-500"
          trend={currentStats.streakDays > 5 ? 'up' : 'stable'}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Heart className="h-4 w-4 mr-2 text-purple-500" />
              Grasas Saludables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{currentStats.consumedFat}g</span>
              <span className="text-sm text-purple-600 font-medium">/ {currentStats.targetFat}g</span>
            </div>
            <Progress value={fatProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(fatProgress)}% del objetivo diario
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Droplets className="h-4 w-4 mr-2 text-blue-500" />
              Hidratación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">6</span>
              <span className="text-sm text-blue-600 font-medium">/ 8 vasos</span>
            </div>
            <Progress value={75} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              75% de hidratación diaria
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-indigo-500" />
              Peso Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{currentStats.currentWeight}</span>
              <span className="text-sm text-indigo-600 font-medium">kg</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Objetivo: {currentStats.goalWeight}kg
            </p>
            <div className="flex items-center mt-1">
              {currentStats.currentWeight > currentStats.goalWeight ? (
                <span className="text-xs text-orange-600">
                  -{(currentStats.currentWeight - currentStats.goalWeight).toFixed(1)}kg para objetivo
                </span>
              ) : (
                <span className="text-xs text-green-600">
                  ¡Objetivo alcanzado!
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}