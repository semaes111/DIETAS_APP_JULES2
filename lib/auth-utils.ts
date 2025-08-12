// Enhanced authentication utilities
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { User } from "@prisma/client"
import { AuthenticationError, AuthorizationError } from "./errors"
import { logger } from "./logger"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// JWT token types
export interface AccessTokenPayload {
  userId: string
  email: string
  iat: number
  exp: number
  type: 'access'
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
  iat: number
  exp: number
  type: 'refresh'
}

// Token constants
const ACCESS_TOKEN_EXPIRY = 15 * 60 // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 // 7 days
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key'

// Password validation
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`)
  }
  
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`)
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Hash password with salt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate secure token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// JWT token generation
export function generateAccessToken(userId: string, email: string): string {
  const payload: AccessTokenPayload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
    type: 'access',
  }
  
  return jwt.sign(payload, JWT_SECRET)
}

export function generateRefreshToken(userId: string, tokenId: string): string {
  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY,
    type: 'refresh',
  }
  
  return jwt.sign(payload, JWT_SECRET)
}

// JWT token verification
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload
    if (payload.type !== 'access') {
      return null
    }
    return payload
  } catch (error) {
    logger.warn('Invalid access token', { error: error instanceof Error ? error.message : String(error) })
    return null
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as RefreshTokenPayload
    if (payload.type !== 'refresh') {
      return null
    }
    return payload
  } catch (error) {
    logger.warn('Invalid refresh token', { error: error instanceof Error ? error.message : String(error) })
    return null
  }
}

// Get user from request (NextAuth + custom JWT support)
export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  try {
    // First try NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true },
      })
      return user
    }

    // Fallback to JWT token in Authorization header
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = verifyAccessToken(token)
      
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: { profile: true },
        })
        return user
      }
    }

    return null
  } catch (error) {
    logger.error('Error getting user from request', error)
    return null
  }
}

// Require authenticated user
export async function requireUser(req: NextRequest): Promise<User> {
  const user = await getUserFromRequest(req)
  
  if (!user) {
    throw new AuthenticationError("Authentication required")
  }
  
  return user
}

// Check if user account is active and verified
export function validateUserAccount(user: User): void {
  // Add account validation logic here
  // For example: check if email is verified, account is active, etc.
  
  if (!user.email) {
    throw new AuthenticationError("User account is incomplete")
  }
  
  // Future: Add email verification check
  // if (!user.emailVerified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
  //   throw new AuthenticationError("Please verify your email address")
  // }
}

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; firstAttempt: number }>()

export function checkAuthRateLimit(identifier: string): void {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5

  const existing = authAttempts.get(identifier)
  
  if (!existing || (now - existing.firstAttempt) > windowMs) {
    // Reset window
    authAttempts.set(identifier, { count: 1, firstAttempt: now })
    return
  }

  existing.count++
  
  if (existing.count > maxAttempts) {
    logger.security('Authentication rate limit exceeded', undefined, { identifier })
    throw new AuthenticationError("Too many authentication attempts. Please try again later.")
  }
}

export function clearAuthRateLimit(identifier: string): void {
  authAttempts.delete(identifier)
}

// Session utilities
export interface SessionInfo {
  user: User
  sessionId?: string
  expiresAt?: Date
  isValid: boolean
}

export async function getSessionInfo(req: NextRequest): Promise<SessionInfo | null> {
  try {
    const user = await getUserFromRequest(req)
    
    if (!user) {
      return null
    }

    // Validate user account
    validateUserAccount(user)

    return {
      user,
      isValid: true,
      // Add session expiry logic if needed
    }
  } catch (error) {
    logger.error('Error getting session info', error)
    return null
  }
}

// Logout utilities
export async function invalidateUserSessions(userId: string): Promise<void> {
  try {
    // Remove all sessions for the user
    await prisma.session.deleteMany({
      where: { userId },
    })
    
    logger.info('All user sessions invalidated', { userId })
  } catch (error) {
    logger.error('Error invalidating user sessions', error)
    throw error
  }
}

// Account lockout (for security)
export async function lockUserAccount(userId: string, reason: string): Promise<void> {
  try {
    // In a more complex system, you'd have an account status field
    // For now, we'll just log the security event
    logger.security('User account locked', userId, { reason })
    
    // Invalidate all sessions
    await invalidateUserSessions(userId)
  } catch (error) {
    logger.error('Error locking user account', error)
    throw error
  }
}

// Email utilities (for password reset, verification, etc.)
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Password reset token verification
export interface PasswordResetToken {
  token: string
  userId: string
  expiresAt: Date
}

// In a production system, you'd store these in the database
const passwordResetTokens = new Map<string, PasswordResetToken>()

export function createPasswordResetToken(userId: string): string {
  const token = generatePasswordResetToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  
  passwordResetTokens.set(token, {
    token,
    userId,
    expiresAt,
  })
  
  return token
}

export function validatePasswordResetToken(token: string): string | null {
  const resetToken = passwordResetTokens.get(token)
  
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return null
  }
  
  return resetToken.userId
}

export function consumePasswordResetToken(token: string): void {
  passwordResetTokens.delete(token)
}

// Security headers
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  }
}