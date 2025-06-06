
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt'; // Importamos la función que creamos

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('nexusAlpriSession')?.value;

  // Si no hay token y la ruta es protegida (según el matcher)
  if (!sessionToken) {
    if (pathname.startsWith('/api/')) { // Para rutas API protegidas
      return NextResponse.json({ message: 'Autenticación requerida.' }, { status: 401 });
    }
    // Para páginas del dashboard protegidas, redirigir al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname); // Opcional: para redirigir de vuelta después del login
    return NextResponse.redirect(loginUrl);
  }

  // Si hay un token, verificarlo
  const decodedToken = verifyToken(sessionToken);

  if (!decodedToken) {
    // Token inválido o expirado
    let response;
    const responseMessage = { message: 'Sesión inválida o expirada. Por favor, inicia sesión de nuevo.' };

    if (pathname.startsWith('/api/')) {
      response = NextResponse.json(responseMessage, { status: 401 });
    } else {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('sessionExpired', 'true'); // Opcional: para mostrar un mensaje en la página de login
      response = NextResponse.redirect(loginUrl);
    }
    
    // Limpiar la cookie inválida
    response.cookies.set('nexusAlpriSession', '', { maxAge: 0, path: '/' });
    return response;
  }

  // Token válido: El usuario está autenticado.
  // Añadimos la información del usuario a las cabeceras de la solicitud.
  // Las API routes y Server Components podrán leer estas cabeceras.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(decodedToken.userId)); // Asegurarse de que userId sea string
  requestHeaders.set('x-user-role', decodedToken.role);

  // Permitir que la solicitud continúe con las nuevas cabeceras
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configuración del Matcher:
// Especifica en qué rutas se ejecutará este middleware.
export const config = {
  matcher: [
    /*
     * Rutas que deben ser protegidas:
     * - Todas las páginas bajo /dashboard/
     * - Todas las rutas API excepto las de autenticación, test-db y el propio /api/me
     */
    '/dashboard/:path*', // Protege /dashboard y todas sus subrutas
    '/api/me', // Proteger el endpoint /api/me
    '/api/((?!auth/login|auth/register|auth/logout|test-db).*)', 
    // Lo anterior protege todas las rutas /api/ EXCEPTO:
    // /api/auth/login
    // /api/auth/register
    // /api/auth/logout
    // /api/test-db
    // No es necesario excluir /api/me aquí porque ya está incluido arriba.
  ],
};
