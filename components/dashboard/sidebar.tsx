"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Heart, 
  BarChart3, 
  Calendar, 
  Utensils, 
  ShoppingCart, 
  Settings, 
  User,
  ChefHat,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Mi Perfil', href: '/dashboard/profile', icon: User },
  { name: 'Plan de Comidas', href: '/dashboard/meal-plan', icon: Calendar },
  { name: 'Registro Diario', href: '/dashboard/daily-log', icon: Utensils },
  { name: 'Recetas', href: '/dashboard/recipes', icon: ChefHat },
  { name: 'Lista de Compras', href: '/dashboard/shopping', icon: ShoppingCart },
  { name: 'Progreso', href: '/dashboard/progress', icon: BarChart3 },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </>
  )
}

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto border-r border-gray-200 bg-white">
      <div className="flex items-center flex-shrink-0 px-4">
        <Heart className="h-8 w-8 text-green-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">Dietas NutriMed</span>
      </div>
      <nav className="mt-8 flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? 'bg-green-100 text-green-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
              )}
            >
              <item.icon
                className={cn(
                  isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 flex-shrink-0 h-5 w-5'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}