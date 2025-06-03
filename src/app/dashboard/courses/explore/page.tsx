
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Grid, List, Info, CheckCircle, Library, Loader2, Edit3, Eye } from 'lucide-react';
import type { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useSessionRole } from '@/app/dashboard/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// LOCAL_STORAGE_ENROLLED_KEY ya no se usará para la lógica principal de inscripción
// pero lo mantenemos por si hay alguna lógica residual o para una transición.

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (courseId: string, courseTitle: string) => void;
  showAdminActions?: boolean;
  enrollmentInProgress?: boolean; // Para deshabilitar el botón mientras se inscribe
}

const MemoizedCourseCard = React.memo(function CourseCard({ course, isEnrolled, onEnroll, showAdminActions = false, enrollmentInProgress = false }: CourseCardProps) {
  const router = useRouter();
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-primary/20 transition-shadow flex flex-col">
      <div className="relative w-full h-48">
        <Image
          src={course.thumbnailUrl || 'https://placehold.co/600x338.png'}
          alt={course.title}
          fill
          style={{ objectFit: 'cover' }}
          className="bg-muted"
          data-ai-hint={course.dataAiHint || `course ${course.title.substring(0,15)}`}
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg leading-tight line-clamp-2" title={course.title}>{course.title}</CardTitle>
        <CardDescription className="text-xs pt-1">Por: {course.instructorName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{course.description}</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/dashboard/courses/${course.id}/view`}>
              <Eye className="mr-2 h-4 w-4" /> Ver Detalles
            </Link>
          </Button>
          {showAdminActions ? (
            <Button size="sm" onClick={() => router.push(`/dashboard/courses/${course.id}/edit`)} className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground">
              <Edit3 className="mr-2 h-4 w-4" /> Editar
            </Button>
          ) : isEnrolled ? (
            <Button size="sm" variant="secondary" disabled className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" /> Ya Inscrito
            </Button>
          ) : (
            <Button size="sm" onClick={() => onEnroll(course.id, course.title)} className="flex-1 bg-primary hover:bg-primary/90" disabled={enrollmentInProgress}>
              {enrollmentInProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              {enrollmentInProgress ? 'Inscribiendo...' : 'Inscribirme'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
MemoizedCourseCard.displayName = 'MemoizedCourseCard';

interface CourseListItemProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (courseId: string, courseTitle: string) => void;
  showAdminActions?: boolean;
  enrollmentInProgress?: boolean; // Para deshabilitar el botón mientras se inscribe
}

const MemoizedCourseListItem = React.memo(function CourseListItem({ course, isEnrolled, onEnroll, showAdminActions = false, enrollmentInProgress = false }: CourseListItemProps) {
  const router = useRouter();
  return (
    <Card className="shadow-md hover:shadow-primary/20 transition-shadow">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start gap-4">
        <div className="relative w-full sm:w-40 h-32 sm:h-24 flex-shrink-0 rounded-md overflow-hidden">
           <Image
              src={course.thumbnailUrl || 'https://placehold.co/600x338.png'}
              alt={course.title}
              fill
              style={{ objectFit: 'cover' }}
              className="bg-muted"
              data-ai-hint={course.dataAiHint || `course ${course.title.substring(0,15)}`}
            />
        </div>
        <div className="flex-grow">
          <CardTitle className="text-lg mb-1">{course.title}</CardTitle>
          <CardDescription className="text-xs mb-2">Por: {course.instructorName}</CardDescription>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0 self-start sm:self-center flex-shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/courses/${course.id}/view`}>
              <Eye className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Ver</span>
            </Link>
          </Button>
          {showAdminActions ? (
             <Button size="sm" onClick={() => router.push(`/dashboard/courses/${course.id}/edit`)} variant="outline">
              <Edit3 className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Editar</span>
            </Button>
          ) : isEnrolled ? (
            <Button size="sm" variant="secondary" disabled>
              <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" /> Ya Inscrito
            </Button>
          ) : (
            <Button size="sm" onClick={() => onEnroll(course.id, course.title)} className="bg-primary hover:bg-primary/90" disabled={enrollmentInProgress}>
              {enrollmentInProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" />}
              {enrollmentInProgress ? 'Inscribiendo...' : 'Inscribirme'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
MemoizedCourseListItem.displayName = 'MemoizedCourseListItem';

const SIMULATED_STUDENT_USER_ID = 3; // Asumimos que el ID del estudiante es 3

export default function ExploreCoursesPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentSessionRole, userProfile } = useSessionRole();

  const [allCoursesFromApi, setAllCoursesFromApi] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [enrollmentInProgressFor, setEnrollmentInProgressFor] = useState<string | null>(null);


  const fetchAllCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`}));
        throw new Error(errorData.message || `Error al cargar cursos: ${response.status}`);
      }
      const coursesFromApi: Course[] = await response.json();
      setAllCoursesFromApi(coursesFromApi);
    } catch (error: any) {
      console.error("Error cargando cursos desde API:", error);
      setAllCoursesFromApi([]);
      toast({ variant: "destructive", title: "Error al Cargar Cursos", description: error.message });
    }
    setIsLoading(false);
  }, [toast]);

  const fetchUserEnrollments = useCallback(async (userId: number) => {
    // No establecer isLoading aquí, para que la carga de cursos y la de inscripciones no se pisen
    try {
      const response = await fetch(`/api/enrollments/user/${userId}`);
      if (!response.ok) {
        // No mostrar error si es 404 (sin inscripciones), pero sí para otros errores
        if (response.status !== 404) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}`}));
            throw new Error(errorData.message || `Error al cargar inscripciones: ${response.status}`);
        }
        setEnrolledCourseIds(new Set()); // Usuario no inscrito en nada o error 404
        return;
      }
      const enrollments: { courseId: string }[] = await response.json();
      setEnrolledCourseIds(new Set(enrollments.map(e => e.courseId)));
    } catch (error: any) {
      console.error("Error cargando inscripciones del usuario:", error);
      toast({ variant: "destructive", title: "Error al Cargar Inscripciones", description: error.message });
      setEnrolledCourseIds(new Set()); // Limpiar en caso de error
    }
  }, [toast]);


  useEffect(() => {
    const initialUrlSearchTerm = searchParams.get('search') || '';
    setSearchTerm(initialUrlSearchTerm);
    
    fetchAllCourses();
    if (currentSessionRole === 'estudiante') {
      fetchUserEnrollments(SIMULATED_STUDENT_USER_ID);
    } else {
      // Para admin/instructor, no cargamos inscripciones específicas de un estudiante aquí
      setEnrolledCourseIds(new Set());
    }
  }, [searchParams, fetchAllCourses, fetchUserEnrollments, currentSessionRole]);


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

  const coursesForPublicListing = useMemo(() => {
    const approved = allCoursesFromApi.filter(course => course.status === 'approved');
    if (!searchTerm.trim()) {
      return approved;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return approved.filter(course =>
      course.title.toLowerCase().includes(lowercasedSearchTerm) ||
      (course.description && course.description.toLowerCase().includes(lowercasedSearchTerm)) ||
      (course.instructorName && course.instructorName.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [allCoursesFromApi, searchTerm]);

  const coursesCreatedByAdmin = useMemo(() => {
    if (currentSessionRole !== 'administrador' || !userProfile.name) return [];
    const adminCourses = allCoursesFromApi.filter(course => course.instructorName === userProfile.name);
    if (!searchTerm.trim()) {
      return adminCourses;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return adminCourses.filter(course =>
      course.title.toLowerCase().includes(lowercasedSearchTerm) ||
      (course.description && course.description.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [allCoursesFromApi, searchTerm, currentSessionRole, userProfile.name]);


  const handleEnroll = useCallback(async (courseId: string, courseTitle: string) => {
    if (currentSessionRole !== 'estudiante') {
        toast({ variant: "destructive", title: "Acción no permitida", description: "Solo los estudiantes pueden inscribirse a cursos."});
        return;
    }
    setEnrollmentInProgressFor(courseId);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: SIMULATED_STUDENT_USER_ID, courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status} al inscribirse.`);
      }
      
      // const result = await response.json(); // Contiene el objeto de inscripción
      setEnrolledCourseIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.add(courseId);
        return newIds;
      });
      toast({
        title: "¡Inscripción Exitosa!",
        description: `Te has inscrito correctamente en el curso "${courseTitle}".`,
      });

    } catch (error: any) {
      console.error('Error en la inscripción:', error);
      toast({
        variant: "destructive",
        title: "Error de Inscripción",
        description: error.message || "No se pudo completar la inscripción.",
      });
    } finally {
        setEnrollmentInProgressFor(null);
    }
  }, [toast, currentSessionRole]);

  const renderCourseList = (coursesToRender: Course[], showAdminActionsView: boolean) => {
    if (isLoading && allCoursesFromApi.length === 0 && !searchTerm) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Cargando cursos...</p>
            </div>
        );
    }
    if (coursesToRender.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-8">
          {searchTerm ? `No se encontraron cursos para "${searchTerm}".` : "No hay cursos que coincidan con los criterios."}
        </p>
      );
    }
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesToRender.map((course) => (
            <MemoizedCourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledCourseIds.has(course.id)}
              onEnroll={handleEnroll}
              showAdminActions={showAdminActionsView}
              enrollmentInProgress={enrollmentInProgressFor === course.id}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {coursesToRender.map((course) => (
           <MemoizedCourseListItem
             key={course.id}
             course={course}
             isEnrolled={enrolledCourseIds.has(course.id)}
             onEnroll={handleEnroll}
             showAdminActions={showAdminActionsView}
             enrollmentInProgress={enrollmentInProgressFor === course.id}
           />
        ))}
      </div>
    );
  };

  if (isLoading && allCoursesFromApi.length === 0) { 
    return (
        <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Cargando catálogo de cursos...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Library className="mr-3 h-8 w-8 text-primary" />
          Catálogo de Cursos
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Encuentra tu Próxima Aventura de Aprendizaje</CardTitle>
          <CardDescription>
            {currentSessionRole === 'administrador'
              ? "Busca en el catálogo público o gestiona los cursos que has creado."
              : "Busca en nuestro catálogo de cursos y encuentra el perfecto para ti."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por título, descripción o instructor..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading && allCoursesFromApi.length === 0}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Vista de cuadrícula">
                <Grid className="h-5 w-5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="Vista de lista">
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {currentSessionRole === 'administrador' ? (
            <Tabs defaultValue="public-listing">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="public-listing" disabled={isLoading && allCoursesFromApi.length === 0 && !searchTerm}>
                  Listado Público ({isLoading && allCoursesFromApi.length === 0 && !searchTerm ? '...' : coursesForPublicListing.length})
                </TabsTrigger>
                <TabsTrigger value="admin-created" disabled={isLoading && allCoursesFromApi.length === 0 && !searchTerm}>
                  Mis Cursos Creados ({isLoading && allCoursesFromApi.length === 0 && !searchTerm ? '...' : coursesCreatedByAdmin.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="public-listing">
                {renderCourseList(coursesForPublicListing, false)}
              </TabsContent>
              <TabsContent value="admin-created">
                {renderCourseList(coursesCreatedByAdmin, true)}
              </TabsContent>
            </Tabs>
          ) : (
            renderCourseList(coursesForPublicListing, false)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    

      
