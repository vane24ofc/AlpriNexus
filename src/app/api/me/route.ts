
// src/app/api/me/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import type { Role } from '@/app/dashboard/layout';

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

interface UserFromDB {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  // El middleware ya habrá verificado la autenticación si esta ruta está protegida
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role') as Role | null;

  if (!userId || !userRole) {
    // Esto no debería ocurrir si el middleware está configurado correctamente para /api/me
    return NextResponse.json({ message: 'Información de autenticación no encontrada en las cabeceras.' }, { status: 401 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // Excluir la contraseña, aunque ya debería estar excluida en la selección general de usuarios
    const [rows] = await connection.execute(
      'SELECT id, fullName, email, role, status, avatarUrl, createdAt, updatedAt FROM users WHERE id = ?',
      [userId]
    );
    await connection.end();

    const users = rows as UserFromDB[];
    if (users.length === 0) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    const user = users[0];
    // Devolvemos los datos del usuario. Asegúrate de que esto coincida con lo que DashboardLayout espera.
    return NextResponse.json({
      id: user.id, // El ID es útil para el cliente
      name: user.fullName, // Coincide con la propiedad 'name' en UserProfileData de DashboardLayout
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl, // Enviar avatarUrl si existe
      // puedes añadir más campos si son necesarios para la UI del perfil general
    });

  } catch (error: any) {
    console.error('Error en GET /api/me:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Error del servidor al obtener la información del usuario.', error: error.message },
      { status: 500 }
    );
  }
}
