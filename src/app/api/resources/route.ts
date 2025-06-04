
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

const DUMMY_TOKEN_VALUE = 'secret-dummy-token-123';

// Zod schema for validating new resource input
const CreateResourceSchema = z.object({
  name: z.string().min(1, { message: "El nombre del archivo es requerido." }).max(255),
  type: z.string().min(1, { message: "El tipo de archivo es requerido." }).max(50),
  size: z.string().min(1, { message: "El tamaño del archivo es requerido." }).max(50),
  visibility: z.enum(['private', 'instructors', 'public']),
  category: z.enum(['company', 'learning']),
  uploaderUserId: z.number().int().positive().optional().nullable(),
  actingUserRole: z.enum(['administrador', 'instructor', 'estudiante'], {
    required_error: "El rol del usuario que realiza la acción es requerido.",
    invalid_type_error: "Rol de usuario inválido."
  }),
});

export async function GET(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ') || authorizationHeader.substring(7) !== DUMMY_TOKEN_VALUE) {
    return NextResponse.json({ message: 'No autorizado. Token inválido o ausente.' }, { status: 401 });
  }

  const actingUserRole = request.nextUrl.searchParams.get('actingUserRole') as 'administrador' | 'instructor' | 'estudiante' | null;

  if (!actingUserRole || !['administrador', 'instructor', 'estudiante'].includes(actingUserRole)) {
    return NextResponse.json({ message: 'Rol de usuario no proporcionado o inválido en la consulta.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    let query = 'SELECT * FROM resources';
    const queryParams: string[] = [];

    if (actingUserRole === 'estudiante') {
      query += ' WHERE visibility = ?';
      queryParams.push('public');
    } else if (actingUserRole === 'instructor') {
      // Instructores ven 'public' y 'instructors'. 
      // Podríamos añadir lógica para 'private' si el uploaderUserId coincide, pero lo mantenemos simple por ahora.
      query += ' WHERE visibility IN (?, ?)';
      queryParams.push('public', 'instructors');
    }
    // Administradores ven todo, no se añade cláusula WHERE.

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
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ') || authorizationHeader.substring(7) !== DUMMY_TOKEN_VALUE) {
    return NextResponse.json({ message: 'No autorizado. Token inválido o ausente.' }, { status: 401 });
  }

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

    const { name, type, size, visibility, category, uploaderUserId, actingUserRole } = validationResult.data;

    if (actingUserRole !== 'administrador' && actingUserRole !== 'instructor') {
      return NextResponse.json(
        { message: 'Acción no permitida. Solo administradores o instructores pueden crear recursos.' },
        { status: 403 } 
      );
    }

    const id = randomUUID();
    const uploadDate = new Date(); 
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
      actingUserRole, 
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
