import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';

export interface EncryptedToken {
  iv: string;
  encryptedData: string;
  authTag: string;
}

export function encryptToken(
  token: string,
  encryptionKey: Buffer
): EncryptedToken {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  
  let encryptedData = cipher.update(token, 'utf8', ENCODING);
  encryptedData += cipher.final(ENCODING);
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString(ENCODING),
    encryptedData,
    authTag: authTag.toString(ENCODING)
  };
}

export function decryptToken(
  encrypted: EncryptedToken,
  encryptionKey: Buffer
): string {
  const iv = Buffer.from(encrypted.iv, ENCODING);
  const authTag = Buffer.from(encrypted.authTag, ENCODING);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted.encryptedData, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
