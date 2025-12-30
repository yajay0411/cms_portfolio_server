import config from '@/config/app.config';

export interface GoogleProfile {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  id: string;
}

export class GoogleOAuthService {
  // One Tap / ID Token verification path (preferred when FE sends `credential`)
  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`GOOGLE_ID_TOKEN_VERIFY_FAILED: ${text}`);
    }
    const data = (await resp.json()) as Record<string, unknown>;
    const aud = data.aud as string | undefined;
    if (!aud || aud !== config.GOOGLE_CLIENT_ID) {
      throw new Error('INVALID_GOOGLE_AUDIENCE');
    }
    return {
      id: String(data.sub as string | number),
      email: (data.email as string | undefined) ?? null,
      name: (data.name as string | undefined) ?? null,
      picture: (data.picture as string | undefined) ?? null
    };
  }
}
