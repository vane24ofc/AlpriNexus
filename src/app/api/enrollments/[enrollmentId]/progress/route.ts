// src/app/api/enrollments/[enrollmentId]/progress/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import * as z from 'zod';

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const UpdateProgressSchema = z.object({
  progressPercent: z.number().int().min(0).max(100, { message: "El porcentaje de progreso debe estar entre 0 y 100." }),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  const enrollmentId = params.enrollmentId;
  if (!enrollmentId) {
    return NextResponse.json({ message: 'ID de inscripción es requerido.' }, { status: 400 });
  }

  let connection;
  try {
    const body = await request.json();
    const validationResult = UpdateProgressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos de progreso inválidos.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { progressPercent } = validationResult.data;

    connection = await mysql.createConnection(dbConfig);

    // Check if enrollment exists
    const [enrollmentRows] = await connection.execute(
      'SELECT enrollmentId FROM course_enrollments WHERE enrollmentId = ?',
      [enrollmentId]
    );
    if ((enrollmentRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ message: 'Inscripción no encontrada.' }, { status: 404 });
    }

    let completedAt = null;
    if (progressPercent === 100) {
      completedAt = new Date(); // Set completion date if progress is 100%
    }

    const [result] = await connection.execute(
      'UPDATE course_enrollments SET progressPercent = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE enrollmentId = ?',
      [progressPercent, completedAt, enrollmentId]
    );
    
    const updateResult = result as mysql.ResultSetHeader;

    if (updateResult.affectedRows > 0) {
      // Fetch the updated enrollment record to return
      const [updatedEnrollmentRows] = await connection.execute(
        'SELECT * FROM course_enrollments WHERE enrollmentId = ?',
        [enrollmentId]
      );
      await connection.end();
      const updatedEnrollment = (updatedEnrollmentRows as any[])[0];
      return NextResponse.json({
        message: 'Progreso actualizado exitosamente.',
        enrollment: updatedEnrollment,
      });
    } else {
      await connection.end();
      // This case should ideally not be reached if the enrollment was found earlier
      return NextResponse.json({ message: 'No se pudo actualizar el progreso o inscripción no encontrada.' }, { status: 404 });
    }

  } catch (error: any) {
    await connection?.end();
    console.error(`Error actualizando progreso para la inscripción ${enrollmentId}:`, error);
    return NextResponse.json(
      { message: `Fallo al actualizar el progreso para la inscripción ${enrollmentId}.`, error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
