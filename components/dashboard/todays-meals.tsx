"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Coffee, 
  Sun, 
  Sunset, 
  Plus,
  Clock,
  Utensils,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from "lucide-react"

interface Meal {
  id: string
  type: string
  name: string
  time: string
  calories: number
  foods: string[]
  completed: boolean
}

const getMealIcon = (type: string) => {
  switch (type) {
    case "BREAKFAST":
      return <Coffee className="h-4 w-4" />
    case "LUNCH":
      return <Sun className="h-4 w-4" />
    case "SNACK":
      return <Utensils className="h-4 w-4" />
    case "DINNER":
      return <Sunset className="h-4 w-4" />
    default:
      return <Utensils className="h-4 w-4" />
  }
}

const getMealName = (type: string) => {
  switch (type) {
    case "BREAKFAST": return "Desayuno"
    case "LUNCH": return "Almuerzo"
    case "SNACK": return "Merienda"
    case "DINNER": return "Cena"
    default: return "Comida"
  }
}

const getMealColor = (type: string) => {
  switch (type) {
    case "BREAKFAST": return "bg-amber-500"
    case "LUNCH": return "bg-orange-500"
    case "SNACK": return "bg-purple-500"
    case "DINNER": return "bg-indigo-500"
    default: return "bg-gray-500"
  }
}

export function TodaysMeals() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTodaysMeals = async () => {
      try {
        const response = await fetch("/api/meals/today")
        if (response.ok) {
          const data = await response.json()
          setMeals(data)
        } else {
          setError("Error al cargar las comidas")
        }
      } catch (error) {
        console.error("Error fetching today's meals:", error)
        setError("Error de conexión")
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysMeals()
  }, [])

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
  const completedMeals = meals.filter(meal => meal.completed).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-16 translate-x-16" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-lg">
              <Utensils className="h-5 w-5 mr-2 text-blue-600" />
              Comidas de Hoy
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {completedMeals}/{meals.length} comidas • {totalCalories} kcal consumidas
            </p>
          </div>
          <Button size="sm" className="h-9 px-4 shadow-sm">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {meals.map((meal) => (
            <div 
              key={meal.id} 
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                meal.completed 
                  ? "bg-green-50 border-green-200 hover:border-green-300" 
                  : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              {/* Progress indicator */}
              <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all duration-300 ${
                meal.completed ? "bg-green-500" : "bg-gray-300"
              }`} />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Meal Icon */}
                  <div className={`relative p-3 rounded-full transition-all duration-300 ${
                    meal.completed 
                      ? "bg-green-100 text-green-600 border-2 border-green-200" 
                      : `${getMealColor(meal.type)} bg-opacity-10 ${getMealColor(meal.type).replace('bg-', 'text-')} border-2 border-gray-200`
                  }`}>
                    {getMealIcon(meal.type)}
                    {meal.completed && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle className="h-4 w-4 text-green-600 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  
                  {/* Meal Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{getMealName(meal.type)}</h3>
                      {meal.completed && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                          Completado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{meal.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{meal.calories} kcal</span>
                      </div>
                      {meal.foods.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>{meal.foods.length} alimento{meal.foods.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={meal.completed ? "outline" : "default"}
                    className={`h-8 px-3 transition-all duration-200 ${
                      meal.completed 
                        ? "hover:bg-green-50 hover:border-green-300" 
                        : "shadow-sm hover:shadow-md"
                    }`}
                  >
                    {meal.completed ? "Ver Detalles" : "Registrar"}
                  </Button>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
              
              {/* Food List */}
              {meal.foods.length > 0 && (
                <div className="mt-3 ml-16">
                  <div className="flex flex-wrap gap-2">
                    {meal.foods.slice(0, 3).map((food, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-600"
                      >
                        {food}
                      </span>
                    ))}
                    {meal.foods.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded-full text-gray-500">
                        +{meal.foods.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Empty state for non-completed meals */}
              {!meal.completed && meal.foods.length === 0 && (
                <div className="mt-3 ml-16">
                  <p className="text-xs text-gray-500 italic">
                    Aún no has registrado alimentos para esta comida
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary Card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Resumen del Día</h4>
              <p className="text-sm text-gray-600 mt-1">
                {completedMeals} de {meals.length} comidas completadas
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{totalCalories}</p>
              <p className="text-xs text-gray-600">kcal consumidas</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progreso de comidas</span>
              <span>{Math.round((completedMeals / meals.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedMeals / meals.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}