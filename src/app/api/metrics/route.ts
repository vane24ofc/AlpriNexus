
// src/app/api/metrics/route.ts
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

export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role') as Role | null;

  if (userRole !== 'administrador') {
    return NextResponse.json({ message: 'Acción no autorizada. Se requiere rol de administrador.' }, { status: 403 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 1. Get total number of active users
    const [userRows] = await connection.execute("SELECT COUNT(*) as totalUsers FROM users WHERE status = 'active'");
    const totalUsers = (userRows as any[])[0].totalUsers || 0;

    // 2. Get number of active (approved) courses
    const [courseRows] = await connection.execute(
      "SELECT COUNT(*) as activeCourses FROM courses WHERE status = 'approved'"
    );
    const activeCourses = (courseRows as any[])[0].activeCourses || 0;

    // 3. Calculate Average Completion Rate
    const [completedEnrollmentsRows] = await connection.execute(`
      SELECT COUNT(ce.enrollmentId) as completedCount
      FROM course_enrollments ce
      JOIN courses c ON ce.courseId = c.id
      JOIN users u ON ce.userId = u.id
      WHERE c.status = 'approved' AND u.status = 'active' AND (ce.progressPercent = 100 OR ce.completedAt IS NOT NULL)
    `);
    const completedCount = (completedEnrollmentsRows as any[])[0].completedCount || 0;

    const [totalRelevantEnrollmentsRows] = await connection.execute(`
      SELECT COUNT(ce.enrollmentId) as totalCount
      FROM course_enrollments ce
      JOIN courses c ON ce.courseId = c.id
      JOIN users u ON ce.userId = u.id
      WHERE c.status = 'approved' AND u.status = 'active'
    `);
    const totalRelevantEnrollments = (totalRelevantEnrollmentsRows as any[])[0].totalCount || 0;

    let completionRate = "0%";
    if (totalRelevantEnrollments > 0) {
      completionRate = `${Math.round((completedCount / totalRelevantEnrollments) * 100)}%`;
    }
    
    // 4. Get number of new students registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' '); // Format for MySQL DATETIME/TIMESTAMP

    const [newStudentsRows] = await connection.execute(
      "SELECT COUNT(*) as newStudentsMonthly FROM users WHERE role = 'estudiante' AND status = 'active' AND createdAt >= ?",
      [thirtyDaysAgoISO]
    );
    const newStudentsMonthly = (newStudentsRows as any[])[0].newStudentsMonthly || 0;

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
