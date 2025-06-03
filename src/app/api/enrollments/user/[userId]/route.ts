// src/app/api/enrollments/user/[userId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = parseInt(params.userId, 10);

  if (isNaN(userId) || userId <= 0) {
    return NextResponse.json({ message: 'Invalid User ID provided.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Query to get enrollments and join with course details
    const query = `
      SELECT 
        ce.enrollmentId, 
        ce.userId, 
        ce.courseId, 
        ce.enrolledAt, 
        ce.completedAt,
        ce.progressPercent,
        c.title as courseTitle,
        c.description as courseDescription,
        c.thumbnailUrl as courseThumbnailUrl,
        c.instructorName as courseInstructorName,
        c.status as courseStatus,
        c.dataAiHint as courseDataAiHint
      FROM course_enrollments ce
      JOIN courses c ON ce.courseId = c.id
      WHERE ce.userId = ? AND c.status = 'approved'
      ORDER BY ce.enrolledAt DESC;
    `;
    
    const [rows] = await connection.execute(query, [userId]);
    
    const enrollments = (rows as any[]).map(row => ({
        enrollmentId: row.enrollmentId,
        userId: row.userId,
        courseId: row.courseId,
        enrolledAt: row.enrolledAt,
        completedAt: row.completedAt,
        progressPercent: row.progressPercent,
        course: { // Nest course details under a 'course' object
            id: row.courseId,
            title: row.courseTitle,
            description: row.courseDescription,
            thumbnailUrl: row.courseThumbnailUrl,
            instructorName: row.courseInstructorName,
            status: row.courseStatus,
            dataAiHint: row.courseDataAiHint,
            // Note: lessons are not included here for performance,
            // they'll be fetched when viewing a specific course.
        }
    }));

    await connection.end();
    return NextResponse.json(enrollments);

  } catch (error: any) {
    await connection?.end();
    console.error(`Error fetching enrollments for user ${userId}:`, error);
    return NextResponse.json(
      { message: `Failed to fetch enrollments for user ${userId}.`, error: error.message },
      { status: 500 }
    );
  }
}
