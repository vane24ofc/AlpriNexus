
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { Role } from '@/app/dashboard/layout';

interface TokenPayload extends JWTPayload {
  userId: string;
  role: Role;
  fullName?: string; // Añadido para pasar el nombre en el token
}

const JWT_SECRET_STRING = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h'; 
export const COOKIE_MAX_AGE = 60 * 60; 

if (!JWT_SECRET_STRING) {
  throw new Error('La variable de entorno JWT_SECRET no está definida. Por favor, añádela a tu archivo .env');
}

const getSecretKey = () => {
  return new TextEncoder().encode(JWT_SECRET_STRING);
};

export async function generateToken(payload: TokenPayload): Promise<string> {
  const secretKey = getSecretKey();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
  return token;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const secretKey = getSecretKey();
  try {
    const { payload } = await jwtVerify<TokenPayload>(token, secretKey);
    return payload;
  } catch (error) {
    console.error('Error verificando el token JWT:', error);
    return null;
  }
}
