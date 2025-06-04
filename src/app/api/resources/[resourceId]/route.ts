
// src/app/api/resources/[resourceId]/route.ts
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

// DUMMY_TOKEN_VALUE - Usaremos el mismo que en otros endpoints
const DUMMY_TOKEN_VALUE = 'secret-dummy-token-123';

// Zod schema for validating resource updates
const UpdateResourceSchema = z.object({
  name: z.string().min(1, { message: "El nombre del archivo es requerido." }).max(255).optional(),
  visibility: z.enum(['private', 'instructors', 'public']).optional(),
  category: z.enum(['company', 'learning']).optional(),
  actingUserRole: z.enum(['administrador', 'instructor', 'estudiante'], {
    required_error: "El rol del usuario que realiza la acción es requerido.",
    invalid_type_error: "Rol de usuario inválido."
  }).optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { resourceId: string } }
) {
    const resourceId = params.resourceId;
    if (!resourceId) {
        return NextResponse.json({ message: 'ID del recurso es requerido.' }, { status: 400 });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM resources WHERE id = ?',
            [resourceId]
        );
        await connection.end();

        const resources = rows as any[];
        if (resources.length === 0) {
            return NextResponse.json({ message: 'Recurso no encontrado.' }, { status: 404 });
        }
        return NextResponse.json(resources[0]);
    } catch (error: any) {
        console.error(`Error obteniendo recurso ${resourceId}:`, error);
        await connection?.end();
        return NextResponse.json(
            { message: `Fallo al obtener el recurso ${resourceId}.`, error: error.message, code: error.code },
            { status: 500 }
        );
    }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  const resourceId = params.resourceId;
  if (!resourceId) {
    return NextResponse.json({ message: 'ID del recurso es requerido.' }, { status: 400 });
  }

  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ') || authorizationHeader.substring(7) !== DUMMY_TOKEN_VALUE) {
    return NextResponse.json({ message: 'No autorizado. Token inválido o ausente.' }, { status: 401 });
  }

  let connection;
  try {
    const body = await request.json();
    const validationResult = UpdateResourceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos del recurso inválidos para actualizar.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, visibility, category, actingUserRole } = validationResult.data;

    if (!actingUserRole || (actingUserRole !== 'administrador' && actingUserRole !== 'instructor')) {
      return NextResponse.json(
        { message: 'Acción no permitida. Solo administradores o instructores pueden actualizar recursos.' },
        { status: 403 }
      );
    }

    if (!name && !visibility && !category) {
      return NextResponse.json({ message: 'No se proporcionaron campos para actualizar.' }, { status: 400 });
    }

    const updateFields: string[] = [];
    const values: (string | undefined)[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (visibility !== undefined) {
      updateFields.push('visibility = ?');
      values.push(visibility);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      values.push(category);
    }

    values.push(resourceId);

    connection = await mysql.createConnection(dbConfig);
    const query = `UPDATE resources SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await connection.execute(query, values);
    
    const updateResult = result as mysql.ResultSetHeader;
    if (updateResult.affectedRows > 0) {
      const [updatedRows] = await connection.execute('SELECT * FROM resources WHERE id = ?', [resourceId]);
      await connection.end();
      const updatedResource = (updatedRows as any[])[0];
      return NextResponse.json({ message: 'Recurso actualizado exitosamente.', resource: updatedResource });
    } else {
      await connection.end();
      return NextResponse.json({ message: 'Recurso no encontrado o ningún dato cambiado.' }, { status: 404 });
    }

  } catch (error: any) {
    await connection?.end();
    console.error(`Error actualizando recurso ${resourceId}:`, error);
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
            { message: 'Fallo al actualizar. El nombre ya existe para otro recurso.', error: error.message, code: error.code },
            { status: 409 }
        );
    }
    return NextResponse.json(
      { message: `Fallo al actualizar el recurso ${resourceId}.`, error: error.message, code: error.code },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  const resourceId = params.resourceId;
  if (!resourceId) {
    return NextResponse.json({ message: 'ID del recurso es requerido.' }, { status: 400 });
  }

  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ') || authorizationHeader.substring(7) !== DUMMY_TOKEN_VALUE) {
    return NextResponse.json({ message: 'No autorizado. Token inválido o ausente.' }, { status: 401 });
  }

  const actingUserRole = request.nextUrl.searchParams.get('actingUserRole');

  if (!actingUserRole) {
    return NextResponse.json({ message: 'El rol del usuario es requerido para esta acción.' }, { status: 400 });
  }

  if (actingUserRole !== 'administrador' && actingUserRole !== 'instructor') {
    return NextResponse.json(
      { message: 'Acción no permitida. Solo administradores o instructores pueden eliminar recursos.' },
      { status: 403 }
    );
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM resources WHERE id = ?',
      [resourceId]
    );
    await connection.end();

    const deleteResult = result as mysql.ResultSetHeader;
    if (deleteResult.affectedRows > 0) {
      return NextResponse.json({ message: 'Recurso eliminado exitosamente.' });
    } else {
      return NextResponse.json({ message: 'Recurso no encontrado.' }, { status: 404 });
    }
  } catch (error: any) {
    await connection?.end();
    console.error(`Error eliminando recurso ${resourceId}:`, error);
    return NextResponse.json(
      { message: `Fallo al eliminar el recurso ${resourceId}.`, error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
