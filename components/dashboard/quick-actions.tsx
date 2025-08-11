"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Calendar, 
  ShoppingCart, 
  Target,
  TrendingUp,
  ChefHat,
  Camera,
  Scale
} from "lucide-react"

const quickActions = [
  {
    title: "Registrar Comida",
    description: "Agrega alimentos a tu registro diario",
    icon: Plus,
    href: "/dashboard/daily-log",
    color: "bg-green-100 text-green-600"
  },
  {
    title: "Ver Plan Semanal",
    description: "Revisa tu planificación de comidas",
    icon: Calendar,
    href: "/dashboard/meal-plan",
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Lista de Compras",
    description: "Genera tu lista de compras",
    icon: ShoppingCart,
    href: "/dashboard/shopping",
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "Explorar Recetas",
    description: "Descubre nuevas recetas saludables",
    icon: ChefHat,
    href: "/dashboard/recipes",
    color: "bg-orange-100 text-orange-600"
  }
]

const todaysGoals = [
  {
    title: "Agua",
    progress: 6,
    target: 8,
    unit: "vasos",
    color: "bg-blue-500"
  },
  {
    title: "Pasos",
    progress: 7500,
    target: 10000,
    unit: "pasos",
    color: "bg-green-500"
  },
  {
    title: "Sueño",
    progress: 7.5,
    target: 8,
    unit: "horas",
    color: "bg-purple-500"
  }
]

export function QuickActions() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-gray-50"
              >
                <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Today's Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Objetivos de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todaysGoals.map((goal) => {
            const percentage = (goal.progress / goal.target) * 100
            return (
              <div key={goal.title} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{goal.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {goal.progress} / {goal.target} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${goal.color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(percentage)}% completado
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Quick Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registro Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Camera className="h-4 w-4 mr-2" />
            Foto de Comida
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Scale className="h-4 w-4 mr-2" />
            Registrar Peso
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <TrendingUp className="h-4 w-4 mr-2" />
            Estado de Ánimo
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Promedio diario</span>
              <span className="font-medium">1,890 kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Días completados</span>
              <span className="font-medium">5/7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peso perdido</span>
              <span className="font-medium text-green-600">-0.3 kg</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              Ver Informe Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}