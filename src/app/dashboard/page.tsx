
"use client";

import React from 'react';
import { useSessionRole } from '@/app/dashboard/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Settings, BarChart3, Bell, Zap, Award, CheckCircle, PlusCircle, MessageSquare, BarChart, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Admin Dashboard Content
const AdminDashboardContent = () => {
  const stats = [
    { title: "Usuarios Totales", value: "1,523", icon: Users, trend: "+5% desde el mes pasado" },
    { title: "Cursos Activos", value: "87", icon: BookOpen, trend: "+2 nuevos esta semana" },
    { title: "Salud del Sistema", value: "Óptima", icon: Settings, trend: "Todos los sistemas operativos" },
    { title: "Tasa de Participación", value: "78%", icon: BarChart3, trend: "Aumento del 3%" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Resumen de las actividades recientes de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { user: "Alice", action: "registró una nueva cuenta.", time: "hace 5m" },
                { user: "Bob (Instructor)", action: "publicó el curso 'IA Avanzada'.", time: "hace 1h" },
                { user: "Charlie", action: "completó 'Introducción a Python'.", time: "hace 2h" },
                { user: "System", action: "mantenimiento programado para mañana.", time: "hace 4h" },
              ].map((activity, index) => (
                <li key={index} className="flex items-center space-x-3 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{activity.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas administrativas comunes.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center" asChild>
                <Link href="/dashboard/admin/users">
                    <Users className="h-8 w-8 mb-2 text-primary"/>
                    <span className="font-medium">Gestionar Usuarios</span>
                </Link>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center" asChild>
                <Link href="/dashboard/admin/courses">
                    <BookOpen className="h-8 w-8 mb-2 text-primary"/>
                    <span className="font-medium">Gestionar Cursos</span>
                </Link>
            </Button>
             <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center">
                <Bell className="h-8 w-8 mb-2 text-accent"/>
                <span className="font-medium">Enviar Anuncio</span>
            </Button>
             <Button variant="outline" className="p-4 h-auto flex flex-col items-center text-center" asChild>
                <Link href="/dashboard/settings">
                    <Settings className="h-8 w-8 mb-2 text-muted-foreground"/>
                    <span className="font-medium">Configuración</span>
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Instructor Dashboard Content
const InstructorDashboardContent = () => {
  const stats = [
    { title: "Mis Cursos", value: "12", icon: BookOpen, link: "#" }, // Debería enlazar a /dashboard/instructor/my-courses
    { title: "Estudiantes Totales", value: "350", icon: Users, link: "#" }, // Debería enlazar a /dashboard/instructor/students
    { title: "Revisiones Pendientes", value: "8", icon: MessageSquare, link: "#" },
    { title: "Calificación Promedio", value: "4.7/5", icon: BarChart, link: "#" },
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
            <CardTitle>Mis Cursos Activos</CardTitle>
            <CardDescription>Resumen de tus cursos actualmente activos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                { id: "c1", name: "JavaScript Avanzado", students: 120, progress: 75, lastUpdate: "hace 2 días" },
                { id: "c2", name: "Estructuras de Datos en Python", students: 85, progress: 40, lastUpdate: "hace 5 días" },
                { id: "c3", name: "Fundamentos de Machine Learning", students: 145, progress: 60, lastUpdate: "Ayer" },
              ].map((course) => (
                <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.students} estudiantes inscritos</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#">Gestionar</Link>
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progreso: {course.progress}%</span>
                      <span>Última Actualización: {course.lastUpdate}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Comentarios Recientes de Estudiantes</CardTitle>
            <CardDescription>Últimos comentarios y calificaciones de los estudiantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { student: "Emily R.", course: "JS Avanzado", comment: "¡Excelente curso, muy detallado!", rating: 5, time: "hace 1h" },
                { student: "John B.", course: "Python DSA", comment: "Desafiante pero gratificante.", rating: 4, time: "hace 3h" },
                { student: "Sarah K.", course: "Intro ML", comment: "Necesita más ejemplos en el capítulo 3.", rating: 3, time: "Ayer" },
              ].map((feedback, index) => (
                <li key={index} className="text-sm border-b border-border pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{feedback.student} en <span className="text-primary">{feedback.course}</span></span>
                    <span className="text-xs text-muted-foreground">{feedback.time}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">&quot;{feedback.comment}&quot;</p>
                  <div className="flex items-center mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
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
};

// Student Dashboard Content
const StudentDashboardContent = () => {
  const enrolledCourses = [
    { id: "course1", name: "Introducción a la Programación", instructor: "Dr. Ada Lovelace", progress: 75, image: "https://placehold.co/600x300.png?text=Curso+1", dataAiHint: "programming course" },
    { id: "course2", name: "Bootcamp de Desarrollo Web", instructor: "Prof. Tim Berners-Lee", progress: 40, image: "https://placehold.co/600x300.png?text=Curso+2", dataAiHint: "web development" },
    { id: "course3", name: "Fundamentos de Ciencia de Datos", instructor: "Dr. Alan Turing", progress: 90, image: "https://placehold.co/600x300.png?text=Curso+3", dataAiHint: "data science" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mi Panel de Aprendizaje</h1>
      
      <Card className="shadow-xl bg-gradient-to-r from-primary/30 to-accent/30 border-primary/50">
        <CardHeader>
          <CardTitle className="text-2xl">Continuar Aprendiendo</CardTitle>
          <CardDescription>Retoma donde lo dejaste en tu curso más reciente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <Image src="https://placehold.co/300x170.png" alt="Curso Reciente" width={300} height={170} className="rounded-lg shadow-md object-cover" data-ai-hint="education learning"/>
          <div>
            <h3 className="text-xl font-semibold">Técnicas Avanzadas de JavaScript</h3>
            <p className="text-sm text-muted-foreground mb-1">Capítulo 5: Programación Asíncrona</p>
            <div className="w-full bg-muted rounded-full h-2.5 mb-3">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `60%` }}></div>
            </div>
            <Button asChild>
              <Link href="#">Reanudar Curso <Zap className="ml-2 h-4 w-4"/></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Mis Cursos Inscritos</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow">
              <Image src={course.image} alt={course.name} width={600} height={300} className="w-full h-48 object-cover" data-ai-hint={course.dataAiHint} />
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
                <CardDescription>Por {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progreso</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full ${course.progress === 100 ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${course.progress}%` }}></div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full mt-4">
                  <Link href="#">{course.progress === 100 ? 'Ver Certificado' : 'Continuar Aprendiendo'}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Progreso General</CardTitle>
            <CardDescription>Tus estadísticas de aprendizaje.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span>Cursos Completados:</span> <span className="font-semibold">3</span></div>
            <div className="flex justify-between items-center"><span>Certificados Obtenidos:</span> <span className="font-semibold">2</span></div>
            <div className="flex justify-between items-center"><span>Puntuación Promedio:</span> <span className="font-semibold">88%</span></div>
            <Button variant="secondary" className="w-full mt-2">Ver Estadísticas Detalladas</Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Award className="mr-2 h-5 w-5 text-accent" />Logros e Insignias</CardTitle>
            <CardDescription>Hitos que has desbloqueado.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-center justify-center">
            {['Maestro del Curso', 'Aprendiz Rápido', 'Mejor Rendimiento', 'Estudiante Dedicado'].map(achievement => (
              <div key={achievement} className="flex flex-col items-center p-3 bg-muted rounded-lg w-28 text-center">
                <CheckCircle className="h-8 w-8 text-accent mb-1" />
                <span className="text-xs font-medium">{achievement}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default function DashboardHomePage() {
  const { currentSessionRole } = useSessionRole();

  if (!currentSessionRole) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando panel...</p>
      </div>
    );
  }

  switch (currentSessionRole) {
    case 'administrador':
      return <AdminDashboardContent />;
    case 'instructor':
      return <InstructorDashboardContent />;
    case 'estudiante':
      return <StudentDashboardContent />;
    default:
      // Fallback or a generic welcome if role is somehow not set or unexpected
      return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenido a AlpriNexus</h1>
            <p>Tu panel de control se está cargando o no se ha reconocido tu rol.</p>
          </div>
      );
  }
}

// Helper para iconos de estrella (si es necesario, ya que InstructorDashboard lo usa)
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}
