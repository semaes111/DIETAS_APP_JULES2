"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Calendar, 
  ShoppingCart, 
  Target,
  TrendingUp,
  ChefHat,
  Camera,
  Scale,
  Droplets,
  Activity,
  Clock,
  Zap,
  Star,
  Trophy,
  Heart
} from "lucide-react"

const quickActions = [
  {
    title: "Registrar Comida",
    description: "Agrega alimentos a tu registro diario",
    icon: Plus,
    href: "/dashboard/daily-log",
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200"
  },
  {
    title: "Plan de Comidas",
    description: "Revisa tu planificación semanal",
    icon: Calendar,
    href: "/dashboard/meal-plan",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200"
  },
  {
    title: "Lista de Compras",
    description: "Genera tu lista automática",
    icon: ShoppingCart,
    href: "/dashboard/shopping",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200"
  },
  {
    title: "Explorar Recetas",
    description: "Descubre recetas mediterráneas",
    icon: ChefHat,
    href: "/dashboard/recipes",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200"
  }
]

const todaysGoals = [
  {
    title: "Agua",
    progress: 6,
    target: 8,
    unit: "vasos",
    color: "bg-blue-500",
    icon: Droplets,
    percentage: 75
  },
  {
    title: "Pasos",
    progress: 7500,
    target: 10000,
    unit: "pasos",
    color: "bg-green-500",
    icon: Activity,
    percentage: 75
  },
  {
    title: "Sueño",
    progress: 7.5,
    target: 8,
    unit: "horas",
    color: "bg-purple-500",
    icon: Clock,
    percentage: 94
  }
]

const achievements = [
  {
    title: "Racha de 7 días",
    description: "¡Increíble constancia!",
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  {
    title: "Meta de proteínas",
    description: "Alcanzada 5 días seguidos",
    icon: Target,
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    title: "Mediterráneo Pro",
    description: "90% alimentos mediterráneos",
    icon: Heart,
    color: "text-green-600",
    bgColor: "bg-green-50"
  }
]

export function QuickActions() {
  return (
    <div className="space-y-6">
      {/* Enhanced Quick Actions */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -translate-y-12 translate-x-12" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-600" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className={cn(
                "group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer",
                action.bgColor,
                action.borderColor,
                "hover:scale-105"
              )}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} shadow-sm`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm ${action.textColor}`}>
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Enhanced Daily Goals */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-100 to-transparent rounded-full -translate-y-12 -translate-x-12" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Objetivos de Hoy
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              3 activos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {todaysGoals.map((goal) => {
            const Icon = goal.icon
            return (
              <div key={goal.title} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${goal.color} bg-opacity-10`}>
                      <Icon className={`h-4 w-4 ${goal.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="font-semibold text-sm text-gray-900">{goal.title}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {goal.progress} / {goal.target} {goal.unit}
                  </span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ease-out ${goal.color} shadow-sm`}
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    />
                  </div>
                  {goal.percentage >= 100 && (
                    <div className="absolute right-0 top-0 -translate-y-1 translate-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${
                    goal.percentage >= 100 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {Math.round(goal.percentage)}% completado
                  </span>
                  <span className="text-gray-500">
                    {goal.percentage >= 100 ? '¡Completado!' : `${goal.target - goal.progress} ${goal.unit} restantes`}
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Quick Log Actions */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100 to-transparent rounded-full -translate-y-10 translate-x-10" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Camera className="h-5 w-5 mr-2 text-purple-600" />
            Registro Rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 hover:bg-purple-50 hover:border-purple-300 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 mr-3">
              <Camera className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Foto de Comida</div>
              <div className="text-xs text-gray-500">Análisis automático con IA</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 hover:bg-blue-50 hover:border-blue-300 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 mr-3">
              <Scale className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Registrar Peso</div>
              <div className="text-xs text-gray-500">Actualiza tu progreso</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 hover:bg-green-50 hover:border-green-300 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 mr-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Estado de Ánimo</div>
              <div className="text-xs text-gray-500">¿Cómo te sientes hoy?</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-transparent rounded-full -translate-y-12 -translate-x-12" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Logros Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            return (
              <div 
                key={achievement.title}
                className={`p-3 rounded-xl border transition-all duration-300 hover:shadow-sm ${achievement.bgColor} border-gray-200`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                    <Icon className={`h-4 w-4 ${achievement.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {achievement.description}
                    </p>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                      Nuevo
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Enhanced Weekly Summary */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full -translate-y-10 translate-x-10" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
            Resumen Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-600">Promedio diario</span>
                <p className="text-lg font-bold text-gray-900">1,890 kcal</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600">Días completados</span>
                <p className="text-lg font-bold text-gray-900">5/7</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600">Peso perdido</span>
                <p className="text-lg font-bold text-green-600">-0.3 kg</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600">Constancia</span>
                <p className="text-lg font-bold text-blue-600">71%</p>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Progreso semanal</span>
                <span>71%</span>
              </div>
              <Progress value={71} className="h-2" />
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-4 hover:bg-indigo-50 hover:border-indigo-300">
              Ver Informe Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function for className concatenation
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}