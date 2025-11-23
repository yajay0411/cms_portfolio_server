import config from '@/config/config';

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

  async exchangeCodeForTokens(oauthCode: string, redirectUri: string): Promise<{ access_token: string }> {
    const params = new URLSearchParams({
      code: oauthCode,
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`GOOGLE_TOKEN_EXCHANGE_FAILED: ${text}`);
    }
    const data = (await resp.json()) as { access_token: string };
    if (!data.access_token) throw new Error('GOOGLE_TOKEN_MISSING');
    return { access_token: data.access_token };
  }

  async fetchUserProfile(accessToken: string): Promise<GoogleProfile> {
    const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`GOOGLE_USERINFO_FAILED: ${text}`);
    }
    const data = (await resp.json()) as Record<string, unknown>;
    return {
      id: String(data.id as string | number),
      email: (data.email as string | undefined) ?? null,
      name: (data.name as string | undefined) ?? null,
      picture: (data.picture as string | undefined) ?? null
    };
  }

  async exchangeCodeForProfile(oauthCode: string, redirectUri: string): Promise<GoogleProfile> {
    const { access_token } = await this.exchangeCodeForTokens(oauthCode, redirectUri);
    return this.fetchUserProfile(access_token);
  }
}
