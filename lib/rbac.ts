// Role-Based Access Control (RBAC) system
import { User } from "@prisma/client"
import { AuthorizationError } from "./errors"
import { logger } from "./logger"

// Define roles and permissions
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  NUTRITIONIST = 'NUTRITIONIST',
  PREMIUM_USER = 'PREMIUM_USER',
  USER = 'USER',
}

export enum Permission {
  // User management
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_USERS = 'VIEW_USERS',
  DELETE_USERS = 'DELETE_USERS',
  
  // Food management
  MANAGE_FOODS = 'MANAGE_FOODS',
  CREATE_FOODS = 'CREATE_FOODS',
  VERIFY_FOODS = 'VERIFY_FOODS',
  DELETE_FOODS = 'DELETE_FOODS',
  
  // Recipe management
  MANAGE_RECIPES = 'MANAGE_RECIPES',
  CREATE_RECIPES = 'CREATE_RECIPES',
  PUBLISH_RECIPES = 'PUBLISH_RECIPES',
  DELETE_RECIPES = 'DELETE_RECIPES',
  
  // Meal plan management
  MANAGE_MEAL_PLANS = 'MANAGE_MEAL_PLANS',
  CREATE_MEAL_PLANS = 'CREATE_MEAL_PLANS',
  SHARE_MEAL_PLANS = 'SHARE_MEAL_PLANS',
  
  // Import/Export
  IMPORT_DATA = 'IMPORT_DATA',
  EXPORT_DATA = 'EXPORT_DATA',
  BULK_OPERATIONS = 'BULK_OPERATIONS',
  
  // Analytics and reporting
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  VIEW_SYSTEM_STATS = 'VIEW_SYSTEM_STATS',
  
  // Content moderation
  MODERATE_CONTENT = 'MODERATE_CONTENT',
  MODERATE_REVIEWS = 'MODERATE_REVIEWS',
  
  // System administration
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',
  VIEW_LOGS = 'VIEW_LOGS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  
  // User profile
  MANAGE_OWN_PROFILE = 'MANAGE_OWN_PROFILE',
  VIEW_OWN_DATA = 'VIEW_OWN_DATA',
}

// Role-Permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(Permission)
  ],
  
  [Role.ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_FOODS,
    Permission.CREATE_FOODS,
    Permission.VERIFY_FOODS,
    Permission.DELETE_FOODS,
    Permission.MANAGE_RECIPES,
    Permission.CREATE_RECIPES,
    Permission.PUBLISH_RECIPES,
    Permission.DELETE_RECIPES,
    Permission.IMPORT_DATA,
    Permission.EXPORT_DATA,
    Permission.BULK_OPERATIONS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_SYSTEM_STATS,
    Permission.MODERATE_CONTENT,
    Permission.MODERATE_REVIEWS,
    Permission.VIEW_LOGS,
    Permission.MANAGE_OWN_PROFILE,
    Permission.VIEW_OWN_DATA,
  ],
  
  [Role.MODERATOR]: [
    Permission.VIEW_USERS,
    Permission.CREATE_FOODS,
    Permission.VERIFY_FOODS,
    Permission.CREATE_RECIPES,
    Permission.PUBLISH_RECIPES,
    Permission.MODERATE_CONTENT,
    Permission.MODERATE_REVIEWS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_OWN_PROFILE,
    Permission.VIEW_OWN_DATA,
  ],
  
  [Role.NUTRITIONIST]: [
    Permission.CREATE_FOODS,
    Permission.VERIFY_FOODS,
    Permission.CREATE_RECIPES,
    Permission.PUBLISH_RECIPES,
    Permission.MANAGE_MEAL_PLANS,
    Permission.CREATE_MEAL_PLANS,
    Permission.SHARE_MEAL_PLANS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_OWN_PROFILE,
    Permission.VIEW_OWN_DATA,
  ],
  
  [Role.PREMIUM_USER]: [
    Permission.CREATE_FOODS,
    Permission.CREATE_RECIPES,
    Permission.MANAGE_MEAL_PLANS,
    Permission.CREATE_MEAL_PLANS,
    Permission.SHARE_MEAL_PLANS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_OWN_PROFILE,
    Permission.VIEW_OWN_DATA,
  ],
  
  [Role.USER]: [
    Permission.CREATE_RECIPES,
    Permission.CREATE_MEAL_PLANS,
    Permission.MANAGE_OWN_PROFILE,
    Permission.VIEW_OWN_DATA,
  ],
}

// Get user's role from database user
function getUserRole(user: User): Role {
  if (user.isAdmin) {
    // For now, all admin users are treated as ADMIN role
    // In a more complex system, you'd store role in the database
    return Role.ADMIN
  }
  
  // In the future, you might check for premium subscription, etc.
  // For now, all non-admin users are regular users
  return Role.USER
}

// Get permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || []
}

// Get user permissions
export function getUserPermissions(user: User): Permission[] {
  const role = getUserRole(user)
  return getRolePermissions(role)
}

// Check if user has a specific permission
export function hasPermission(user: User, permission: Permission): boolean {
  const userPermissions = getUserPermissions(user)
  return userPermissions.includes(permission)
}

// Check if user has any of the specified permissions
export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  const userPermissions = getUserPermissions(user)
  return permissions.some(permission => userPermissions.includes(permission))
}

// Check if user has all specified permissions
export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  const userPermissions = getUserPermissions(user)
  return permissions.every(permission => userPermissions.includes(permission))
}

// Authorization middleware functions
export function requirePermission(permission: Permission) {
  return function authorize(user: User | null) {
    if (!user) {
      throw new AuthorizationError("Authentication required")
    }
    
    if (!hasPermission(user, permission)) {
      logger.security('Permission denied', user.id, {
        requiredPermission: permission,
        userRole: getUserRole(user),
      })
      throw new AuthorizationError(`Permission denied. Required: ${permission}`)
    }
    
    return true
  }
}

export function requireAnyPermission(permissions: Permission[]) {
  return function authorize(user: User | null) {
    if (!user) {
      throw new AuthorizationError("Authentication required")
    }
    
    if (!hasAnyPermission(user, permissions)) {
      logger.security('Permission denied', user.id, {
        requiredPermissions: permissions,
        userRole: getUserRole(user),
      })
      throw new AuthorizationError(`Permission denied. Required any of: ${permissions.join(', ')}`)
    }
    
    return true
  }
}

export function requireAllPermissions(permissions: Permission[]) {
  return function authorize(user: User | null) {
    if (!user) {
      throw new AuthorizationError("Authentication required")
    }
    
    if (!hasAllPermissions(user, permissions)) {
      logger.security('Permission denied', user.id, {
        requiredPermissions: permissions,
        userRole: getUserRole(user),
      })
      throw new AuthorizationError(`Permission denied. Required all of: ${permissions.join(', ')}`)
    }
    
    return true
  }
}

// Resource ownership check
export function requireOwnership(resourceUserId: string) {
  return function authorize(user: User | null) {
    if (!user) {
      throw new AuthorizationError("Authentication required")
    }
    
    // Allow if user owns the resource or has admin permissions
    if (user.id !== resourceUserId && !hasPermission(user, Permission.MANAGE_USERS)) {
      logger.security('Resource access denied', user.id, {
        resourceUserId,
        attemptedAction: 'access_user_resource',
      })
      throw new AuthorizationError("You can only access your own resources")
    }
    
    return true
  }
}

// Admin check (backwards compatibility)
export function requireAdmin() {
  return function authorize(user: User | null) {
    if (!user) {
      throw new AuthorizationError("Authentication required")
    }
    
    if (!user.isAdmin) {
      logger.security('Admin access denied', user.id)
      throw new AuthorizationError("Admin access required")
    }
    
    return true
  }
}

// Role-based authorization
export function requireRole(requiredRole: Role) {
  return function authorize(user: User | null) {
    if (!user) {
      throw new AuthorizationError("Authentication required")
    }
    
    const userRole = getUserRole(user)
    const requiredPermissions = getRolePermissions(requiredRole)
    
    if (!hasAllPermissions(user, requiredPermissions)) {
      logger.security('Role access denied', user.id, {
        userRole,
        requiredRole,
      })
      throw new AuthorizationError(`Role required: ${requiredRole}`)
    }
    
    return true
  }
}

// Utility function to check if user is premium (for future use)
export function isPremiumUser(user: User): boolean {
  // This would check subscription status in a real application
  // For now, return false as premium features aren't implemented
  return false
}

// Get user's role name for display purposes
export function getUserRoleName(user: User): string {
  const role = getUserRole(user)
  return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

// Export user role for external use
export { getUserRole }