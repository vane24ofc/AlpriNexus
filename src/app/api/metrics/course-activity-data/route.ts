
// src/app/api/metrics/course-activity-data/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import type { Role } from '@/app/dashboard/layout'; // Import Role type

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

interface CourseActivityRow {
  name: string; // Course title
  inscritos: number;
  completados: number;
}

export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role') as Role | null;

  if (userRole !== 'administrador') {
    return NextResponse.json({ message: 'Acción no autorizada. Se requiere rol de administrador.' }, { status: 403 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Query to get top 7 approved courses by number of active enrolled students,
    // and the number of those active students who completed the course.
    const query = `
      SELECT
          c.title AS name,
          (SELECT COUNT(*)
           FROM course_enrollments ce_inner
           JOIN users u_inner ON ce_inner.userId = u_inner.id
           WHERE ce_inner.courseId = c.id AND u_inner.status = 'active'
          ) AS inscritos,
          (SELECT COUNT(*)
           FROM course_enrollments ce_inner
           JOIN users u_inner ON ce_inner.userId = u_inner.id
           WHERE ce_inner.courseId = c.id AND u_inner.status = 'active' AND (ce_inner.progressPercent = 100 OR ce_inner.completedAt IS NOT NULL)
          ) AS completados
      FROM courses c
      WHERE c.status = 'approved'
      ORDER BY inscritos DESC
      LIMIT 7;
    `;
    
    const [rows] = await connection.execute(query);
    await connection.end();

    const results = (rows as CourseActivityRow[]).map(row => ({
      name: row.name,
      inscritos: Number(row.inscritos), // Ensure numbers are treated as numbers
      completados: Number(row.completados),
    }));
    
    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Error fetching course activity data:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Failed to fetch course activity data.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}

