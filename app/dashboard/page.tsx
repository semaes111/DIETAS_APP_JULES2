'use client'

import { DashboardOverview } from "@/components/dashboard/overview"
import { NutritionSummary } from "@/components/dashboard/nutrition-summary"
import { TodaysMeals } from "@/components/dashboard/todays-meals"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido de vuelta!
        </h1>
        <p className="text-gray-600">
          Aquí está tu resumen nutricional de hoy y tu progreso hacia tus objetivos.
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Overview Stats */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resumen de Hoy
            </h2>
            <DashboardOverview />
          </section>

          {/* Nutrition Charts */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Análisis Nutricional
            </h2>
            <NutritionSummary />
          </section>

          {/* Today's Meals */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Registro de Comidas
            </h2>
            <TodaysMeals />
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  )
}