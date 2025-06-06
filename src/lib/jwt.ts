
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { Role } from '@/app/dashboard/layout';

interface TokenPayload extends JWTPayload {
  userId: string;
  role: Role;
  // Puedes añadir más campos si los necesitas en el payload del token
}

const JWT_SECRET_STRING = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h'; // El token expira en 1 hora
export const COOKIE_MAX_AGE = 60 * 60; // 1 hora en segundos para la cookie

if (!JWT_SECRET_STRING) {
  throw new Error('La variable de entorno JWT_SECRET no está definida. Por favor, añádela a tu archivo .env');
}

// `jose` requiere que la clave secreta sea un Uint8Array
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
