import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function isAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })
    
    return user?.isAdmin || false
  } catch (error) {
    return false
  }
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }
  
  const adminStatus = await isAdmin(session.user.id)
  if (!adminStatus) {
    throw new Error("Admin access required")
  }
  
  return session
}

export async function checkAdminFromRequest(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { isAdmin: false, user: null, error: "Not authenticated" }
    }
    
    const adminStatus = await isAdmin(session.user.id)
    
    return { 
      isAdmin: adminStatus, 
      user: session.user, 
      error: adminStatus ? null : "Admin access required" 
    }
  } catch (error) {
    return { isAdmin: false, user: null, error: String(error) }
  }
}

export async function makeUserAdmin(email: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { email },
      data: { isAdmin: true }
    })
    return true
  } catch (error) {
    console.error("Failed to make user admin:", error)
    return false
  }
}