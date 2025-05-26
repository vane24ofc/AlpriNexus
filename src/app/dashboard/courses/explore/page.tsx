
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Grid, List, Info, CheckCircle, Library } from 'lucide-react';
import type { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';

// Usaremos una lista consolidada de cursos de ejemplo que podrían estar "aprobados"
// Esta lista podría eventualmente venir de un contexto o servicio si se comparte entre más páginas.
export const allPlatformCourses: Course[] = [
  { id: 'course-js-adv', title: 'JavaScript Avanzado: Patrones y Prácticas Modernas', description: 'Domina los conceptos avanzados de JavaScript, incluyendo promesas, async/await, patrones de diseño y optimización de rendimiento.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Dr. Evelyn Woods', status: 'approved', lessons: [{id: 'l1', title: 'Intro', content: 'Contenido de la lección 1'}], dataAiHint: 'javascript programming' },
  { id: 'course-python-ds', title: 'Python para Ciencia de Datos: De Cero a Héroe', description: 'Un curso completo que te llevará desde los fundamentos de Python hasta la aplicación de técnicas de ciencia de datos.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Prof. Ian Stone', status: 'approved', lessons: [{id: 'l1', title: 'Intro', content: 'Contenido de la lección 1'}], dataAiHint: 'python data' },
  { id: 'course-ux-design', title: 'Fundamentos del Diseño de Experiencia de Usuario (UX)', description: 'Aprende los principios clave del diseño UX, incluyendo investigación de usuarios, arquitectura de información y prototipado.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Ana Lima', status: 'approved', lessons: [{id: 'l1', title: 'Intro', content: 'Contenido de la lección 1'}], dataAiHint: 'ux design' },
  { id: 'course-react-native', title: 'Desarrollo de Apps Móviles con React Native', description: 'Construye aplicaciones móviles nativas para iOS y Android utilizando React Native.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Carlos Vega', status: 'approved', lessons: [{id: 'l1', title: 'Intro', content: 'Contenido de la lección 1'}], dataAiHint: 'mobile development' },
  { id: 'course-digital-marketing', title: 'Marketing Digital Estratégico para Negocios', description: 'Descubre cómo crear y ejecutar estrategias de marketing digital efectivas para hacer crecer tu negocio.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Laura Morales', status: 'approved', lessons: [{id: 'l1', title: 'Intro', content: 'Contenido de la lección 1'}], dataAiHint: 'digital marketing' },
  { id: 'course-project-management', title: 'Gestión de Proyectos Ágil con Scrum', description: 'Domina Scrum y aprende a gestionar proyectos de forma ágil y eficiente para entregar valor continuamente.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Roberto Diaz', status: 'approved', lessons: [{id: 'l1', title: 'Intro', content: 'Contenido de la lección 1'}], dataAiHint: 'project management' },
  { id: 'course-data-viz', title: 'Visualización de Datos con Tableau', description: 'Aprende a crear visualizaciones de datos impactantes y dashboards interactivos utilizando Tableau.', thumbnailUrl: 'https://placehold.co/600x338.png', instructorName: 'Sofia Chen', status: 'pending', lessons: [{id: 'l1', title: 'Intro', content: 'Contenido de la lección 1'}], dataAiHint: 'data visualization' }, // Ejemplo de curso no aprobado
];

const LOCAL_STORAGE_ENROLLED_KEY = 'simulatedEnrolledCourseIds';

export default function ExploreCoursesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Cargar IDs de cursos inscritos desde localStorage al montar
    const storedEnrolledIds = localStorage.getItem(LOCAL_STORAGE_ENROLLED_KEY);
    if (storedEnrolledIds) {
      try {
        const parsedIds = JSON.parse(storedEnrolledIds);
        if (Array.isArray(parsedIds)) {
          setEnrolledCourseIds(new Set(parsedIds));
        }
      } catch (error) {
        console.error("Error al parsear IDs de cursos inscritos desde localStorage:", error);
        setEnrolledCourseIds(new Set()); // Resetear si hay error
      }
    }
  }, []);

  // Filtramos solo los cursos aprobados para el catálogo
  const approvedCourses = useMemo(() => allPlatformCourses.filter(course => course.status === 'approved'), []);

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) {
      return approvedCourses;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return approvedCourses.filter(course =>
      course.title.toLowerCase().includes(lowercasedSearchTerm) ||
      course.description.toLowerCase().includes(lowercasedSearchTerm) ||
      course.instructorName.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [approvedCourses, searchTerm]);

  const handleEnroll = (courseId: string, courseTitle: string) => {
    const newEnrolledIds = new Set(enrolledCourseIds);
    newEnrolledIds.add(courseId);
    setEnrolledCourseIds(newEnrolledIds);
    localStorage.setItem(LOCAL_STORAGE_ENROLLED_KEY, JSON.stringify(Array.from(newEnrolledIds)));
    toast({
      title: "¡Inscripción Exitosa! (Simulada)",
      description: `Te has inscrito correctamente en el curso "${courseTitle}".`,
    });
  };

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
              No se encontraron cursos que coincidan con tu búsqueda o no hay cursos disponibles.
            </p>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const isEnrolled = enrolledCourseIds.has(course.id);
                  return (
                    <Card key={course.id} className="overflow-hidden shadow-md hover:shadow-primary/20 transition-shadow flex flex-col">
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
                            <Button size="sm" onClick={() => handleEnroll(course.id, course.title)} className="flex-1 bg-primary hover:bg-primary/90">
                              <CheckCircle className="mr-2 h-4 w-4" /> Inscribirme
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : ( // Vista de Lista
              <div className="space-y-4">
                {filteredCourses.map((course) => {
                   const isEnrolled = enrolledCourseIds.has(course.id);
                   return (
                    <Card key={course.id} className="shadow-md hover:shadow-primary/20 transition-shadow">
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
                            <Button size="sm" onClick={() => handleEnroll(course.id, course.title)} className="bg-primary hover:bg-primary/90">
                              <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" /> Inscribirme
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                   );
                })}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
