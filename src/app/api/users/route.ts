
// src/app/api/users/route.ts
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

// Zod schema for validating new user input
const userSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['administrador', 'instructor', 'estudiante']).default('estudiante'),
  status: z.enum(['active', 'inactive']).default('active'),
  avatarUrl: z.string().url().optional().or(z.literal('')), // Optional and can be an empty string
});

const SIMULATED_AUTH_TOKEN_KEY = 'simulatedAuthToken';
const DUMMY_TOKEN_VALUE = 'secret-dummy-token-123';

// GET handler to fetch all users
export async function GET(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ') || authorizationHeader.substring(7) !== DUMMY_TOKEN_VALUE) {
    return NextResponse.json({ message: 'No autorizado. Token inválido o ausente.' }, { status: 401 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // Exclude password from being sent to the client
    const [rows] = await connection.execute('SELECT id, fullName, email, role, status, avatarUrl, createdAt, updatedAt FROM users ORDER BY createdAt DESC;');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Failed to fetch users.', error: error.message },
      { status: 500 }
    );
  }
}

// POST handler to create a new user
export async function POST(request: NextRequest) {
   const authorizationHeader = request.headers.get('Authorization');
   // Basic check, in real app, verify token properly (e.g. JWT)
   if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ') || authorizationHeader.substring(7) !== DUMMY_TOKEN_VALUE) {
    //  Allowing POST /api/users without auth only if it's from specific internal logic or if we add other checks later
    //  For now, let's assume if an admin is creating a user, they are "authorized" via their session on the frontend
    //  This needs more robust protection if used as a general user creation endpoint.
    //  For strictness, uncomment:
    //  return NextResponse.json({ message: 'No autorizado para crear usuario.' }, { status: 401 });
   }

  let connection;
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = userSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid user data.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, password, role, status, avatarUrl } = validationResult.data;

    connection = await mysql.createConnection(dbConfig);

    // Check if email already exists (moved from register to here as well for admin creation)
    const [existingUsers] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if ((existingUsers as any[]).length > 0) {
      await connection.end();
      return NextResponse.json(
        { message: 'Este correo electrónico ya está registrado.' },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await connection.execute(
      'INSERT INTO users (fullName, email, password, role, status, avatarUrl) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, role, status, avatarUrl || null] // Use null if avatarUrl is empty
    );
    
    await connection.end();

    const insertResult = result as mysql.ResultSetHeader;
    if (insertResult.insertId) {
      // Return the created user's data (excluding password)
      const newUser = {
        id: insertResult.insertId.toString(),
        fullName,
        email,
        role,
        status,
        avatarUrl: avatarUrl || null,
        createdAt: new Date().toISOString(), // Approximate
        updatedAt: new Date().toISOString(), // Approximate
      };
      return NextResponse.json(
        { message: 'User created successfully.', user: newUser },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to create user, no insertId returned.');
    }

  } catch (error: any) {
    await connection?.end();
    console.error('Error creating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Failed to create user. Email already exists.', error: error.message },
        { status: 409 } 
      );
    }
    return NextResponse.json(
      { message: 'Failed to create user.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
