export type Provider = 'EMAIL' | 'OTP' | 'GOOGLE' | 'GITHUB';

export interface LoginRequest {
  provider: Provider;
  email?: string;
  password?: string;
  contact?: string;
  otp?: string;
  credential?: string;
}

export interface AuthResult {
  user: UserLike;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtClaims {
  sub: string;
  sid: string;
  iat: number;
  exp: number;
}

export interface OAuthProfile {
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  providerUserId: string;
}

export interface UserLike {
  id?: string;
  email?: string | null;
  mobile?: string | null;
  name?: string | null;
  providers?: Record<string, unknown> | null;
  passwordHash?: string | null;
  lastLoginAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  _id?: string;
}
