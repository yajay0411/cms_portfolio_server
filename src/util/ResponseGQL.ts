import { TResponseGQL } from "../types/types";

export function formatSuccessResponse<T>(
  data: T,
  code = 'SUCCESS',
  statusCode = 200,
  metadata?: Record<string, any>
): TResponseGQL<T> {
  return {
    success: true,
    data,
    code,
    statusCode,
    timestamp: new Date().toISOString(),
    metadata
  };
}