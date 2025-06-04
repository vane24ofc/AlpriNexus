
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import * as z from 'zod';
import bcrypt from 'bcryptjs';

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const loginSchema = z.object({
  email: z.string().email({ message: "Dirección de correo inválida." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }), // Min 1, as bcrypt will handle empty string comparison if needed.
});

interface UserFromDB {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Password will be selected from DB
  role: 'administrador' | 'instructor' | 'estudiante';
  status: 'active' | 'inactive';
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos de inicio de sesión inválidos.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password: providedPassword } = validationResult.data;

    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, fullName, email, password, role, status, avatarUrl FROM users WHERE email = ?',
      [email]
    );
    
    const users = rows as UserFromDB[];

    if (users.length === 0) {
      await connection.end();
      return NextResponse.json({ message: 'Credenciales incorrectas. Inténtalo de nuevo.' }, { status: 401 });
    }

    const user = users[0];

    if (user.status === 'inactive') {
      await connection.end();
      return NextResponse.json({ message: 'Tu cuenta está inactiva. Contacta al administrador.' }, { status: 403 });
    }

    // Ensure user.password is not undefined before comparing
    if (!user.password) {
        await connection.end();
        console.error(`User ${user.email} found but has no password hash in DB.`);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }

    const passwordIsValid = await bcrypt.compare(providedPassword, user.password);

    await connection.end();

    if (!passwordIsValid) {
      return NextResponse.json({ message: 'Credenciales incorrectas. Inténtalo de nuevo.' }, { status: 401 });
    }

    // Do not send password back to client
    const { password: _, ...userWithoutPassword } = user;

    // In a real app, generate and return a session token (JWT) here.
    // For now, we return the user profile.
    return NextResponse.json({
      message: 'Inicio de sesión exitoso.',
      user: userWithoutPassword,
      // token: "simulated-jwt-token-for-future-use" // Placeholder for token
    });

  } catch (error: any) {
    await connection?.end();
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'Error en el servidor durante el inicio de sesión.', error: error.message },
      { status: 500 }
    );
  }
}
