import { DefaultSession } from "next-auth"
import { UserProfile } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      profile?: UserProfile | null
      isAdmin?: boolean
    } & DefaultSession["user"]
    supabaseAccessToken?: string
  }

  interface User {
    id: string
    profile?: UserProfile | null
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    profile?: UserProfile | null
    isAdmin?: boolean
  }
}