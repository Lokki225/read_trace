import crypto from 'crypto';

export interface StateTokenData {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const STATE_TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function generateStateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createStateTokenData(token: string): StateTokenData {
  const now = Date.now();
  return {
    token,
    createdAt: now,
    expiresAt: now + STATE_TOKEN_EXPIRY_MS
  };
}

export function validateStateToken(
  storedToken: StateTokenData,
  providedToken: string
): { isValid: boolean; error?: string } {
  if (storedToken.token !== providedToken) {
    return { isValid: false, error: 'Invalid state token' };
  }
  
  if (Date.now() > storedToken.expiresAt) {
    return { isValid: false, error: 'State token expired' };
  }
  
  return { isValid: true };
}
