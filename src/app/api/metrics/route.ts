
// src/app/api/metrics/route.ts
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

const DUMMY_TOKEN_VALUE = 'secret-dummy-token-123';

export async function GET(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ') || authorizationHeader.substring(7) !== DUMMY_TOKEN_VALUE) {
    return NextResponse.json({ message: 'No autorizado. Token inválido o ausente.' }, { status: 401 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 1. Get total number of users
    const [userRows] = await connection.execute('SELECT COUNT(*) as totalUsers FROM users');
    const totalUsers = (userRows as any[])[0].totalUsers || 0;

    // 2. Get number of active (approved) courses
    const [courseRows] = await connection.execute(
      "SELECT COUNT(*) as activeCourses FROM courses WHERE status = 'approved'"
    );
    const activeCourses = (courseRows as any[])[0].activeCourses || 0;

    // Metrics to be expanded in next steps
    const completionRate = "0%"; // Placeholder
    const newStudentsMonthly = 0; // Placeholder

    await connection.end();

    return NextResponse.json({
      totalUsers,
      activeCourses,
      completionRate,
      newStudentsMonthly,
    });

  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Failed to fetch metrics.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
