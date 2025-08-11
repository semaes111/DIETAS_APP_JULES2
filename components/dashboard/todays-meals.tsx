"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Coffee, 
  Sun, 
  Sunset, 
  Plus,
  Clock,
  Utensils
} from "lucide-react"

// Demo data - in a real app, this would come from the API
const todaysMeals = [
  {
    id: 1,
    type: "BREAKFAST",
    name: "Desayuno Mediterráneo",
    time: "08:30",
    calories: 380,
    foods: [
      "Tostada integral con aguacate",
      "Yogur griego con nueces",
      "Café con leche"
    ],
    completed: true
  },
  {
    id: 2,
    type: "LUNCH", 
    name: "Almuerzo Saludable",
    time: "13:00",
    calories: 520,
    foods: [
      "Ensalada de quinoa con verduras",
      "Salmón a la plancha",
      "Aceite de oliva virgen extra"
    ],
    completed: true
  },
  {
    id: 3,
    type: "SNACK",
    name: "Merienda",
    time: "16:30",
    calories: 150,
    foods: [
      "Puñado de almendras",
      "Fruta de temporada"
    ],
    completed: false
  },
  {
    id: 4,
    type: "DINNER",
    name: "Cena Ligera",
    time: "20:00",
    calories: 400,
    foods: [
      "Crema de verduras",
      "Pechuga de pollo al horno",
      "Ensalada mixta"
    ],
    completed: false
  }
]

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
    case "BREAKFAST":
      return "Desayuno"
    case "LUNCH":
      return "Almuerzo"
    case "SNACK":
      return "Merienda"
    case "DINNER":
      return "Cena"
    default:
      return "Comida"
  }
}

export function TodaysMeals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Comidas de Hoy
          <Button size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todaysMeals.map((meal) => (
            <div 
              key={meal.id} 
              className={`p-4 rounded-lg border transition-colors ${
                meal.completed 
                  ? "bg-green-50 border-green-200" 
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    meal.completed ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
                  }`}>
                    {getMealIcon(meal.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{getMealName(meal.type)}</h3>
                      {meal.completed && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Completado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{meal.time}</span>
                      <span>•</span>
                      <span>{meal.calories} kcal</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={meal.completed ? "outline" : "default"}
                  className="h-8"
                >
                  {meal.completed ? "Ver" : "Registrar"}
                </Button>
              </div>
              <div className="mt-3 ml-11">
                <ul className="text-sm text-muted-foreground space-y-1">
                  {meal.foods.map((food, index) => (
                    <li key={index}>• {food}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}