export type THttpResponse = {
  success: boolean
  statusCode: number
  request: {
    ip?: string | null
    method: string
    url: string
    user?: object | null
  }
  message: string
  data: unknown
}

export type THttpError = {
  success: boolean
  statusCode: number
  request: {
    ip?: string | null
    method: string
    url: string
    user?: object | null
  }
  message: string
  data: unknown
  trace?: object | null
}

export type TResponseGQL<T = any> = {
  success: true
  data: T
  code: string
  statusCode: number
  timestamp: string
  metadata?: Record<string, any>
}

export type TErrorResponseGQL = {
  success: false
  message: string
  code: string
  statusCode: number
  timestamp: string
  path?: ReadonlyArray<string | number>
  stack?: string
  details?: any
}
