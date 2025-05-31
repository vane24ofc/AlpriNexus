
// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import * as z from 'zod';

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

// GET handler to fetch all users
export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
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

    // TODO: In a real app, hash the password before saving!
    // For this demo, we're storing it as plain text.
    const hashedPassword = password; // Placeholder for actual hashing logic

    const [result] = await connection.execute(
      'INSERT INTO users (fullName, email, password, role, status, avatarUrl) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, role, status, avatarUrl || null] // Use null if avatarUrl is empty
    );
    
    await connection.end();

    const insertResult = result as mysql.ResultSetHeader;
    if (insertResult.insertId) {
      return NextResponse.json(
        { message: 'User created successfully.', userId: insertResult.insertId },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to create user, no insertId returned.');
    }

  } catch (error: any) {
    await connection?.end();
    console.error('Error creating user:', error);
    // Handle potential duplicate email error (MySQL error code 1062)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Failed to create user. Email already exists.', error: error.message },
        { status: 409 } // 409 Conflict
      );
    }
    return NextResponse.json(
      { message: 'Failed to create user.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
