
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { generateToken, COOKIE_MAX_AGE } from '@/lib/jwt';
import type { Role } from '@/app/dashboard/layout';

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
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

interface UserFromDB {
  id: string; 
  fullName: string;
  email: string;
  password?: string; 
  role: Role;
  status: 'active' | 'inactive';
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function POST(request: NextRequest) {
  console.log('LOGIN API: Recibida solicitud POST /api/auth/login');
  let connection;
  try {
    const body = await request.json();
    console.log('LOGIN API: Cuerpo de la solicitud:', body);
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('LOGIN API: Validación fallida:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: 'Datos de inicio de sesión inválidos.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password: providedPassword } = validationResult.data;
    console.log(`LOGIN API: Intentando iniciar sesión con email: ${email}`);

    connection = await mysql.createConnection(dbConfig);
    console.log('LOGIN API: Conexión a BD establecida.');
    const [rows] = await connection.execute(
      'SELECT id, fullName, email, password, role, status, avatarUrl FROM users WHERE email = ?',
      [email]
    );
    console.log('LOGIN API: Consulta a BD ejecutada.');
    
    const users = rows as UserFromDB[];

    if (users.length === 0) {
      console.log(`LOGIN API: Usuario no encontrado para el email: ${email}`);
      await connection.end();
      return NextResponse.json({ message: 'Credenciales incorrectas. Inténtalo de nuevo.' }, { status: 401 });
    }

    const user = users[0];
    console.log('LOGIN API: Usuario encontrado:', { id: user.id, email: user.email, role: user.role, status: user.status });
    
    if (user.status === 'inactive') {
      console.log(`LOGIN API: Cuenta inactiva para el usuario: ${email}`);
      await connection.end();
      return NextResponse.json({ message: 'Tu cuenta está inactiva. Contacta al administrador.' }, { status: 403 });
    }

    if (!user.password || user.password.trim() === '') {
        console.error(`LOGIN API: El usuario ${user.email} no tiene un hash de contraseña válido en la BD.`);
        await connection.end();
        return NextResponse.json({ message: 'Error interno del servidor (código: NPH). Contacte al administrador.' }, { status: 500 });
    }

    console.log('LOGIN API: Comparando contraseña proporcionada con el hash almacenado...');
    const passwordIsValid = await bcrypt.compare(providedPassword, user.password);
    console.log(`LOGIN API: Resultado de bcrypt.compare(): ${passwordIsValid}`);

    if (!passwordIsValid) {
      console.log(`LOGIN API: Contraseña incorrecta para el usuario: ${email}`);
      await connection.end();
      return NextResponse.json({ message: 'Credenciales incorrectas. Inténtalo de nuevo.' }, { status: 401 });
    }
    
    console.log(`LOGIN API: Inicio de sesión exitoso para el usuario: ${email}`);
    await connection.end();

    // Generar JWT, incluyendo fullName
    const tokenPayload = { 
        userId: String(user.id), 
        role: user.role,
        fullName: user.fullName // Añadir fullName al payload del token
    }; 
    const token = await generateToken(tokenPayload); 

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso.',
      user: userWithoutPassword,
    });

    response.cookies.set('nexusAlpriSession', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      maxAge: COOKIE_MAX_AGE, 
      path: '/',
      sameSite: 'strict',
    });

    return response;

  } catch (error: any) {
    console.error('LOGIN API: Error general en el endpoint:', error);
    await connection?.end(); 
    return NextResponse.json(
      { message: 'Error en el servidor durante el inicio de sesión.', error: error.message },
      { status: 500 }
    );
  }
}
