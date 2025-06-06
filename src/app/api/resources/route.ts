
// src/app/api/resources/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import * as z from 'zod';
import type { Role } from '@/app/dashboard/layout';

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// Zod schema for validating new resource input
// actingUserRole is removed as it will come from middleware headers
const CreateResourceSchema = z.object({
  name: z.string().min(1, { message: "El nombre del archivo es requerido." }).max(255),
  type: z.string().min(1, { message: "El tipo de archivo es requerido." }).max(50),
  size: z.string().min(1, { message: "El tamaño del archivo es requerido." }).max(50),
  visibility: z.enum(['private', 'instructors', 'public']),
  category: z.enum(['company', 'learning']),
  uploaderUserId: z.number().int().positive().optional().nullable(), // Kept for now, but will be primarily derived from x-user-id
});

export async function GET(request: NextRequest) {
  // Role is now obtained from middleware-injected headers
  const actingUserRoleFromHeader = request.headers.get('x-user-role') as Role | null;

  if (!actingUserRoleFromHeader || !['administrador', 'instructor', 'estudiante'].includes(actingUserRoleFromHeader)) {
    return NextResponse.json({ message: 'Rol de usuario no proporcionado o inválido en la cabecera.' }, { status: 403 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    let query = 'SELECT * FROM resources';
    const queryParams: string[] = [];

    if (actingUserRoleFromHeader === 'estudiante') {
      query += ' WHERE visibility = ?';
      queryParams.push('public');
    } else if (actingUserRoleFromHeader === 'instructor') {
      // Instructores ven 'public' y 'instructors'.
      // Y sus propios archivos 'private' (requeriría uploaderUserId check aquí)
      // Simplificando: instructores ven public, instructors. Lógica para private del instructor podría añadirse.
      query += ' WHERE visibility IN (?, ?)';
      queryParams.push('public', 'instructors');
    }
    // Administradores ven todo, no se añade cláusula WHERE de visibilidad por defecto.

    query += ' ORDER BY uploadDate DESC;';
    
    const [rows] = await connection.execute(query, queryParams);
    
    const resources = (rows as any[]).map(row => ({
      ...row,
    }));

    await connection.end();
    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('Error fetching resources from database:', error); 
    await connection?.end();
    return NextResponse.json(
      { message: `Database error when fetching resources: ${error.message}`, errorDetails: error.code },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Role and userId are now obtained from middleware-injected headers
  const actingUserRoleFromHeader = request.headers.get('x-user-role') as Role | null;
  const uploaderUserIdFromHeaderString = request.headers.get('x-user-id');
  const uploaderUserIdFromHeader = uploaderUserIdFromHeaderString ? parseInt(uploaderUserIdFromHeaderString, 10) : null;

  if (!actingUserRoleFromHeader) {
    return NextResponse.json({ message: 'Rol de usuario no proporcionado en la cabecera.' }, { status: 403 });
  }

  if (actingUserRoleFromHeader !== 'administrador' && actingUserRoleFromHeader !== 'instructor') {
    return NextResponse.json(
      { message: 'Acción no permitida. Solo administradores o instructores pueden crear recursos.' },
      { status: 403 } 
    );
  }
  
  if (actingUserRoleFromHeader === 'instructor' && !uploaderUserIdFromHeader) {
    return NextResponse.json({ message: 'ID de usuario del instructor no disponible para la subida.' }, { status: 400 });
  }


  let connection;
  try {
    const body = await request.json();
    // uploaderUserId and actingUserRole are removed from schema validation as they come from headers
    const validationResult = CreateResourceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos del recurso inválidos.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, type, size, visibility, category } = validationResult.data;
    // uploaderUserId from body is ignored, use uploaderUserIdFromHeader

    const id = randomUUID();
    const uploadDate = new Date(); 
    const url = `#placeholder-url-for-${id}`; 

    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO resources (id, name, type, size, uploadDate, url, visibility, category, uploaderUserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, size, uploadDate, url, visibility, category, uploaderUserIdFromHeader || null]
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
      uploaderUserId: uploaderUserIdFromHeader || null,
      // actingUserRole: actingUserRoleFromHeader, // Not typically returned in the resource object itself from DB
    };

    return NextResponse.json(
      { message: 'Metadatos del recurso creados exitosamente.', resource: newResource },
      { status: 201 }
    );

  } catch (error: any) {
    await connection?.end();
    console.error('Error creating resource metadata:', error);
    if (error.code) { 
      return NextResponse.json(
        { message: 'Fallo al crear los metadatos del recurso en la base de datos.', error: error.message, code: error.code },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'Fallo al crear los metadatos del recurso debido a un error interno.', error: error.message },
      { status: 500 }
    );
  }
}
