
import jwt from 'jsonwebtoken';
import type { Role } from '@/app/dashboard/layout';

interface TokenPayload {
  userId: string;
  role: Role;
  // Puedes añadir más campos si los necesitas en el payload del token
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h'; // El token expira en 1 hora
export const COOKIE_MAX_AGE = 60 * 60; // 1 hora en segundos para la cookie

if (!JWT_SECRET) {
  throw new Error('La variable de entorno JWT_SECRET no está definida. Por favor, añádela a tu archivo .env');
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Error verificando el token JWT:', error);
    return null;
  }
}
