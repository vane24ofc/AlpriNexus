
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BookOpen, CheckCircle, XCircle, AlertTriangle, Edit3, Eye, Trash2, Search, Loader2, MoreHorizontal, Users as UsersIcon } from 'lucide-react';
import { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as ConfirmDialogContent, // Renamed to avoid conflict
  AlertDialogDescription as ConfirmDialogDescription,
  AlertDialogFooter as ConfirmDialogFooter,
  AlertDialogHeader as ConfirmDialogHeader,
  AlertDialogTitle as ConfirmDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import type { User } from '@/app/dashboard/admin/users/page'; // Assuming User type is exported for API User

interface ApiUser { // Simplified user type for this context
  id: string;
  fullName: string;
  role: string;
}

interface EnrolledStudent {
  id: string;
  name: string;
}

interface CourseRowProps {
  course: Course;
  onOpenDialog: (course: Course, type: 'approve' | 'reject' | 'delete') => void;
  onOpenEnrolledStudentsModal: (course: Course) => void;
}

const MemoizedCourseRow = React.memo(function CourseRow({ course, onOpenDialog, onOpenEnrolledStudentsModal }: CourseRowProps) {
  return (
    <TableRow>
      <TableCell className="hidden md:table-cell">
        <Image src={course.thumbnailUrl} alt={course.title} width={80} height={45} className="rounded-md object-cover" data-ai-hint={course.dataAiHint || "course education"} />
      </TableCell>
      <TableCell className="font-medium max-w-xs truncate">
        <Link href={`/dashboard/courses/${course.id}/view`} className="hover:underline text-primary" title={course.title}>{course.title}</Link>
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
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Más acciones">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Más acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones del Curso</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/courses/${course.id}/view`}>
                <Eye className="mr-2 h-4 w-4" /> Ver Curso
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/courses/${course.id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" /> Editar Curso
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => onOpenEnrolledStudentsModal(course)}>
              <UsersIcon className="mr-2 h-4 w-4" /> Ver Inscritos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(course.status === 'pending' || course.status === 'rejected') && (
              <DropdownMenuItem onClick={() => onOpenDialog(course, 'approve')}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Aprobar Curso
              </DropdownMenuItem>
            )}
            {course.status === 'pending' && (
              <DropdownMenuItem onClick={() => onOpenDialog(course, 'reject')}>
                <XCircle className="mr-2 h-4 w-4 text-orange-500" /> Rechazar Curso
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onOpenDialog(course, 'delete')} className="text-destructive hover:!text-destructive focus:!text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Curso
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
MemoizedCourseRow.displayName = 'MemoizedCourseRow';


export default function AdminCoursesPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courseToModify, setCourseToModify] = useState<Course | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isEnrolledStudentsDialogOpen, setIsEnrolledStudentsDialogOpen] = useState(false);
  const [isLoadingEnrolledStudents, setIsLoadingEnrolledStudents] = useState(false);
  const [enrolledStudentsList, setEnrolledStudentsList] = useState<EnrolledStudent[]>([]);
  const [selectedCourseForEnrolledView, setSelectedCourseForEnrolledView] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`}));
        throw new Error(errorData.message || `Error al cargar cursos: ${response.status}`);
      }
      const coursesFromApi: Course[] = await response.json();
      setAllCourses(coursesFromApi);
    } catch (error: any) {
      console.error("Error cargando cursos desde API:", error);
      setAllCourses([]);
      toast({ variant: "destructive", title: "Error al Cargar Cursos", description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const initialUrlSearchTerm = searchParams.get('search') || '';
        setSearchTerm(initialUrlSearchTerm);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (searchTerm) {
        params.set('search', searchTerm);
        } else {
        params.delete('search');
        }
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchTerm, router]); 

  const handleCourseAction = async (courseId: string, newStatus: 'approved' | 'rejected') => {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al actualizar estado del curso.`);
      }
      
      toast({
        title: `Curso ${newStatus === 'approved' ? 'Aprobado' : 'Rechazado'}`,
        description: `El curso "${course.title}" ha sido marcado como ${newStatus === 'approved' ? 'aprobado' : 'rechazado'}.`,
      });
      fetchCourses(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error de Actualización", description: error.message });
      setIsLoading(false); 
    }
    setCourseToModify(null);
    setActionType(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const courseTitle = allCourses.find(c => c.id === courseId)?.title;
    if (!courseTitle) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el curso.');
      }
      toast({
        title: "Curso Eliminado",
        description: `El curso "${courseTitle}" ha sido eliminado.`,
        variant: "destructive"
      });
      fetchCourses(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error de Eliminación", description: error.message });
      setIsLoading(false); 
    }
    setCourseToModify(null);
    setActionType(null);
  }

  const openDialog = useCallback((course: Course, type: 'approve' | 'reject' | 'delete') => {
    setCourseToModify(course);
    setActionType(type);
  }, []);

  const handleOpenEnrolledStudentsModal = useCallback(async (course: Course) => {
    setSelectedCourseForEnrolledView(course);
    setIsEnrolledStudentsDialogOpen(true);
    setIsLoadingEnrolledStudents(true);
    setEnrolledStudentsList([]);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('No se pudieron obtener los usuarios de la plataforma.');
      }
      const allApiUsers: ApiUser[] = await response.json();
      const studentUsers = allApiUsers.filter(user => user.role === 'estudiante');

      if (studentUsers.length === 0) {
        setEnrolledStudentsList([]);
      } else {
        // Simulate a random subset of students enrolled in this course
        const maxSimulated = Math.min(studentUsers.length, 5); // Show up to 5 simulated students
        const shuffledStudents = studentUsers.sort(() => 0.5 - Math.random());
        const simulatedEnrolled = shuffledStudents.slice(0, maxSimulated).map(u => ({ id: u.id, name: u.fullName }));
        setEnrolledStudentsList(simulatedEnrolled);
      }
    } catch (error: any) {
      console.error("Error simulando lista de inscritos:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la lista simulada de estudiantes inscritos." });
      setEnrolledStudentsList([]); // Clear on error
    } finally {
      setIsLoadingEnrolledStudents(false);
    }
  }, [toast]);

  const handleCloseEnrolledStudentsModal = () => {
    setSelectedCourseForEnrolledView(null);
    setIsEnrolledStudentsDialogOpen(false);
    setEnrolledStudentsList([]);
  };

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) {
      return allCourses;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return allCourses.filter(course =>
      course.title.toLowerCase().includes(lowercasedSearchTerm) ||
      (course.instructorName && course.instructorName.toLowerCase().includes(lowercasedSearchTerm)) ||
      (course.description && course.description.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [allCourses, searchTerm]);

  const renderCourseTable = (courseList: Course[], tabName: string, emptyMessage: string) => {
    if (isLoading && allCourses.length === 0 && !searchTerm) { 
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Cargando cursos...</p>
            </div>
        );
    }
    if (courseList.length === 0) {
      return <p className="py-8 text-center text-muted-foreground">{searchTerm ? `No se encontraron cursos ${tabName} para "${searchTerm}".` : emptyMessage}</p>;
    }
    return (
      <div className="overflow-x-auto">
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
            {courseList.map(course => <MemoizedCourseRow key={course.id} course={course} onOpenDialog={openDialog} onOpenEnrolledStudentsModal={handleOpenEnrolledStudentsModal} />)}
          </TableBody>
        </Table>
      </div>
    );
  };

  const pendingCourses = useMemo(() => filteredCourses.filter(c => c.status === 'pending'), [filteredCourses]);
  const publishedCourses = useMemo(() => filteredCourses.filter(c => c.status === 'approved'), [filteredCourses]);
  const rejectedCourses = useMemo(() => filteredCourses.filter(c => c.status === 'rejected'), [filteredCourses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          Gestión de Cursos
        </h1>
         <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/courses/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Añadir Nuevo Curso
          </Link>
        </Button>
      </div>

       <Card className="shadow-md">
        <CardHeader className="pb-4">
            <CardTitle className="text-base">Buscar Cursos</CardTitle>
            <CardDescription>El filtro se aplica a todas las pestañas (Pendientes, Publicados, Rechazados).</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por título, instructor o descripción..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading && allCourses.length === 0}
              />
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="pending" disabled={isLoading && allCourses.length === 0}>
            Pendientes ({isLoading && allCourses.length === 0 && !searchTerm ? '...' : pendingCourses.length})
          </TabsTrigger>
          <TabsTrigger value="published" disabled={isLoading && allCourses.length === 0}>
            Publicados ({isLoading && allCourses.length === 0 && !searchTerm ? '...' : publishedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center justify-center" disabled={isLoading && allCourses.length === 0}>
            Rechazados ({isLoading && allCourses.length === 0 && !searchTerm ? '...' : rejectedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cursos Pendientes de Revisión</CardTitle>
              <CardDescription>Cursos enviados por instructores que esperan tu aprobación.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderCourseTable(pendingCourses, "pendientes", "No hay cursos pendientes de revisión.")}
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
              {renderCourseTable(publishedCourses, "publicados", "No hay cursos publicados.")}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cursos Rechazados</CardTitle>
              <CardDescription>Cursos que han sido revisados y no aprobados. Puedes aprobarlos desde aquí si es necesario.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderCourseTable(rejectedCourses, "rechazados", "No hay cursos rechazados.")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {courseToModify && actionType && (
        <AlertDialog open={!!courseToModify} onOpenChange={() => { setCourseToModify(null); setActionType(null);}}>
          <ConfirmDialogContent>
            <ConfirmDialogHeader>
              <ConfirmDialogTitle>Confirmar Acción</ConfirmDialogTitle>
              <ConfirmDialogDescription>
                {actionType === 'approve' && `¿Estás seguro de que quieres aprobar el curso "${courseToModify.title}"?`}
                {actionType === 'reject' && `¿Estás seguro de que quieres rechazar el curso "${courseToModify.title}"? Esto lo moverá a la pestaña de rechazados.`}
                {actionType === 'delete' && `¿Estás seguro de que quieres eliminar permanentemente el curso "${courseToModify.title}"? Esta acción no se puede deshacer.`}
              </ConfirmDialogDescription>
            </ConfirmDialogHeader>
            <ConfirmDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!courseToModify) return;
                  if (actionType === 'approve') handleCourseAction(courseToModify.id, 'approved');
                  if (actionType === 'reject') handleCourseAction(courseToModify.id, 'rejected');
                  if (actionType === 'delete') handleDeleteCourse(courseToModify.id);
                }}
                className={actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : (actionType === 'approve' ? 'bg-green-500 hover:bg-green-600 text-white' : '')}
              >
                {actionType === 'approve' && 'Aprobar'}
                {actionType === 'reject' && 'Rechazar'}
                {actionType === 'delete' && 'Eliminar Permanentemente'}
              </AlertDialogAction>
            </ConfirmDialogFooter>
          </ConfirmDialogContent>
        </AlertDialog>
      )}

      {selectedCourseForEnrolledView && (
        <Dialog open={isEnrolledStudentsDialogOpen} onOpenChange={handleCloseEnrolledStudentsModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Estudiantes Inscritos en: {selectedCourseForEnrolledView.title}</DialogTitle>
                    <DialogDescription>
                        Lista de estudiantes actualmente inscritos en este curso. <br/>
                        <span className="text-xs text-muted-foreground">(Simulación basada en usuarios 'estudiante' de la plataforma)</span>
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[300px] my-4">
                     {isLoadingEnrolledStudents ? (
                        <div className="flex justify-center items-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-3 text-muted-foreground">Cargando estudiantes...</p>
                        </div>
                     ) : enrolledStudentsList.length > 0 ? (
                        <ul className="space-y-2 pr-3">
                            {enrolledStudentsList.map((student) => (
                                <li key={student.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                                    <span className="text-sm font-medium">{student.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay estudiantes inscritos en este curso o no hay usuarios 'estudiante' en la plataforma para simular.</p>
                    )}
                </ScrollArea>
                <DialogFooter>
                     <DialogClose asChild>
                        <Button type="button" variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
    
