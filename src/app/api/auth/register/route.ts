
// src/app/api/auth/register/route.ts
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

// Zod schema for validating registration input
const registerSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Dirección de correo inválida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  // confirmPassword is validated on client-side, not needed for API if password itself meets criteria
});

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos de registro inválidos.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, password } = validationResult.data;

    connection = await mysql.createConnection(dbConfig);

    // Check if email already exists
    const [existingUsers] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if ((existingUsers as any[]).length > 0) {
      await connection.end();
      return NextResponse.json(
        { message: 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.' },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Default role to 'estudiante' and status to 'active' for public registration
    const defaultRole = 'estudiante';
    const defaultStatus = 'active';

    const [result] = await connection.execute(
      'INSERT INTO users (fullName, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, defaultRole, defaultStatus]
    );
    
    await connection.end();

    const insertResult = result as mysql.ResultSetHeader;
    if (insertResult.insertId) {
      return NextResponse.json(
        { message: 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.', userId: insertResult.insertId },
        { status: 201 }
      );
    } else {
      throw new Error('Fallo al registrar el usuario, no se devolvió ID de inserción.');
    }

  } catch (error: any) {
    await connection?.end();
    console.error('Error en registro de API:', error);
    // Handle potential duplicate email error (MySQL error code 1062) - though we check above, this is a safeguard
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Este correo electrónico ya está registrado (error de base de datos).', error: error.message },
        { status: 409 } 
      );
    }
    return NextResponse.json(
      { message: 'Fallo al registrar el usuario.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
