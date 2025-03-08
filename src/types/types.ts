export type THttpResponse = {
  success: boolean
  statusCode: number
  request: {
    ip?: string | null
    method: string
    url: string,
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
