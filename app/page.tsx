import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LandingPage } from "@/components/landing-page"

export const metadata: Metadata = {
  title: "Bienvenido a Dietas NutriMed",
  description: "Tu compañero personal para una alimentación saludable basada en principios mediterráneos",
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <LandingPage />
}