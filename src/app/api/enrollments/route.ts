// src/app/api/enrollments/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import * as z from 'zod';
import { randomUUID } from 'crypto';

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const CreateEnrollmentSchema = z.object({
  userId: z.number().int().positive({ message: "User ID must be a positive integer." }),
  courseId: z.string().uuid({ message: "Invalid Course ID format." }),
});

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const validationResult = CreateEnrollmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid enrollment data.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, courseId } = validationResult.data;
    const enrollmentId = randomUUID();

    connection = await mysql.createConnection(dbConfig);

    // Check if user exists (optional, but good practice)
    const [userRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if ((userRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Check if course exists (optional, but good practice)
    const [courseRows] = await connection.execute('SELECT id FROM courses WHERE id = ? AND status = "approved"', [courseId]);
    if ((courseRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ message: 'Approved course not found or not available for enrollment.' }, { status: 404 });
    }

    // Check if already enrolled
    const [existingEnrollment] = await connection.execute(
      'SELECT enrollmentId FROM course_enrollments WHERE userId = ? AND courseId = ?',
      [userId, courseId]
    );
    if ((existingEnrollment as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({ message: 'User is already enrolled in this course.' }, { status: 409 }); // 409 Conflict
    }

    await connection.execute(
      'INSERT INTO course_enrollments (enrollmentId, userId, courseId, progressPercent) VALUES (?, ?, ?, ?)',
      [enrollmentId, userId, courseId, 0] // Initial progress is 0
    );

    const newEnrollment = {
      enrollmentId,
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      completedAt: null,
      progressPercent: 0,
    };

    await connection.end();
    return NextResponse.json(
      { message: 'Successfully enrolled in course.', enrollment: newEnrollment },
      { status: 201 }
    );

  } catch (error: any) {
    await connection?.end();
    console.error('Error creating enrollment:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2' && error.message.includes('userId')) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2' && error.message.includes('courseId')) {
        return NextResponse.json({ message: 'Course not found for enrollment.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to enroll in course.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
