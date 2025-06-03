// src/app/api/lessons/[lessonId]/complete/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import * as z from 'zod';
import { randomUUID } from 'crypto';

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const CompleteLessonSchema = z.object({
  userId: z.number().int().positive({ message: "User ID must be a positive integer." }),
  courseId: z.string().uuid({ message: "Invalid Course ID format." }), // Required to associate completion with course
});

export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const lessonId = params.lessonId;
  if (!lessonId) {
    return NextResponse.json({ message: 'Lesson ID is required.' }, { status: 400 });
  }

  let connection;
  try {
    const body = await request.json();
    const validationResult = CompleteLessonSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid data for completing lesson.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, courseId } = validationResult.data;
    const completionId = randomUUID();

    connection = await mysql.createConnection(dbConfig);

    // Optional: Check if user, lesson, and course exist and if user is enrolled
    // For brevity, assuming these checks are handled or data is valid

    // Check if already completed to avoid duplicates (though DB unique constraint also handles this)
    const [existingCompletion] = await connection.execute(
      'SELECT completionId FROM lesson_completions WHERE userId = ? AND lessonId = ?',
      [userId, lessonId]
    );
    if ((existingCompletion as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({ message: 'Lesson already marked as completed by this user.' }, { status: 409 });
    }

    await connection.execute(
      'INSERT INTO lesson_completions (completionId, userId, lessonId, courseId) VALUES (?, ?, ?, ?)',
      [completionId, userId, lessonId, courseId]
    );

    const newCompletionRecord = {
      completionId,
      userId,
      lessonId,
      courseId,
      completedAt: new Date().toISOString(),
    };

    await connection.end();
    return NextResponse.json(
      { message: 'Lesson marked as completed successfully.', completion: newCompletionRecord },
      { status: 201 }
    );

  } catch (error: any) {
    await connection?.end();
    console.error(`Error marking lesson ${lessonId} as complete:`, error);
    // Handle specific MySQL errors, e.g., foreign key constraints
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      let missingEntity = "related record";
      if (error.message.includes('userId')) missingEntity = "user";
      else if (error.message.includes('lessonId')) missingEntity = "lesson";
      else if (error.message.includes('courseId')) missingEntity = "course";
      return NextResponse.json({ message: `Cannot complete lesson: ${missingEntity} not found or user not enrolled.` }, { status: 404 });
    }
    if (error.code === 'ER_DUP_ENTRY') { // Should be caught by the earlier check, but as a fallback
        return NextResponse.json({ message: 'Lesson already marked as completed by this user (DB constraint).' }, { status: 409 });
    }
    return NextResponse.json(
      { message: `Failed to mark lesson ${lessonId} as complete.`, error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
