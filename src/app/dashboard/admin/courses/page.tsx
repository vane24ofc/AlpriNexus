
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BookOpen, CheckCircle, AlertTriangle, Edit3, Eye, Trash2, Search, Loader2, MoreHorizontal, Users as UsersIcon, MessageSquare } from 'lucide-react';
import { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  AlertDialogContent as ConfirmDialogContent,
  AlertDialogDescription as ConfirmDialogDescription,
  AlertDialogFooter as ConfirmDialogFooter,
  AlertDialogHeader as ConfirmDialogHeader,
  AlertDialogTitle as ConfirmDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import type { User } from '@/app/dashboard/admin/users/page';
import { cn } from '@/lib/utils';

interface ApiUser {
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
  onOpenDialog: (course: Course, type: 'approve' | 'delete' | 'feedback') => void;
  onOpenEnrolledStudentsModal: (course: Course) => void;
  adminFeedback?: string;
}

const MemoizedCourseRow = React.memo(function CourseRow({ course, onOpenDialog, onOpenEnrolledStudentsModal, adminFeedback }: CourseRowProps) {
  return (
    <TableRow>
      <TableCell className="hidden md:table-cell">
        <Image src={course.thumbnailUrl} alt={course.title} width={80} height={45} className="rounded-md object-cover" data-ai-hint={course.dataAiHint || "course education"} />
      </TableCell>
      <TableCell className="font-medium max-w-xs truncate">
        <Link href={`/dashboard/courses/${course.id}/view`} className="hover:underline text-primary" title={course.title}>{course.title}</Link>
        <p className="text-xs text-muted-foreground md:hidden">{course.instructorName}</p>
        {adminFeedback && course.status === 'pending' && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic truncate" title={adminFeedback}>
                <MessageSquare className="inline-block h-3 w-3 mr-1" /> Feedback: {adminFeedback}
            </p>
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell">{course.instructorName}</TableCell>
      <TableCell className="hidden lg:table-cell">
        <Badge variant={
          course.status === 'approved' ? 'default' :
          course.status === 'pending' ? 'secondary' : 'destructive' // Destructive is fallback, should not happen now
        } className={cn(
          course.status === 'approved' ? 'bg-accent text-accent-foreground hover:bg-accent/90' :
          course.status === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500' : ''
        )}>
          {course.status === 'approved' && <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
          {course.status === 'pending' && <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />}
          {/* {course.status === 'rejected' && <XCircle className="mr-1.5 h-3.5 w-3.5" />} - No longer a status */}
          {course.status === 'pending' ? 'Pendiente' : course.status === 'approved' ? 'Aprobado' : 'Estado Desconocido'}
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
              <UsersIcon className="mr-2 h-4 w-4" /> Ver Inscritos (Simulado)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {course.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => onOpenDialog(course, 'approve')}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Aprobar Curso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenDialog(course, 'feedback')}>
                  <MessageSquare className="mr-2 h-4 w-4 text-blue-500" /> Añadir/Ver Feedback
                </DropdownMenuItem>
              </>
            )}
            {/* No more 'Rechazar Curso' option */}
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
  const [actionType, setActionType] = useState<'approve' | 'delete' | 'feedback' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isEnrolledStudentsDialogOpen, setIsEnrolledStudentsDialogOpen] = useState(false);
  const [isLoadingEnrolledStudents, setIsLoadingEnrolledStudents] = useState(false);
  const [enrolledStudentsList, setEnrolledStudentsList] = useState<EnrolledStudent[]>([]);
  const [selectedCourseForEnrolledView, setSelectedCourseForEnrolledView] = useState<Course | null>(null);

  const [feedbackComments, setFeedbackComments] = useState<Record<string, string>>({}); // Store feedback locally
  const [currentFeedbackText, setCurrentFeedbackText] = useState("");

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`}));
        throw new Error(errorData.message || `Error al cargar cursos: ${response.status}`);
      }
      const coursesFromApi: Course[] = await response.json();
      setAllCourses(coursesFromApi.filter(c => c.status !== 'rejected')); // Filter out rejected courses
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

  const handleCourseAction = async (courseId: string, newStatus: 'approved') => { // 'rejected' status removed
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    setIsLoading(true); // Or specific loader for this action
    try {
      const payload: { status: 'approved'; adminFeedback?: string } = { status: newStatus };
      if (newStatus === 'approved' && feedbackComments[courseId]) {
          // Optionally, clear feedback when approving, or keep it for history (not implemented in DB field yet)
          // For now, we don't send feedback when just approving.
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al actualizar estado del curso.`);
      }

      toast({
        title: `Curso Aprobado`,
        description: `El curso "${course.title}" ha sido marcado como aprobado.`,
      });
      fetchCourses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error de Actualización", description: error.message });
    } finally {
      setIsLoading(false);
      setCourseToModify(null);
      setActionType(null);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const courseTitle = allCourses.find(c => c.id === courseId)?.title;
    if (!courseTitle) return;
    setIsLoading(true); // Or specific loader
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
    } finally {
      setIsLoading(false);
      setCourseToModify(null);
      setActionType(null);
    }
  }

  const handleSaveFeedback = () => {
    if (courseToModify) {
        // Here you would normally make an API call to save the feedback to the DB
        // For simulation, we save it to local state `feedbackComments`
        setFeedbackComments(prev => ({ ...prev, [courseToModify.id]: currentFeedbackText }));
        toast({ title: "Feedback Guardado (Simulado)", description: `Feedback para "${courseToModify.title}" ha sido guardado localmente.` });
        // Note: This feedback won't persist on page reload as it's not in the DB.
        // The API PUT /api/courses/[courseId] would need to be updated to accept an `adminFeedback` field.
    }
    setCourseToModify(null);
    setActionType(null);
    setCurrentFeedbackText("");
  };


  const openDialog = useCallback((course: Course, type: 'approve' | 'delete' | 'feedback') => {
    setCourseToModify(course);
    setActionType(type);
    if (type === 'feedback') {
        setCurrentFeedbackText(feedbackComments[course.id] || "");
    }
  }, [feedbackComments]);

  const handleOpenEnrolledStudentsModal = useCallback(async (course: Course) => {
    setSelectedCourseForEnrolledView(course);
    setIsEnrolledStudentsDialogOpen(true);
    setIsLoadingEnrolledStudents(true);
    setEnrolledStudentsList([]);

    try {
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
        const maxSimulated = Math.min(studentUsers.length, 5);
        const shuffledStudents = studentUsers.sort(() => 0.5 - Math.random());
        const simulatedEnrolled = shuffledStudents.slice(0, maxSimulated).map(u => ({ id: u.id, name: u.fullName }));
        setEnrolledStudentsList(simulatedEnrolled);
      }
    } catch (error: any) {
      console.error("Error simulando lista de inscritos:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la lista simulada de estudiantes inscritos." });
      setEnrolledStudentsList([]);
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
              <TableHead>Título y Feedback</TableHead>
              <TableHead className="hidden sm:table-cell">Instructor</TableHead>
              <TableHead className="hidden lg:table-cell">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseList.map(course => <MemoizedCourseRow key={course.id} course={course} onOpenDialog={openDialog} onOpenEnrolledStudentsModal={handleOpenEnrolledStudentsModal} adminFeedback={feedbackComments[course.id]}/>)}
          </TableBody>
        </Table>
      </div>
    );
  };

  const pendingCourses = useMemo(() => filteredCourses.filter(c => c.status === 'pending'), [filteredCourses]);
  const publishedCourses = useMemo(() => filteredCourses.filter(c => c.status === 'approved'), [filteredCourses]);
  // Rejected courses are no longer displayed/filtered

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
            <CardDescription>El filtro se aplica a todas las pestañas (Pendientes, Publicados).</CardDescription>
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
        <TabsList className="grid w-full grid-cols-2 mb-4"> {/* Changed to grid-cols-2 */}
          <TabsTrigger value="pending" disabled={isLoading && allCourses.length === 0}>
            Pendientes ({isLoading && allCourses.length === 0 && !searchTerm ? '...' : pendingCourses.length})
          </TabsTrigger>
          <TabsTrigger value="published" disabled={isLoading && allCourses.length === 0}>
            Publicados ({isLoading && allCourses.length === 0 && !searchTerm ? '...' : publishedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cursos Pendientes de Revisión</CardTitle>
              <CardDescription>Cursos enviados por instructores que esperan tu aprobación. Puedes añadir feedback.</CardDescription>
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
        {/* TabsContent for 'rejected' removed */}
      </Tabs>

      {courseToModify && actionType === 'feedback' && (
        <Dialog open={actionType === 'feedback'} onOpenChange={() => { setCourseToModify(null); setActionType(null); setCurrentFeedbackText("");}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feedback para: {courseToModify.title}</DialogTitle>
              <DialogDescription>
                Añade o edita tu comentario para el instructor sobre este curso pendiente.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="feedback-text" className="sr-only">Comentario</Label>
              <Textarea
                id="feedback-text"
                value={currentFeedbackText}
                onChange={(e) => setCurrentFeedbackText(e.target.value)}
                placeholder="Escribe tu feedback aquí..."
                rows={5}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCourseToModify(null); setActionType(null); setCurrentFeedbackText("");}}>Cancelar</Button>
              <Button onClick={handleSaveFeedback}>Guardar Feedback (Simulado)</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {courseToModify && (actionType === 'approve' || actionType === 'delete') && (
        <AlertDialog open={!!courseToModify && (actionType === 'approve' || actionType === 'delete')} onOpenChange={() => { setCourseToModify(null); setActionType(null);}}>
          <ConfirmDialogContent>
            <ConfirmDialogHeader>
              <ConfirmDialogTitle>Confirmar Acción</ConfirmDialogTitle>
              <ConfirmDialogDescription>
                {actionType === 'approve' && `¿Estás seguro de que quieres aprobar el curso "${courseToModify.title}"?`}
                {actionType === 'delete' && `¿Estás seguro de que quieres eliminar permanentemente el curso "${courseToModify.title}"? Esta acción no se puede deshacer.`}
              </ConfirmDialogDescription>
            </ConfirmDialogHeader>
            <ConfirmDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!courseToModify) return;
                  if (actionType === 'approve') handleCourseAction(courseToModify.id, 'approved');
                  if (actionType === 'delete') handleDeleteCourse(courseToModify.id);
                }}
                className={cn(
                    actionType === 'approve' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : '',
                    actionType === 'delete' ? buttonVariants({ variant: "destructive" }) : ''
                )}
              >
                {actionType === 'approve' && 'Aprobar'}
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
