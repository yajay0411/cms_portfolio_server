import { GraphQLFormattedError } from 'graphql'
import { TErrorResponseGQL } from '../types/types'

export function formatErrorResponse(error: GraphQLFormattedError, isDevelopment: boolean): TErrorResponseGQL {
  const extensions = error.extensions || {}
  const statusCode = (extensions.http as { status?: number })?.status || 500

  const formatted: TErrorResponseGQL = {
    success: false,
    message: error.message,
    code: String(extensions.code || 'INTERNAL_ERROR'),
    statusCode,
    timestamp: new Date().toISOString(),
    path: error.path
  }

  if (isDevelopment) {
    formatted.stack = (error as any).stack
    if (extensions.details) {
      formatted.details = extensions.details
    }
  }

  return formatted
}
