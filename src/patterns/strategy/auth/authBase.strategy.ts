import { AuthResult, LoginRequest } from '@/types/auth.type';

export interface AuthBaseStrategy {
  canHandle(payload: LoginRequest): boolean;
  authenticate(payload: LoginRequest): Promise<Omit<AuthResult, 'accessToken' | 'refreshToken'>>;
}
