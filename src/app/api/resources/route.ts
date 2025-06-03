
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
    const [rows] = await connection.execute('SELECT * FROM resources ORDER BY uploadDate DESC;');
    
    const resources = (rows as any[]).map(row => ({
      ...row,
    }));

    await connection.end();
    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('Error fetching resources from database:', error); // Log del error en el servidor
    await connection?.end();
    // Mensaje de error más específico
    return NextResponse.json(
      { message: `Database error when fetching resources: ${error.message}`, errorDetails: error.code },
      { status: 500 }
    );
  }
}

