
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit3, BarChart2, PlusCircle, AlertTriangle, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import type { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Simulación de cursos creados por el instructor actual
const sampleInstructorCourses: Course[] = [
  { id: 'instrCourse1', title: 'Desarrollo Web Full Stack con Next.js', description: 'Curso completo sobre Next.js.', thumbnailUrl: 'https://placehold.co/150x84.png', dataAiHint: 'nextjs web', instructorName: 'Usuario Actual', status: 'approved', lessons: [{id: 'l1', title: 'Intro'}] },
  { id: 'instrCourse2', title: 'Bases de Datos NoSQL con MongoDB', description: 'Aprende MongoDB desde cero.', thumbnailUrl: 'https://placehold.co/150x84.png', dataAiHint: 'mongodb database', instructorName: 'Usuario Actual', status: 'pending', lessons: [{id: 'l1', title: 'Intro'}] },
  { id: 'instrCourse3', title: 'Introducción al Diseño de Experiencia de Usuario (UX)', description: 'Principios básicos de UX.', thumbnailUrl: 'https://placehold.co/150x84.png', dataAiHint: 'ux design', instructorName: 'Usuario Actual', status: 'rejected', lessons: [{id: 'l1', title: 'Intro'}] },
  { id: 'instrCourse4', title: 'Marketing de Contenidos para Redes Sociales', description: 'Estrategias de contenido efectivas.', thumbnailUrl: 'https://placehold.co/150x84.png', dataAiHint: 'social media marketing', instructorName: 'Usuario Actual', status: 'approved', lessons: [{id: 'l1', title: 'Intro'}] },
];

type CourseStatus = 'pending' | 'approved' | 'rejected';
interface StatusInfo {
  text: string;
  icon: React.ElementType;
  variant: "default" | "secondary" | "destructive" | "outline" | null | undefined;
  className: string;
}


export default function MyCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>(sampleInstructorCourses);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const getStatusInfo = (status: CourseStatus): StatusInfo => {
    switch (status) {
      case 'approved':
        return { text: 'Aprobado', icon: CheckCircle, variant: 'default', className: 'bg-accent text-accent-foreground hover:bg-accent/90' };
      case 'pending':
        return { text: 'Pendiente de Revisión', icon: AlertTriangle, variant: 'default', className: 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500' };
      case 'rejected':
        return { text: 'Rechazado', icon: XCircle, variant: 'destructive', className: '' };
      default:
        return { text: 'Desconocido', icon: AlertTriangle, variant: 'secondary', className: 'bg-gray-500 text-white' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          Mis Cursos Creados
        </h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/courses/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Curso
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Listado de Mis Cursos</CardTitle>
          <CardDescription>Gestiona los cursos que has creado y enviado para revisión.</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aún no has creado ningún curso. ¡Empieza creando uno nuevo!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell w-[100px]">Miniatura</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Estudiantes</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => {
                  const statusInfo = getStatusInfo(course.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="hidden md:table-cell">
                        <Image 
                          src={course.thumbnailUrl} 
                          alt={course.title} 
                          width={80} 
                          height={45} 
                          className="rounded-md object-cover" 
                          data-ai-hint={course.dataAiHint || "course thumbnail education"}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                         <Link href={`/dashboard/courses/${course.id}/view`} className="hover:underline text-primary">{course.title}</Link>
                        <p className="text-xs text-muted-foreground md:hidden">{statusInfo.text}</p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={statusInfo.variant} className={statusInfo.className}>
                          <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {Math.floor(Math.random() * 200)} {/* Placeholder student count */}
                      </TableCell>
                      <TableCell className="text-right space-x-1 md:space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/courses/${course.id}/view`} title="Ver Curso">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                           <Link href={`/dashboard/courses/${course.id}/edit`} title="Editar Curso">
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="Estadísticas" onClick={() => setIsStatsModalOpen(true)}>
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estadísticas del Curso</AlertDialogTitle>
            <AlertDialogDescription>
              Esta funcionalidad estará disponible próximamente. Aquí podrás ver el rendimiento y la participación de tus estudiantes en este curso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsStatsModalOpen(false)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
