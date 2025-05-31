
// src/app/api/courses/route.ts
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

// Zod schema for validating lesson input when creating a course
const LessonInputSchema = z.object({
  title: z.string().min(3, { message: "Lesson title must be at least 3 characters." }),
  contentType: z.enum(['text', 'video', 'quiz']).default('text'),
  content: z.string().optional().nullable(),
  videoUrl: z.string().url({ message: "Invalid video URL format." }).optional().or(z.literal('')).nullable(),
  quizPlaceholder: z.string().optional().nullable(),
  quizOptions: z.array(z.string()).optional().nullable(),
  correctQuizOptionIndex: z.number().int().min(0).optional().nullable(),
}).refine(data => {
  if (data.contentType === 'video' && (!data.videoUrl || data.videoUrl.trim() === '')) {
    return false; // Video URL is required for video content type
  }
  if (data.contentType === 'quiz') {
    const optionsCount = data.quizOptions?.filter(opt => opt.trim() !== '').length || 0;
    if (optionsCount < 2) return false; // Must have at least 2 options for a quiz
    if (data.correctQuizOptionIndex === undefined || data.correctQuizOptionIndex === null || data.correctQuizOptionIndex < 0 || data.correctQuizOptionIndex >= optionsCount) {
      return false; // Correct option index must be valid
    }
  }
  return true;
}, {
  message: "Invalid lesson data. For video, URL is required. For quiz, at least 2 options and a valid correct answer are required.",
  // Path can be refined if more specific error reporting per field is needed later
  path: ['contentType'], 
});

// Zod schema for validating new course input
const CreateCourseInputSchema = z.object({
  title: z.string().min(5, { message: "Course title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Course description must be at least 20 characters." }),
  thumbnailUrl: z.string().url({ message: "Invalid thumbnail URL." }).optional().nullable().or(z.literal('')),
  instructorName: z.string().min(2, { message: "Instructor name must be at least 2 characters." }), // This might come from session later
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  interactiveContent: z.string().optional().nullable(),
  dataAiHint: z.string().optional().nullable(),
  lessons: z.array(LessonInputSchema).min(1, { message: "A course must have at least one lesson." }),
});

// GET handler to fetch all courses with their lessons
export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [courseRows] = await connection.execute('SELECT * FROM courses ORDER BY createdAt DESC;');
    
    const courses = courseRows as any[];
    const coursesWithLessons = [];

    for (const course of courses) {
      const [lessonRows] = await connection.execute(
        'SELECT * FROM lessons WHERE courseId = ? ORDER BY orderIndex ASC, createdAt ASC;',
        [course.id]
      );
      const lessons = lessonRows as any[];
      // Parse quizOptions if they exist
      const processedLessons = lessons.map(lesson => ({
        ...lesson,
        quizOptions: typeof lesson.quizOptions === 'string' ? JSON.parse(lesson.quizOptions) : lesson.quizOptions,
      }));
      coursesWithLessons.push({ ...course, lessons: processedLessons });
    }
    
    await connection.end();
    return NextResponse.json(coursesWithLessons);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Failed to fetch courses.', error: error.message },
      { status: 500 }
    );
  }
}

// POST handler to create a new course with its lessons
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const validationResult = CreateCourseInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid course data.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { lessons, ...courseData } = validationResult.data;
    const courseId = randomUUID();

    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    await connection.execute(
      'INSERT INTO courses (id, title, description, thumbnailUrl, instructorName, status, interactiveContent, dataAiHint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        courseId,
        courseData.title,
        courseData.description,
        courseData.thumbnailUrl || 'https://placehold.co/600x400.png',
        courseData.instructorName,
        courseData.status,
        courseData.interactiveContent || null,
        courseData.dataAiHint || null,
      ]
    );

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const lessonId = randomUUID();
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
          lesson.correctQuizOptionIndex !== undefined ? lesson.correctQuizOptionIndex : null,
          i, // Use array index as orderIndex
        ]
      );
    }

    await connection.commit();
    await connection.end();

    // For the response, fetch the newly created course with its lessons to confirm
    // This is optional but good for confirmation
    const createdCourseWithLessons = {
      id: courseId,
      ...courseData,
      lessons: lessons.map((l, index) => ({
        ...l,
        id: `temp-lesson-id-${index}`, // Placeholder, real IDs are in DB
        courseId: courseId,
        orderIndex: index,
        quizOptions: l.quizOptions || undefined // Ensure it matches structure if parsed later
      })),
      createdAt: new Date().toISOString(), // Approximate
      updatedAt: new Date().toISOString(), // Approximate
    };


    return NextResponse.json(
      { message: 'Course created successfully.', course: createdCourseWithLessons },
      { status: 201 }
    );

  } catch (error: any) {
    await connection?.rollback();
    await connection?.end();
    console.error('Error creating course:', error);
    return NextResponse.json(
      { message: 'Failed to create course.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
