import { IUser } from '@/model/user.model';

// src/modules/auth/auth.types.ts
export type Provider = 'EMAIL' | 'OTP' | 'GOOGLE' | 'GITHUB';

export interface LoginRequest {
  provider: Provider;
  // EMAIL
  email?: string;
  password?: string;
  // OTP
  contact?: string;
  otp?: string;
  // OAUTH (received from FE exchange or server-side callback)
  credential?: string;
}

export interface RegisterRequest {
  email?: string;
  password?: string;
  mobile?: string;
  name?: string;
}

export interface AuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtClaims {
  sub: string; // userId
  sid: string; // sessionId
  iat: number;
  exp: number;
}

export interface OAuthProfile {
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  providerUserId: string;
}
