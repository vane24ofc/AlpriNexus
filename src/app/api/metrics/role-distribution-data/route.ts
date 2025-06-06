
// src/app/api/metrics/role-distribution-data/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import type { Role } from '@/app/dashboard/layout'; // Import Role type

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

interface RoleDistributionRow {
  role: 'administrador' | 'instructor' | 'estudiante';
  value: number;
}

export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role') as Role | null;

  if (userRole !== 'administrador') {
    return NextResponse.json({ message: 'Acción no autorizada. Se requiere rol de administrador.' }, { status: 403 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT 
        role, 
        COUNT(*) as value
      FROM users
      WHERE status = 'active'
      GROUP BY role
      ORDER BY role ASC;
    `;
    
    const [rows] = await connection.execute(query);
    await connection.end();

    const results = (rows as RoleDistributionRow[]).map(row => ({
      role: row.role, // This will be 'administrador', 'instructor', 'estudiante'
      value: Number(row.value),
    }));
    
    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Error fetching role distribution data:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Failed to fetch role distribution data.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}

