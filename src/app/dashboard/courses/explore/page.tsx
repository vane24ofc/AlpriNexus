
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Grid, List, Info, CheckCircle, Library, Loader2 } from 'lucide-react';
import type { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';

const COURSES_STORAGE_KEY = 'nexusAlpriAllCourses';
const LOCAL_STORAGE_ENROLLED_KEY = 'simulatedEnrolledCourseIds';

const initialSeedCoursesForExplore: Course[] = [ 
  { id: 'exploreSeed1', title: 'Introducción a la IA (Seed)', description: 'Conceptos básicos de Inteligencia Artificial.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'IA Expert', status: 'approved', lessons: [{id: 'l1-seed-e1', title: 'Intro IA Seed'}], dataAiHint: 'ai concepts' },
  { id: 'exploreSeed2', title: 'Marketing Digital 101 (Seed)', description: 'Fundamentos de marketing digital.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Marketing Guru', status: 'approved', lessons: [{id: 'l1-seed-e2', title: 'Intro Marketing Seed'}], dataAiHint: 'digital marketing basics' },
];

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (courseId: string, courseTitle: string) => void;
}

const MemoizedCourseCard = React.memo(function CourseCard({ course, isEnrolled, onEnroll }: CourseCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-primary/20 transition-shadow flex flex-col">
      <div className="relative w-full h-48">
        <Image
          src={course.thumbnailUrl}
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
              <Info className="mr-2 h-4 w-4" /> Ver Detalles
            </Link>
          </Button>
          {isEnrolled ? (
            <Button size="sm" variant="secondary" disabled className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" /> Ya Inscrito
            </Button>
          ) : (
            <Button size="sm" onClick={() => onEnroll(course.id, course.title)} className="flex-1 bg-primary hover:bg-primary/90">
              <CheckCircle className="mr-2 h-4 w-4" /> Inscribirme
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
}

const MemoizedCourseListItem = React.memo(function CourseListItem({ course, isEnrolled, onEnroll }: CourseListItemProps) {
  return (
    <Card className="shadow-md hover:shadow-primary/20 transition-shadow">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start gap-4">
        <div className="relative w-full sm:w-40 h-32 sm:h-24 flex-shrink-0 rounded-md overflow-hidden">
           <Image
              src={course.thumbnailUrl}
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
              <Info className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Ver Detalles</span>
            </Link>
          </Button>
          {isEnrolled ? (
            <Button size="sm" variant="secondary" disabled>
              <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" /> Ya Inscrito
            </Button>
          ) : (
            <Button size="sm" onClick={() => onEnroll(course.id, course.title)} className="bg-primary hover:bg-primary/90">
              <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" /> Inscribirme
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
MemoizedCourseListItem.displayName = 'MemoizedCourseListItem';

export default function ExploreCoursesPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const initialUrlSearchTerm = searchParams.get('search') || '';
      setSearchTerm(initialUrlSearchTerm);

      // TODO: Reemplazar con llamada a API GET /api/courses?status=approved
      try {
        const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
        if (storedCourses) {
          setAllCourses(JSON.parse(storedCourses));
        } else {
          setAllCourses(initialSeedCoursesForExplore);
          localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(initialSeedCoursesForExplore));
        }
      } catch (error) {
        console.error("Error loading courses from localStorage:", error);
        setAllCourses(initialSeedCoursesForExplore);
        toast({ variant: "destructive", title: "Error al Cargar Cursos", description: "Se usarán datos de ejemplo." });
      }

      try {
        const storedEnrolledIds = localStorage.getItem(LOCAL_STORAGE_ENROLLED_KEY);
        if (storedEnrolledIds) {
          const parsedIds = JSON.parse(storedEnrolledIds);
          if (Array.isArray(parsedIds)) {
            setEnrolledCourseIds(new Set(parsedIds));
          }
        }
      } catch (error) {
        console.error("Error al parsear IDs de cursos inscritos desde localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [searchParams, toast]);

  const approvedCourses = useMemo(() => {
    return allCourses.filter(course => course.status === 'approved');
  }, [allCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) {
      return approvedCourses;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return approvedCourses.filter(course =>
      course.title.toLowerCase().includes(lowercasedSearchTerm) ||
      (course.description && course.description.toLowerCase().includes(lowercasedSearchTerm)) ||
      (course.instructorName && course.instructorName.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [approvedCourses, searchTerm]);

  const handleEnroll = useCallback(async (courseId: string, courseTitle: string) => {
    // TODO: Reemplazar con llamada a API POST /api/enrollments { courseId, userId }
    // Ejemplo:
    // try {
    //   const response = await fetch('/api/enrollments', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ courseId /*, userId: currentUser.id */ }),
    //   });
    //   if (!response.ok) throw new Error('Error al inscribirse');
    //   // const enrollmentData = await response.json();
    // } catch (error) {
    //   console.error("Error en la inscripción (API):", error);
    //   toast({ variant: "destructive", title: "Error de Inscripción", description: "No se pudo completar la inscripción." });
    //   return;
    // }

    // Simulación con localStorage
    setEnrolledCourseIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.add(courseId);
      localStorage.setItem(LOCAL_STORAGE_ENROLLED_KEY, JSON.stringify(Array.from(newIds)));
      return newIds;
    });
    toast({
      title: "¡Inscripción Exitosa! (Simulada)",
      description: `Te has inscrito correctamente en el curso "${courseTitle}".`,
    });
  }, [toast]);

  if (isLoading) {
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
          Explorar Catálogo de Cursos
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Encuentra tu Próxima Aventura de Aprendizaje</CardTitle>
          <CardDescription>Busca en nuestro catálogo de cursos y encuentra el perfecto para ti.</CardDescription>
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
                disabled={isLoading}
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

          {filteredCourses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? `No se encontraron cursos para "${searchTerm}".` : "No hay cursos disponibles en el catálogo actualmente."}
            </p>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <MemoizedCourseCard 
                    key={course.id} 
                    course={course} 
                    isEnrolled={enrolledCourseIds.has(course.id)} 
                    onEnroll={handleEnroll} 
                  />
                ))}
              </div>
            ) : ( 
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                   <MemoizedCourseListItem 
                     key={course.id} 
                     course={course} 
                     isEnrolled={enrolledCourseIds.has(course.id)} 
                     onEnroll={handleEnroll}
                   />
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

