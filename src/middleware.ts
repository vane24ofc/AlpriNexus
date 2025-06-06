
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt'; // Importamos la función que creamos
import type { Role } from '@/app/dashboard/layout'; // Import Role type

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
  const decodedToken = await verifyToken(sessionToken); 

  if (!decodedToken) {
    // Token inválido o expirado
    let response;
    const responseMessage = { message: 'Sesión inválida o expirada. Por favor, inicia sesión de nuevo.' };

    if (pathname.startsWith('/api/')) {
      response = NextResponse.json(responseMessage, { status: 401 });
    } else {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('sessionExpired', 'true'); 
      response = NextResponse.redirect(loginUrl);
    }
    
    response.cookies.set('nexusAlpriSession', '', { maxAge: 0, path: '/' });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(decodedToken.userId)); 
  requestHeaders.set('x-user-role', decodedToken.role as Role);
  // Para el nuevo endpoint, también podría ser útil tener el nombre del usuario (instructor)
  // Si tu payload del token incluye el nombre, puedes añadirlo:
  // if (decodedToken.userName) { // Asegúrate de que 'userName' esté en tu TokenPayload
  //   requestHeaders.set('x-user-name', decodedToken.userName);
  // }
  // Por ahora, si no está en el token, el endpoint lo tomará del userProfile.name que ya se guarda
  // en localStorage en el cliente y que se pasa en el fetch, o la API usa el ID del usuario.
  // Para simplificar y dado que nuestro `TokenPayload` solo tiene `userId` y `role`, el endpoint
  // `/api/instructor/courses-summary` deberá buscar el nombre del instructor usando el `userId` si es necesario,
  // o asumir que el `instructorName` de los cursos es lo que identifica al instructor.
  // Para este caso, el endpoint /api/instructor/courses-summary está diseñado para tomar el nombre del
  // x-user-id (que es un número) para buscar al usuario, o de x-user-name si lo tuviéramos.
  // Dado que nuestro tokenPayload SÓLO tiene userId y role, y el endpoint /api/instructor/courses-summary
  // espera un `instructorName` para filtrar los cursos, necesitamos una forma de obtener ese nombre.
  // El userProfile se guarda en localStorage y contiene el nombre. El endpoint `/api/instructor/courses-summary`
  // NO tiene acceso directo al localStorage del cliente.
  //
  // Solución: El frontend (Dashboard del Instructor) YA tiene `userProfile.name`.
  // El endpoint `/api/instructor/courses-summary` necesita el `instructorName` para filtrar.
  // El middleware puede añadir `x-user-id` y `x-user-role`.
  // El endpoint `/api/instructor/courses-summary/route.ts` está modificado para leer `x-user-name` o
  // preferiblemente usar el `x-user-id` para buscar el nombre del instructor si es necesario.
  // Aquí, el endpoint ha sido diseñado para que el middleware inyecte x-user-name si está disponible en el token
  // Por ahora el token no tiene el nombre, el endpoint debe buscarlo con el ID.
  // Corrijo: El endpoint usará el ID y buscará el nombre del instructor.
  // No, el endpoint ahora toma el `instructorName` del `x-user-name` si existe.
  // Vamos a asegurar que el token SÍ contenga el nombre del usuario.
  // Para esto, necesito modificar la creación del token en `/api/auth/login/route.ts`.
  // Y actualizar `TokenPayload` en `jwt.ts`.

  // Para que el middleware pueda inyectar el nombre del usuario,
  // necesitamos asegurarnos de que el nombre del usuario esté en el token JWT.
  // Si `decodedToken.fullName` (o como se llame en tu payload) existe:
  if (decodedToken.fullName) { // ASUMIENDO que fullName está en el TokenPayload
      requestHeaders.set('x-user-name', decodedToken.fullName);
  }


  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/me',
    '/api/instructor/courses-summary', // Proteger el nuevo endpoint
    '/api/((?!auth/login|auth/register|auth/logout|test-db).*)', 
  ],
};

