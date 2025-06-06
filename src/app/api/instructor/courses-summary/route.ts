
// src/app/api/instructor/courses-summary/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import type { Course, Lesson } from '@/types/course'; // Asumiendo que Lesson se usa en Course

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

interface CourseWithStats extends Course {
  enrolledStudentsCount: number;
  averageCourseProgress: number;
}

export async function GET(request: NextRequest) {
  // El middleware ya debe haber verificado la autenticación y el rol.
  // Obtener el nombre del instructor desde las cabeceras inyectadas por el middleware.
  // Asumimos que userProfile.name está disponible como x-user-name.
  // Si se usa ID, sería x-user-id. Por ahora, usaremos el nombre.
  const instructorName = request.headers.get('x-user-name');
  const userRole = request.headers.get('x-user-role');

  if (userRole !== 'instructor' && userRole !== 'administrador') {
      // Aunque el middleware debería proteger esto, una doble verificación.
      // Administradores podrían tener acceso para ver resúmenes de instructores si se implementara.
      return NextResponse.json({ message: 'Acceso no autorizado para este resumen.' }, { status: 403 });
  }
  
  if (!instructorName && userRole === 'instructor') {
    return NextResponse.json({ message: 'Nombre del instructor no disponible para obtener sus cursos.' }, { status: 400 });
  }
  // Si es admin y no se provee instructorName, podría devolver todos o error.
  // Por ahora, este endpoint es para *el instructor logueado*.

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 1. Obtener los cursos creados por el instructor
    const [courseRows] = await connection.execute(
      'SELECT * FROM courses WHERE instructorName = ? ORDER BY createdAt DESC',
      [instructorName]
    );
    const courses = courseRows as Course[];

    if (courses.length === 0) {
      await connection.end();
      return NextResponse.json([]); // Devuelve un array vacío si no hay cursos
    }

    const coursesWithStats: CourseWithStats[] = [];

    for (const course of courses) {
      // 2. Obtener lecciones para cada curso (similar a /api/courses)
      const [lessonRows] = await connection.execute(
        'SELECT * FROM lessons WHERE courseId = ? ORDER BY orderIndex ASC, createdAt ASC;',
        [course.id]
      );
      const lessons = (lessonRows as any[]).map(lesson => ({
        ...lesson,
        quizOptions: typeof lesson.quizOptions === 'string' ? JSON.parse(lesson.quizOptions) : lesson.quizOptions,
      }));

      // 3. Calcular estadísticas de inscripción y progreso para cada curso
      const [statsRows] = await connection.execute(
        `SELECT 
           COUNT(DISTINCT ce.userId) as enrolledStudentsCount, 
           AVG(ce.progressPercent) as averageCourseProgress 
         FROM course_enrollments ce
         JOIN users u ON ce.userId = u.id
         WHERE ce.courseId = ? AND u.status = 'active'`,
        [course.id]
      );
      
      const stats = (statsRows as any[])[0];
      const enrolledStudentsCount = Number(stats?.enrolledStudentsCount) || 0;
      const averageCourseProgress = Number(stats?.averageCourseProgress) || 0;

      coursesWithStats.push({
        ...course,
        lessons,
        enrolledStudentsCount,
        averageCourseProgress: Math.round(averageCourseProgress), // Redondear el progreso promedio
      });
    }

    await connection.end();
    return NextResponse.json(coursesWithStats);

  } catch (error: any) {
    console.error('Error fetching instructor courses summary:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Failed to fetch instructor courses summary.', error: error.message },
      { status: 500 }
    );
  }
}
