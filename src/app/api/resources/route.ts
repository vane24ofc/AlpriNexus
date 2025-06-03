
// src/app/api/resources/route.ts
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

export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // TODO: En el futuro, podríamos añadir filtros por category, visibility, uploaderUserId
    // basados en query parameters y el rol del usuario haciendo la petición.
    const [rows] = await connection.execute('SELECT * FROM resources ORDER BY uploadDate DESC;');
    
    // El campo 'visibility' y 'category' son ENUM en la DB, se devuelven como strings.
    // El campo 'uploadDate' es DATETIME, se devolverá como string ISO o similar por el driver.
    // El frontend puede necesitar formatear 'uploadDate' y 'size' si se guarda INT para size.
    const resources = (rows as any[]).map(row => ({
      ...row,
      // Aseguramos que los booleanos sean booleanos si aplica, o que los números sean números.
      // Por ahora, la tabla está definida con VARCHAR y ENUMs que son strings.
    }));

    await connection.end();
    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Failed to fetch resources.', error: error.message },
      { status: 500 }
    );
  }
}

// POST (para subir archivos) y DELETE (para eliminar) se implementarán en futuros "poquitos".
// PUT (para actualizar metadata) también podría ser necesario.
