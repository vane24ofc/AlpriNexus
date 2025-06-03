
// src/app/api/resources/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import * as z from 'zod';

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// Zod schema for validating new resource input
const CreateResourceSchema = z.object({
  name: z.string().min(1, { message: "El nombre del archivo es requerido." }).max(255),
  type: z.string().min(1, { message: "El tipo de archivo es requerido." }).max(50),
  size: z.string().min(1, { message: "El tamaño del archivo es requerido." }).max(50),
  visibility: z.enum(['private', 'instructors', 'public']),
  category: z.enum(['company', 'learning']),
  uploaderUserId: z.number().int().positive().optional().nullable(), // Opcional
  // url will be placeholder or null initially
});

export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM resources ORDER BY uploadDate DESC;');
    
    const resources = (rows as any[]).map(row => ({
      ...row,
      // Ensure dates are consistently formatted if needed, or handle on client
      // uploadDate: row.uploadDate ? new Date(row.uploadDate).toISOString() : null,
      // createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      // updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
    }));

    await connection.end();
    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('Error fetching resources from database:', error); 
    await connection?.end();
    // Provide more specific error details back to the client for database errors
    return NextResponse.json(
      { message: `Database error when fetching resources: ${error.message}`, errorDetails: error.code },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const validationResult = CreateResourceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos del recurso inválidos.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, type, size, visibility, category, uploaderUserId } = validationResult.data;
    const id = randomUUID();
    const uploadDate = new Date(); 
    // En una implementación real, la URL podría apuntar a un S3, GCS, o un endpoint de descarga del propio servidor.
    // Por ahora, es un placeholder.
    const url = `#placeholder-url-for-${id}`; 

    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO resources (id, name, type, size, uploadDate, url, visibility, category, uploaderUserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, size, uploadDate, url, visibility, category, uploaderUserId || null]
    );
    await connection.end();

    const newResource = {
      id,
      name,
      type,
      size,
      uploadDate: uploadDate.toISOString(),
      url,
      visibility,
      category,
      uploaderUserId: uploaderUserId || null,
      createdAt: uploadDate.toISOString(), // Approximate
      updatedAt: uploadDate.toISOString(), // Approximate
    };

    return NextResponse.json(
      { message: 'Metadatos del recurso creados exitosamente.', resource: newResource },
      { status: 201 }
    );

  } catch (error: any) {
    await connection?.end();
    console.error('Error creating resource metadata:', error);
    // Check for specific MySQL errors or return a generic one
    if (error.code) { // If it's a MySQL error (it usually has a code)
      return NextResponse.json(
        { message: 'Fallo al crear los metadatos del recurso en la base de datos.', error: error.message, code: error.code },
        { status: 500 }
      );
    }
    // Generic server error
    return NextResponse.json(
      { message: 'Fallo al crear los metadatos del recurso debido a un error interno.', error: error.message },
      { status: 500 }
    );
  }
}
