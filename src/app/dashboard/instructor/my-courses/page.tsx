
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit3, BarChart2, PlusCircle, AlertTriangle, CheckCircle, XCircle, BookOpen, Search, Star, Users as UsersIcon, Activity, Loader2, MoreHorizontal } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart as ReBarChart, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSessionRole } from '@/app/dashboard/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';


type CourseStatus = 'pending' | 'approved' | 'rejected';
interface StatusInfo {
  text: string;
  icon: React.ElementType;
  variant: "default" | "secondary" | "destructive" | "outline" | null | undefined;
  className: string;
}

interface CourseStats {
  enrolledStudents: number;
  averageCompletionRate: number;
  averageRating: number;
  progressDistribution: { name: string; value: number }[];
}

const studentProgressChartConfig = {
  value: {
    label: "Estudiantes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const sampleEnrolledStudents = [
  { id: 'student1', name: 'Ana García' },
  { id: 'student2', name: 'Luis Fernández' },
  { id: 'student3', name: 'Sofía Martínez' },
];


interface InstructorCourseRowProps {
  course: Course;
  statusInfo: StatusInfo;
  onOpenStatsModal: (course: Course) => void;
  onOpenEnrolledStudentsModal: (course: Course) => void;
}

const MemoizedInstructorCourseRow = React.memo(function InstructorCourseRow({ course, statusInfo, onOpenStatsModal, onOpenEnrolledStudentsModal }: InstructorCourseRowProps) {
  const StatusIcon = statusInfo.icon;
  return (
    <TableRow>
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
         <Link href={`/dashboard/courses/${course.id}/view`} className="hover:underline text-primary" title={course.title}>{course.title}</Link>
        <p className="text-xs text-muted-foreground md:hidden">{statusInfo.text}</p>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={statusInfo.variant} className={statusInfo.className}>
          <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.text}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {course.lessons?.length || 0} Lecciones {/* Placeholder, API should provide student count */}
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
            <DropdownMenuItem onClick={() => onOpenStatsModal(course)}>
              <BarChart2 className="mr-2 h-4 w-4" /> Ver Estadísticas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenEnrolledStudentsModal(course)}>
              <UsersIcon className="mr-2 h-4 w-4" /> Ver Inscritos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
MemoizedInstructorCourseRow.displayName = 'MemoizedInstructorCourseRow';


export default function MyCoursesPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userProfile, currentSessionRole } = useSessionRole();

  const [allInstructorCourses, setAllInstructorCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseForStats, setSelectedCourseForStats] = useState<Course | null>(null);
  const [simulatedStats, setSimulatedStats] = useState<CourseStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEnrolledStudentsDialogOpen, setIsEnrolledStudentsDialogOpen] = useState(false);
  const [selectedCourseForEnrolledView, setSelectedCourseForEnrolledView] = useState<Course | null>(null);

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (currentSessionRole !== 'instructor' || !userProfile.name) {
        setIsLoading(false);
        setAllInstructorCourses([]);
        return;
      }
      setIsLoading(true);
      const initialSearch = searchParams.get('search') || '';
      setSearchTerm(initialSearch);

      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `Error al cargar cursos: ${response.status}`);
        }
        const allPlatformCourses: Course[] = await response.json();
        const filteredForInstructor = allPlatformCourses.filter(
          course => course.instructorName === userProfile.name
        );
        setAllInstructorCourses(filteredForInstructor);
      } catch (error: any) {
        console.error("Error cargando cursos del instructor desde API:", error);
        toast({ variant: "destructive", title: "Error al Cargar Cursos", description: error.message });
        setAllInstructorCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstructorCourses();
  }, [userProfile.name, currentSessionRole, toast]); // Removed searchParams as it was handled by another useEffect

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, router]);

  const getStatusInfo = (status: CourseStatus): StatusInfo => {
    switch (status) {
      case 'approved':
        return { text: 'Publicado', icon: CheckCircle, variant: 'default', className: 'bg-accent text-accent-foreground hover:bg-accent/90' };
      case 'pending':
        return { text: 'Pendiente', icon: AlertTriangle, variant: 'default', className: 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500' };
      case 'rejected':
        return { text: 'Rechazado', icon: XCircle, variant: 'destructive', className: '' };
      default:
        return { text: 'Desconocido', icon: AlertTriangle, variant: 'secondary', className: 'bg-gray-500 text-white' };
    }
  };

  const generateSimulatedStats = (course: Course): CourseStats => {
    const enrolled = Math.floor(Math.random() * 300) + 50;
    const completion = Math.floor(Math.random() * 70) + 30;
    const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
    const dist1 = Math.floor(Math.random() * (enrolled * 0.3));
    const dist2 = Math.floor(Math.random() * (enrolled * 0.4));
    const dist3 = Math.floor(Math.random() * (enrolled * 0.2));
    const dist4 = Math.max(0, enrolled - dist1 - dist2 - dist3);

    return {
      enrolledStudents: enrolled,
      averageCompletionRate: completion,
      averageRating: rating,
      progressDistribution: [
        { name: '0-25%', value: dist1 },
        { name: '26-50%', value: dist2 },
        { name: '51-75%', value: dist3 },
        { name: '76-100%', value: dist4 },
      ],
    };
  };

  const handleOpenStatsModal = useCallback((course: Course) => {
    setSelectedCourseForStats(course);
    setSimulatedStats(generateSimulatedStats(course));
  }, []);

  const handleCloseStatsModal = () => {
    setSelectedCourseForStats(null);
    setSimulatedStats(null);
  };

  const handleOpenEnrolledStudentsModal = useCallback((course: Course) => {
    setSelectedCourseForEnrolledView(course);
    setIsEnrolledStudentsDialogOpen(true);
  }, []);

  const handleCloseEnrolledStudentsModal = () => {
    setSelectedCourseForEnrolledView(null);
    setIsEnrolledStudentsDialogOpen(false);
  };

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) {
      return allInstructorCourses;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return allInstructorCourses.filter(course =>
      course.title.toLowerCase().includes(lowercasedSearchTerm) ||
      (course.description && course.description.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [allInstructorCourses, searchTerm]);

  const publishedCourses = useMemo(() => {
    return filteredCourses.filter(course => course.status === 'approved');
  }, [filteredCourses]);


  const renderCourseTable = (coursesToRender: Course[], emptyMessage: string) => {
    if (isLoading && allInstructorCourses.length === 0 && !searchTerm) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Cargando cursos...</p>
            </div>
        );
    }
    if (coursesToRender.length === 0) {
      return <p className="py-8 text-center text-muted-foreground">{searchTerm ? `No se encontraron cursos para "${searchTerm}".` : emptyMessage}</p>;
    }
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell w-[100px]">Miniatura</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Lecciones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coursesToRender.map((course) => (
              <MemoizedInstructorCourseRow
                  key={course.id}
                  course={course}
                  statusInfo={getStatusInfo(course.status)}
                  onOpenStatsModal={handleOpenStatsModal}
                  onOpenEnrolledStudentsModal={handleOpenEnrolledStudentsModal}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoading && !allInstructorCourses.length) { 
    return (
        <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Cargando tus cursos...</p>
        </div>
    );
  }
  
  if (currentSessionRole !== 'instructor') {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-destructive">Acceso denegado.</p>
        <p className="text-muted-foreground">Esta sección es solo para instructores.</p>
        <Button onClick={() => router.push('/dashboard')}>Volver al Panel Principal</Button>
      </div>
    );
  }

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

       <Card className="shadow-md">
        <CardHeader className="pb-4">
            <CardTitle className="text-base">Buscar en Mis Cursos</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por título o descripción..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading && allInstructorCourses.length === 0}
              />
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="all" disabled={isLoading && allInstructorCourses.length === 0}>
            Todos Mis Cursos ({isLoading && allInstructorCourses.length === 0 && !searchTerm ? '...' : filteredCourses.length})
          </TabsTrigger>
          <TabsTrigger value="published" disabled={isLoading && allInstructorCourses.length === 0}>
            Publicados ({isLoading && allInstructorCourses.length === 0 && !searchTerm ? '...' : publishedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Todos Mis Cursos</CardTitle>
              <CardDescription>Cursos que has creado, incluyendo pendientes, publicados y rechazados.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderCourseTable(filteredCourses, "Aún no has creado ningún curso. ¡Empieza creando uno nuevo!")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Mis Cursos Publicados</CardTitle>
              <CardDescription>Cursos que han sido aprobados y están disponibles en la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderCourseTable(publishedCourses, "No tienes cursos publicados actualmente.")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedCourseForStats && simulatedStats && (
        <AlertDialog open={!!selectedCourseForStats} onOpenChange={handleCloseStatsModal}>
          <AlertDialogContent className="sm:max-w-lg md:max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Estadísticas del Curso: {selectedCourseForStats.title}</AlertDialogTitle>
              <AlertDialogDescription>
                Un resumen del rendimiento y la participación de los estudiantes en este curso.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estudiantes Inscritos</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{simulatedStats.enrolledStudents}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{simulatedStats.averageCompletionRate}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{simulatedStats.averageRating}/5</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="col-span-1 sm:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-primary" />
                        Distribución de Progreso de Estudiantes
                    </CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ChartContainer config={studentProgressChartConfig} className="h-[250px] w-full">
                        <ReBarChart data={simulatedStats.progressDistribution} layout="vertical" margin={{ right: 30, left:10 }}>
                            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                                <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={10} />
                            </Bar>
                        </ReBarChart>
                    </ChartContainer>
                </CardContent>
              </Card>

            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCloseStatsModal}>Entendido</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {selectedCourseForEnrolledView && (
        <Dialog open={isEnrolledStudentsDialogOpen} onOpenChange={handleCloseEnrolledStudentsModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Estudiantes Inscritos en: {selectedCourseForEnrolledView.title}</DialogTitle>
                    <DialogDescription>
                        Lista de estudiantes actualmente inscritos en este curso (simulado).
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[300px] my-4">
                    {sampleEnrolledStudents.length > 0 ? (
                        <ul className="space-y-2 pr-3">
                            {sampleEnrolledStudents.map((student) => (
                                <li key={student.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                                    <span className="text-sm font-medium">{student.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay estudiantes inscritos en este curso (simulación).</p>
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

