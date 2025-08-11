import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardOverview } from "@/components/dashboard/overview"
import { NutritionSummary } from "@/components/dashboard/nutrition-summary"
import { TodaysMeals } from "@/components/dashboard/todays-meals"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  if (!session.user.profile) {
    redirect("/onboarding")
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <DashboardOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <NutritionSummary />
          <TodaysMeals />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}