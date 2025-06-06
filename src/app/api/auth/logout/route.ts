
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Creamos una respuesta para poder modificar las cookies
  const response = NextResponse.json({ message: 'Cierre de sesión exitoso.' });

  // Eliminamos la cookie de sesión estableciendo su maxAge a 0
  // Asegúrate de que el nombre de la cookie ('nexusAlpriSession') y el path ('/')
  // coincidan exactamente con cómo se estableció durante el login.
  response.cookies.set('nexusAlpriSession', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Indica al navegador que elimine la cookie
    path: '/',
    sameSite: 'strict',
  });

  // También es buena práctica limpiar cualquier dato relacionado con la sesión del localStorage del cliente,
  // aunque la lógica principal de sesión ahora depende de la cookie HttpOnly.
  // El frontend deberá encargarse de esto tras llamar a este endpoint.

  return response;
}
