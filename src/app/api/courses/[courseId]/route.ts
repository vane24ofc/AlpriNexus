
// src/app/api/courses/[courseId]/route.ts
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

// Zod schema for validating lesson input when updating a course
const UpdateLessonInputSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new lessons during update
  title: z.string().min(3, { message: "Lesson title must be at least 3 characters." }),
  contentType: z.enum(['text', 'video', 'quiz']).default('text'),
  content: z.string().optional().nullable(),
  videoUrl: z.string().url({ message: "Invalid video URL format." }).optional().or(z.literal('')).nullable(),
  quizPlaceholder: z.string().optional().nullable(),
  quizOptions: z.array(z.string()).optional().nullable(),
  correctQuizOptionIndex: z.number().int().min(0).optional().nullable(),
}).refine(data => {
  if (data.contentType === 'video' && (!data.videoUrl || data.videoUrl.trim() === '')) {
    return false;
  }
  if (data.contentType === 'quiz') {
    const optionsCount = data.quizOptions?.filter(opt => opt.trim() !== '').length || 0;
    if (optionsCount < 2) return false;
    if (data.correctQuizOptionIndex === undefined || data.correctQuizOptionIndex === null || data.correctQuizOptionIndex < 0 || data.correctQuizOptionIndex >= optionsCount) {
      return false;
    }
  }
  return true;
}, {
  message: "Invalid lesson data for update. For video, URL is required. For quiz, at least 2 options and a valid correct answer are required.",
  path: ['contentType'],
});


// Zod schema for validating course updates (all fields optional for partial updates, lessons are fully replaced if provided)
const UpdateCourseInputSchema = z.object({
  title: z.string().min(5, { message: "Course title must be at least 5 characters." }).optional(),
  description: z.string().min(20, { message: "Course description must be at least 20 characters." }).optional(),
  thumbnailUrl: z.string().url({ message: "Invalid thumbnail URL." }).optional().nullable().or(z.literal('')),
  instructorName: z.string().min(2, { message: "Instructor name must be at least 2 characters." }).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  interactiveContent: z.string().optional().nullable(),
  dataAiHint: z.string().optional().nullable(),
  lessons: z.array(UpdateLessonInputSchema).optional(), // If lessons are provided, they replace existing ones
});


// GET handler to fetch a single course by ID with its lessons
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const courseId = params.courseId;
  if (!courseId) {
    return NextResponse.json({ message: 'Invalid course ID provided.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [courseRows] = await connection.execute(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );
    
    const courses = courseRows as any[];
    if (courses.length === 0) {
      return NextResponse.json({ message: 'Course not found.' }, { status: 404 });
    }
    const course = courses[0];

    const [lessonRows] = await connection.execute(
      'SELECT * FROM lessons WHERE courseId = ? ORDER BY orderIndex ASC, createdAt ASC;',
      [courseId]
    );
    const lessons = (lessonRows as any[]).map(lesson => ({
      ...lesson,
      quizOptions: typeof lesson.quizOptions === 'string' ? JSON.parse(lesson.quizOptions) : lesson.quizOptions,
    }));
    
    await connection.end();
    return NextResponse.json({ ...course, lessons });

  } catch (error: any) {
    console.error(`Error fetching course ${courseId}:`, error);
    await connection?.end();
    return NextResponse.json(
      { message: `Failed to fetch course ${courseId}.`, error: error.message },
      { status: 500 }
    );
  }
}

// PUT handler to update an existing course and its lessons
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const courseId = params.courseId;
  if (!courseId) {
    return NextResponse.json({ message: 'Invalid course ID provided.' }, { status: 400 });
  }

  let connection;
  try {
    const body = await request.json();
    const validationResult = UpdateCourseInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid course data for update.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { lessons, ...courseDataToUpdate } = validationResult.data;

    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // Update course details if any are provided
    const courseFields = Object.keys(courseDataToUpdate)
      .filter(key => courseDataToUpdate[key as keyof typeof courseDataToUpdate] !== undefined);
    
    if (courseFields.length > 0) {
      const setClauses = courseFields.map(field => `${field} = ?`).join(', ');
      const values = courseFields.map(field => courseDataToUpdate[field as keyof typeof courseDataToUpdate]);
      values.push(courseId);
      await connection.execute(`UPDATE courses SET ${setClauses}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values);
    }

    // If lessons are provided in the update, delete all existing lessons and insert new ones
    if (lessons && lessons.length > 0) {
      await connection.execute('DELETE FROM lessons WHERE courseId = ?', [courseId]);
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const lessonId = lesson.id || randomUUID(); // Use existing ID or generate new if not provided (for full replacement)
        await connection.execute(
          'INSERT INTO lessons (id, courseId, title, contentType, content, videoUrl, quizPlaceholder, quizOptions, correctQuizOptionIndex, orderIndex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            lessonId,
            courseId,
            lesson.title,
            lesson.contentType,
            lesson.content || null,
            lesson.videoUrl || null,
            lesson.quizPlaceholder || null,
            lesson.quizOptions ? JSON.stringify(lesson.quizOptions) : null,
            lesson.correctQuizOptionIndex !== undefined && lesson.correctQuizOptionIndex !== null ? lesson.correctQuizOptionIndex : null,
            i,
          ]
        );
      }
    } else if (lessons && lessons.length === 0) { // If an empty lessons array is provided, delete all lessons
        await connection.execute('DELETE FROM lessons WHERE courseId = ?', [courseId]);
    }
    // If 'lessons' key is not in body, existing lessons are not touched.

    await connection.commit();
    await connection.end();

    // Fetch the updated course to return it
    const response = await GET(request, { params: { courseId } });
    const updatedCourse = await response.json();

    return NextResponse.json({ message: 'Course updated successfully.', course: updatedCourse });

  } catch (error: any) {
    await connection?.rollback();
    await connection?.end();
    console.error(`Error updating course ${courseId}:`, error);
    return NextResponse.json(
      { message: `Failed to update course ${courseId}.`, error: error.message, code: error.code },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a course (lessons will be cascaded by DB foreign key constraint)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const courseId = params.courseId;
  if (!courseId) {
    return NextResponse.json({ message: 'Invalid course ID provided.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('DELETE FROM courses WHERE id = ?', [courseId]);
    await connection.end();

    const deleteResult = result as mysql.ResultSetHeader;
    if (deleteResult.affectedRows > 0) {
      return NextResponse.json({ message: 'Course and its lessons deleted successfully.' });
    } else {
      return NextResponse.json({ message: 'Course not found.' }, { status: 404 });
    }
  } catch (error: any) {
    await connection?.end();
    console.error(`Error deleting course ${courseId}:`, error);
    // Foreign key errors shouldn't happen for course deletion itself if lessons cascade,
    // but other errors are possible.
    return NextResponse.json(
      { message: `Failed to delete course ${courseId}.`, error: error.message, code: error.code },
      { status: 500 }
    );
  }
}

