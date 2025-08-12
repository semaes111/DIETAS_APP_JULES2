"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard,
  Target,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  ChefHat,
  TrendingUp,
  Settings,
  User,
  Heart,
  BarChart3,
  Apple,
  BookOpen,
  Award,
  HelpCircle,
  LogOut,
  Sparkles
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: any
  badge?: string
  description?: string
  gradient?: string
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Resumen general de tu progreso",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    title: "Registro Diario",
    href: "/dashboard/daily-log",
    icon: Target,
    description: "Registra tus comidas y progreso",
    gradient: "from-green-500 to-green-600"
  },
  {
    title: "Plan de Comidas",
    href: "/dashboard/meal-plan",
    icon: Calendar,
    description: "Planifica tu semana nutricional",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    title: "Base de Alimentos",
    href: "/dashboard/foods",
    icon: Apple,
    description: "Explora nuestra base de datos",
    gradient: "from-orange-500 to-orange-600"
  }
]

const secondaryNavItems: NavItem[] = [
  {
    title: "Recetas",
    href: "/dashboard/recipes",
    icon: ChefHat,
    badge: "Nuevo",
    description: "Descubre recetas mediterráneas",
    gradient: "from-amber-500 to-amber-600"
  },
  {
    title: "Lista de Compras",
    href: "/dashboard/shopping",
    icon: ShoppingCart,
    description: "Genera listas automáticas",
    gradient: "from-teal-500 to-teal-600"
  },
  {
    title: "Progreso",
    href: "/dashboard/progress",
    icon: TrendingUp,
    description: "Analiza tu evolución",
    gradient: "from-indigo-500 to-indigo-600"
  },
  {
    title: "Análisis",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Estadísticas detalladas",
    gradient: "from-pink-500 to-pink-600"
  }
]

const bottomNavItems: NavItem[] = [
  {
    title: "Mi Perfil",
    href: "/dashboard/profile",
    icon: User,
    description: "Configuración personal"
  },
  {
    title: "Ajustes",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Preferencias de la app"
  },
  {
    title: "Ayuda",
    href: "/dashboard/help",
    icon: HelpCircle,
    description: "Soporte y guías"
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const NavSection = ({ 
    title, 
    items, 
    showGradients = false 
  }: { 
    title: string
    items: NavItem[]
    showGradients?: boolean 
  }) => (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-white shadow-md border border-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}>
                {/* Gradient background for active state */}
                {isActive && showGradients && item.gradient && (
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-10 bg-gradient-to-r",
                    item.gradient
                  )} />
                )}
                
                {/* Icon */}
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 mr-3",
                  isActive && showGradients && item.gradient
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-sm`
                    : isActive
                    ? "bg-gray-100 text-gray-700"
                    : "bg-transparent text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-700"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-full" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className={cn("w-72 bg-gray-50 border-r border-gray-200 flex flex-col", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">NutriMed</h1>
            <p className="text-xs text-gray-500">Dieta Mediterránea</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
        <NavSection title="Principal" items={mainNavItems} showGradients={true} />
        <NavSection title="Herramientas" items={secondaryNavItems} showGradients={true} />
        
        {/* Motivational Card */}
        <div className="mx-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">¡Sigue así!</span>
          </div>
          <p className="text-xs text-green-700 mb-3">
            Llevas 7 días consecutivos registrando tus comidas
          </p>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-3/4 transition-all duration-500"></div>
          </div>
        </div>
        
        <NavSection title="Cuenta" items={bottomNavItems} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}