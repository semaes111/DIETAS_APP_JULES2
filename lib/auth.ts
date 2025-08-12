import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase"

// Create providers array conditionally based on environment variables
const providers: any[] = []

// Always include credentials provider
providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      try {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            profile: true,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          profile: user.profile,
        }
      } catch (error) {
        console.error("Auth error:", error)
        return null
      }
    },
  })
)

// Add Google provider only if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers,
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
        session.user.profile = token.profile as any
        session.user.isAdmin = token.isAdmin as boolean
        
        // Add Supabase access token if needed for direct Supabase operations
        if (token.sub) {
          try {
            // Generate Supabase JWT for the user
            const supabaseToken = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email: token.email as string,
              options: {
                redirectTo: process.env.NEXTAUTH_URL,
              }
            });
            
            session.supabaseAccessToken = supabaseToken.data.hashed_token;
          } catch (error) {
            console.error('Error generating Supabase token:', error);
          }
        }
      }

      return session
    },
    async jwt({ token, user, account }) {
      try {
        // Handle initial sign in
        if (user) {
          token.id = user.id
        }
        
        // Handle OAuth sign in
        if (account?.provider === 'google') {
          // Create or update user in Supabase through Prisma
          const existingUser = await prisma.user.findUnique({
            where: { email: token.email! },
            include: { profile: true }
          });
          
          if (existingUser) {
            token.id = existingUser.id;
            token.profile = existingUser.profile;
            token.isAdmin = existingUser.isAdmin;
          }
        }

        // Fetch user data for JWT
        const dbUser = await prisma.user.findFirst({
          where: {
            email: token.email!,
          },
          include: {
            profile: true,
          },
        })

        if (!dbUser) {
          if (user) {
            token.id = user?.id
          }
          return token
        }

        return {
          ...token,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          picture: dbUser.image,
          profile: dbUser.profile,
          isAdmin: dbUser.isAdmin,
        }
      } catch (error) {
        console.error("JWT callback error:", error)
        if (user) {
          token.id = user?.id
        }
        return token
      }
    },
    async signIn({ user, account, profile }) {
      try {
        // Allow credentials sign in
        if (account?.provider === 'credentials') {
          return true;
        }
        
        // Handle OAuth providers (Google)
        if (account?.provider === 'google' && profile?.email) {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email }
          });
          
          if (existingUser) {
            return true;
          }
          
          // Create new user if doesn't exist
          await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || null,
              image: (profile as any).picture || null,
              emailVerified: new Date(),
            }
          });
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    }
  },
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email);
    },
    async signIn({ user, account, profile }) {
      console.log('User signed in:', user.email, 'via', account?.provider);
    },
    async signOut({ session }) {
      console.log('User signed out:', session?.user?.email);
    }
  },
  debug: process.env.NODE_ENV === 'development',
}