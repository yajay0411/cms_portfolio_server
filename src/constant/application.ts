export const EApplicationEnvironment = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
}
export type TApplicationEnvironment = (typeof EApplicationEnvironment)[keyof typeof EApplicationEnvironment]

export const EStorageKey = {
  API_REFRESH_TOKEN: 'apiOnly_RefreshToken',
  API_ACCESS_TOKEN: 'apiOnly_AccessToken',
  CLIENT_ACCESS_TOKEN: 'clientOnly_AccessToken'
}
export type TStorageKey = (typeof EStorageKey)[keyof typeof EStorageKey]
