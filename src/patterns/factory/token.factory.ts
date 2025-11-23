import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import config from '@/config/config';
import { JwtClaims, TokenPair } from '@/types/auth.type';

export class TokenFactory {
  private blacklist: Set<string> = new Set();

  create(userId: string): TokenPair {
    const sessionId = randomUUID();

    const accessToken = jwt.sign({ sub: userId, sid: sessionId } as JwtClaims, config.ACCESS_TOKEN_SECRET, {
      expiresIn: config.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn']
    });

    const refreshToken = jwt.sign({ sub: userId, sid: sessionId } as JwtClaims, config.REFRESH_TOKEN_SECRET, {
      expiresIn: config.REFRESH_TOKEN_TTL as jwt.SignOptions['expiresIn']
    });

    return { accessToken, refreshToken };
  }

  rotate(refreshToken: string): TokenPair {
    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET) as JwtClaims;
    // Optionally assert sessionId is still valid in DB.
    return this.create(decoded.sub);
  }

  verifyAccess(token: string): JwtClaims {
    return jwt.verify(token, config.ACCESS_TOKEN_SECRET) as JwtClaims;
  }

  verifyAccessAndBlacklist(token: string): JwtClaims {
    const decoded = this.verifyAccess(token);
    if (this.blacklist.has(token)) {
      throw new Error('INVALID_TOKEN');
    }
    return decoded;
  }

  blacklistToken(token: string): void {
    console.log(this.blacklist);
    this.blacklist.add(token);
  }
}
