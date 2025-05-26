export const EUserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
}
export type TUserRole = (typeof EUserRole)[keyof typeof EUserRole]
