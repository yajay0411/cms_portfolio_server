import redis from '@/config/redis.config';

class TokenBlacklistService {
  async blacklistAccessToken(token: string, ttl: number): Promise<void> {
    await redis.set(`bl:access:${token}`, '1', { EX: ttl });
  }

  async blacklistRefreshToken(token: string, ttl: number): Promise<void> {
    await redis.set(`bl:refresh:${token}`, '1', { EX: ttl });
  }

  async isAccessTokenBlacklisted(token: string): Promise<boolean> {
    return (await redis.exists(`bl:access:${token}`)) === 1;
  }

  async isRefreshTokenBlacklisted(token: string): Promise<boolean> {
    return (await redis.exists(`bl:refresh:${token}`)) === 1;
  }
}

export const blacklistService = new TokenBlacklistService();
