
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BookOpen, CheckCircle, XCircle, AlertTriangle, Edit3, Eye, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

const sampleCourses: Course[] = [
  { id: 'course1', title: 'Fundamentos de JavaScript Moderno', description: 'Aprende JS desde cero.', thumbnailUrl: 'https://placehold.co/150x84.png?text=JS', instructorName: 'Instructor A', status: 'pending', lessons: [{id: 'l1', title: 'Intro'}]},
  { id: 'course2', title: 'Python para Ciencia de Datos', description: 'Análisis y visualización.', thumbnailUrl: 'https://placehold.co/150x84.png?text=Python', instructorName: 'Instructor B', status: 'pending', lessons: [{id: 'l1', title: 'Intro'}]},
  { id: 'course3', title: 'Diseño UX/UI para Principiantes', description: 'Crea interfaces intuitivas.', thumbnailUrl: 'https://placehold.co/150x84.png?text=UX/UI', instructorName: 'Instructor C', status: 'approved', lessons: [{id: 'l1', title: 'Intro'}]},
  { id: 'course4', title: 'Marketing Digital Estratégico', description: 'Llega a tu audiencia.', thumbnailUrl: 'https://placehold.co/150x84.png?text=Marketing', instructorName: 'Admin User', status: 'approved', lessons: [{id: 'l1', title: 'Intro'}]},
  { id: 'course5', title: 'Cocina Internacional Fácil', description: 'Recetas del mundo.', thumbnailUrl: 'https://placehold.co/150x84.png?text=Cocina', instructorName: 'Instructor D', status: 'rejected', lessons: [{id: 'l1', title: 'Intro'}]},
];


export default function AdminCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [courseToModify, setCourseToModify] = useState<Course | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null);


  const handleCourseAction = (courseId: string, newStatus: 'approved' | 'rejected') => {
    setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
    const course = courses.find(c => c.id === courseId);
    toast({
      title: `Curso ${newStatus === 'approved' ? 'Aprobado' : 'Rechazado'}`,
      description: `El curso "${course?.title}" ha sido marcado como ${newStatus === 'approved' ? 'aprobado' : 'rechazado'}.`,
    });
    setCourseToModify(null);
    setActionType(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    const courseTitle = courses.find(c => c.id === courseId)?.title;
    setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));
     toast({
      title: "Curso Eliminado",
      description: `El curso "${courseTitle}" ha sido eliminado.`,
      variant: "destructive"
    });
    setCourseToModify(null);
    setActionType(null);
  }

  const openDialog = (course: Course, type: 'approve' | 'reject' | 'delete') => {
    setCourseToModify(course);
    setActionType(type);
  }

  const CourseRow = ({ course }: { course: Course }) => (
    <TableRow>
      <TableCell className="hidden md:table-cell">
        <Image src={course.thumbnailUrl} alt={course.title} width={80} height={45} className="rounded-md object-cover" data-ai-hint="course thumbnail education" />
      </TableCell>
      <TableCell className="font-medium max-w-xs truncate">
        <Link href={`/dashboard/courses/${course.id}/view`} className="hover:underline text-primary">{course.title}</Link>
        <p className="text-xs text-muted-foreground md:hidden">{course.instructorName}</p>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{course.instructorName}</TableCell>
      <TableCell className="hidden lg:table-cell">
        <Badge variant={
          course.status === 'approved' ? 'default' :
          course.status === 'pending' ? 'secondary' : 'destructive'
        } className={
          course.status === 'approved' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 
          course.status === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''
        }>
          {course.status === 'approved' && <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
          {course.status === 'pending' && <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />}
          {course.status === 'rejected' && <XCircle className="mr-1.5 h-3.5 w-3.5" />}
          {course.status === 'pending' ? 'Pendiente' : course.status === 'approved' ? 'Aprobado' : 'Rechazado'}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-1 md:space-x-2">
        {course.status === 'pending' && (
          <>
            <Button variant="outline" size="sm" onClick={() => openDialog(course, 'approve')}>
              <CheckCircle className="mr-1 h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Aprobar</span>
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => openDialog(course, 'reject')}>
              <XCircle className="mr-1 h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Rechazar</span>
            </Button>
          </>
        )}
         <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/courses/${course.id}/view`} title="Ver Curso">
                <Eye className="h-4 w-4" />
            </Link>
        </Button>
         <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/courses/${course.id}/edit`} title="Editar Curso"><Edit3 className="h-4 w-4" /></Link>
        </Button>
         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => openDialog(course, 'delete')} title="Eliminar Curso">
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );

  const renderCourseTable = (courseList: Course[], emptyMessage: string) => {
    if (courseList.length === 0) {
      return <p className="py-8 text-center text-muted-foreground">{emptyMessage}</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell w-[100px]">Miniatura</TableHead>
            <TableHead>Título</TableHead>
            <TableHead className="hidden sm:table-cell">Instructor</TableHead>
            <TableHead className="hidden lg:table-cell">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courseList.map(course => <CourseRow key={course.id} course={course} />)}
        </TableBody>
      </Table>
    );
  };

  const pendingCourses = courses.filter(c => c.status === 'pending');
  const publishedCourses = courses.filter(c => c.status === 'approved');
  const rejectedCourses = courses.filter(c => c.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          Gestión de Cursos
        </h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/courses/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Curso
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-4">
          <TabsTrigger value="pending">
            Pendientes de Revisión ({pendingCourses.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Publicados ({publishedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="hidden md:flex">
            Rechazados ({rejectedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cursos Pendientes de Revisión</CardTitle>
              <CardDescription>Cursos enviados por instructores que esperan tu aprobación.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderCourseTable(pendingCourses, "No hay cursos pendientes de revisión.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cursos Publicados</CardTitle>
              <CardDescription>Cursos actualmente disponibles en la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderCourseTable(publishedCourses, "No hay cursos publicados.")}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cursos Rechazados</CardTitle>
              <CardDescription>Cursos que han sido revisados y no aprobados.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderCourseTable(rejectedCourses, "No hay cursos rechazados.")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {courseToModify && actionType && (
        <AlertDialog open={!!courseToModify} onOpenChange={() => { setCourseToModify(null); setActionType(null);}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === 'approve' && `¿Estás seguro de que quieres aprobar el curso "${courseToModify.title}"?`}
                {actionType === 'reject' && `¿Estás seguro de que quieres rechazar el curso "${courseToModify.title}"? Esto lo moverá a la pestaña de rechazados.`}
                {actionType === 'delete' && `¿Estás seguro de que quieres eliminar permanentemente el curso "${courseToModify.title}"? Esta acción no se puede deshacer.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (actionType === 'approve') handleCourseAction(courseToModify.id, 'approved');
                  if (actionType === 'reject') handleCourseAction(courseToModify.id, 'rejected');
                  if (actionType === 'delete') handleDeleteCourse(courseToModify.id);
                }}
                className={actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : (actionType === 'approve' ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : '')}
              >
                {actionType === 'approve' && 'Aprobar'}
                {actionType === 'reject' && 'Rechazar'}
                {actionType === 'delete' && 'Eliminar Permanentemente'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    