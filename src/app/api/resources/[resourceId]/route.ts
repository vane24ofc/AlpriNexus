
// src/app/api/resources/[resourceId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

export async function DELETE(
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
