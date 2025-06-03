// src/app/api/courses/[courseId]/user/[userId]/completed-lessons/route.ts
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
  { params }: { params: { courseId: string; userId: string } }
) {
  const { courseId, userId: userIdStr } = params;
  const userId = parseInt(userIdStr, 10);

  if (!courseId) {
    return NextResponse.json({ message: 'Course ID is required.' }, { status: 400 });
  }
  if (isNaN(userId) || userId <= 0) {
    return NextResponse.json({ message: 'Invalid User ID provided.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT lessonId FROM lesson_completions WHERE userId = ? AND courseId = ?',
      [userId, courseId]
    );
    
    const completedLessonIds = (rows as any[]).map(row => row.lessonId);
    
    await connection.end();
    return NextResponse.json(completedLessonIds);

  } catch (error: any) {
    await connection?.end();
    console.error(`Error fetching completed lessons for user ${userId} in course ${courseId}:`, error);
    return NextResponse.json(
      { message: `Failed to fetch completed lessons.`, error: error.message },
      { status: 500 }
    );
  }
}
