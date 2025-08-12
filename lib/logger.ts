// Production-ready logging utility
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private logLevel: LogLevel
  
  constructor() {
    const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG')
    this.logLevel = LogLevel[level as keyof typeof LogLevel] ?? LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel
  }

  private formatLog(level: string, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    }
  }

  private output(logEntry: LogEntry) {
    if (process.env.NODE_ENV === 'production') {
      // In production, output JSON for log aggregation systems
      console.log(JSON.stringify(logEntry))
    } else {
      // In development, pretty print for readability
      const { timestamp, level, message, context, error } = logEntry
      console.log(`[${timestamp}] ${level}: ${message}`)
      if (context) {
        console.log('Context:', context)
      }
      if (error) {
        console.error('Error:', error)
      }
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const logEntry = this.formatLog('ERROR', message, context)
    
    if (error instanceof Error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } else if (error) {
      logEntry.error = {
        name: 'Unknown',
        message: String(error),
      }
    }

    this.output(logEntry)
  }

  warn(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.WARN)) return
    this.output(this.formatLog('WARN', message, context))
  }

  info(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.INFO)) return
    this.output(this.formatLog('INFO', message, context))
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    this.output(this.formatLog('DEBUG', message, context))
  }

  // API request logging
  request(
    method: string,
    path: string,
    userId?: string,
    requestId?: string,
    context?: Record<string, any>
  ) {
    this.info(`${method} ${path}`, {
      type: 'request',
      userId,
      requestId,
      ...context,
    })
  }

  // API response logging
  response(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string
  ) {
    const level = statusCode >= 400 ? 'ERROR' : 'INFO'
    const message = `${method} ${path} - ${statusCode} (${duration}ms)`
    
    const logEntry = this.formatLog(level, message, {
      type: 'response',
      statusCode,
      duration,
      userId,
      requestId,
    })

    this.output(logEntry)
  }

  // Database query logging
  database(operation: string, table: string, duration?: number, context?: Record<string, any>) {
    this.debug(`DB ${operation} on ${table}`, {
      type: 'database',
      operation,
      table,
      duration,
      ...context,
    })
  }

  // Security event logging
  security(event: string, userId?: string, context?: Record<string, any>) {
    this.warn(`Security event: ${event}`, {
      type: 'security',
      userId,
      ...context,
    })
  }

  // Performance logging
  performance(operation: string, duration: number, context?: Record<string, any>) {
    const level = duration > 1000 ? 'WARN' : 'INFO'
    const logEntry = this.formatLog(level, `Performance: ${operation} took ${duration}ms`, {
      type: 'performance',
      operation,
      duration,
      ...context,
    })

    this.output(logEntry)
  }
}

// Create singleton instance
export const logger = new Logger()

// Request timing middleware helper
export function withTiming<T>(
  operation: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = Date.now()
  
  const logResult = (result: T) => {
    const duration = Date.now() - start
    logger.performance(operation, duration)
    return result
  }

  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.then(logResult).catch((error) => {
        const duration = Date.now() - start
        logger.error(`${operation} failed after ${duration}ms`, error)
        throw error
      })
    } else {
      return Promise.resolve(logResult(result))
    }
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`${operation} failed after ${duration}ms`, error)
    throw error
  }
}

// API route timing decorator
export function withRequestLogging(handler: Function, operationName: string) {
  return async function(req: Request, ...args: any[]) {
    const start = Date.now()
    const method = req.method
    const url = new URL(req.url)
    const path = url.pathname
    const requestId = crypto.randomUUID()

    logger.request(method, path, undefined, requestId)

    try {
      const response = await handler.call(this, req, ...args)
      const duration = Date.now() - start
      const status = response?.status || 200
      
      logger.response(method, path, status, duration, undefined, requestId)
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      logger.response(method, path, 500, duration, undefined, requestId)
      logger.error(`${operationName} failed`, error, { requestId })
      throw error
    }
  }
}