
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, PlusCircle, MessageSquare, BarChart, Star, Edit3 } from "lucide-react";
import Link from "next/link";
import type { Course } from '@/types/course'; // Assuming you have this type

// Simulación de cursos creados por el instructor actual (similar a MyCoursesPage)
const instructorSampleCourses: Course[] = [
  { id: 'instrCourse1', title: 'Desarrollo Web Full Stack con Next.js', description: 'Curso completo sobre Next.js.', thumbnailUrl: 'https://placehold.co/150x84.png', instructorName: 'Usuario Actual', status: 'approved', lessons: [{id: 'l1', title: 'Intro'}] },
  { id: 'instrCourse2', title: 'Bases de Datos NoSQL con MongoDB', description: 'Aprende MongoDB desde cero.', thumbnailUrl: 'https://placehold.co/150x84.png', instructorName: 'Usuario Actual', status: 'pending', lessons: [{id: 'l1', title: 'Intro'}] },
  { id: 'instrCourse3', title: 'Introducción al Diseño de Experiencia de Usuario (UX)', description: 'Principios básicos de UX.', thumbnailUrl: 'https://placehold.co/150x84.png', instructorName: 'Usuario Actual', status: 'rejected', lessons: [{id: 'l1', title: 'Intro'}] },
];


export default function InstructorDashboardPage() {
  const stats = [
    { title: "Mis Cursos", value: instructorSampleCourses.length.toString(), icon: BookOpen, link: "/dashboard/instructor/my-courses" },
    { title: "Estudiantes Totales", value: "350", icon: Users, link: "#" }, // Placeholder
    { title: "Revisiones Pendientes", value: instructorSampleCourses.filter(c => c.status === 'pending').length.toString(), icon: MessageSquare, link: "/dashboard/instructor/my-courses" },
    { title: "Calificación Promedio", value: "4.7/5", icon: BarChart, link: "#" }, // Placeholder
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Instructor</h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/courses/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Curso
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Button variant="link" size="sm" asChild className="px-0 -ml-1 text-primary">
                <Link href={stat.link}>Ver detalles</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Mis Cursos (Resumen)</CardTitle>
            <CardDescription>Un vistazo rápido a tus cursos y su estado.</CardDescription>
          </CardHeader>
          <CardContent>
            {instructorSampleCourses.length > 0 ? (
              <ul className="space-y-4">
                {instructorSampleCourses.slice(0, 3).map((course) => { // Mostrar solo los primeros 3 como resumen
                  const students = Math.floor(Math.random() * 200) + 50; // Placeholder
                  const progress = course.status === 'approved' ? (Math.floor(Math.random() * 50) + 50) : (course.status === 'pending' ? Math.floor(Math.random() * 30) : 0) ; // Placeholder
                  return (
                  <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{students} estudiantes inscritos</p>
                        <Badge 
                          variant={course.status === 'approved' ? 'default' : course.status === 'pending' ? 'secondary' : 'destructive'}
                          className={`mt-1 text-xs ${
                            course.status === 'approved' ? 'bg-accent text-accent-foreground' : 
                            course.status === 'pending' ? 'bg-yellow-500 text-white' : ''
                          }`}
                        >
                          {course.status === 'approved' ? 'Aprobado' : course.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/courses/${course.id}/edit`}>
                            <Edit3 className="mr-2 h-4 w-4" />Gestionar
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progreso promedio estudiantes (simulado): {progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${progress > 70 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aún no has creado cursos.</p>
            )}
            {instructorSampleCourses.length > 3 && (
                <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/dashboard/instructor/my-courses">Ver todos mis cursos</Link>
                </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Comentarios Recientes</CardTitle>
            <CardDescription>Últimos comentarios de los estudiantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { student: "Emily R.", course: "JS Avanzado", comment: "¡Excelente curso, muy detallado!", rating: 5, time: "hace 1h" },
                { student: "John B.", course: "Python DSA", comment: "Desafiante pero gratificante.", rating: 4, time: "hace 3h" },
                { student: "Sarah K.", course: "Intro UX", comment: "Necesita más ejemplos en el capítulo 3.", rating: 3, time: "Ayer" },
              ].map((feedback, index) => (
                <li key={index} className="text-sm border-b border-border pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{feedback.student} en <span className="text-primary">{feedback.course}</span></span>
                    <span className="text-xs text-muted-foreground">{feedback.time}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">&quot;{feedback.comment}&quot;</p>
                  <div className="flex items-center mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
