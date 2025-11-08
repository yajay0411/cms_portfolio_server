export const EApplicationEnvironment = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
};
export type TApplicationEnvironment = (typeof EApplicationEnvironment)[keyof typeof EApplicationEnvironment];
