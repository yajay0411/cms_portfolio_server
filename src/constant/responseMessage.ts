export default {
  SUCCESS: `The operation has been successful`,
  SOMETHING_WENT_WRONG: `Something went wrong!`,
  NOT_FOUND: (entity: string = 'Not') => `${entity} not found`,
  FAILED_TO_CREATE: (entity: string = '!') => `Failed to create ${entity}`,
  TOO_MANY_REQUESTS: `Too many requests! Please try again after some time`,
  ALREADY_EXIST: (entity: string, identifier: string) => `${entity} already exist with ${identifier}`,
  INVALID_PHONE_NUMBER: `Invalid phone number`,
  INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE: `Invalid account confirmation token or code`,
  INVALID_TOKEN: `Invalid token`,
  ACCOUNT_ALREADY_CONFIRMED: `Account already confirmed`,
  INVALID_EMAIL_OR_PASSWORD: `Invalid email address or password`,
  UNAUTHORIZED: `You are not authorized to perform this action`,
  ACCOUNT_CONFIRMATION_REQUIRED: `Account Confirmation Required, An Confirmation mail is sent`,
  EXPIRED_URL: `Your password reset url is expired`,
  INVALID_REQUEST: `Invalid request`,
  INVALID_OLD_PASSWORD: `Invalid old password`,
  PASSWORD_MATCHING_WITH_OLD_PASSWORD: `Password matching with old password`
}
