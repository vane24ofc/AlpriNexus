
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart3, Zap, Award, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StudentDashboardPage() {
  const enrolledCourses = [
    { id: "course1", name: "Introducción a la Programación", instructor: "Dr. Ada Lovelace", progress: 75, image: "https://placehold.co/600x400.png?text=Curso+1", dataAiHint: "programming course" },
    { id: "course2", name: "Bootcamp de Desarrollo Web", instructor: "Prof. Tim Berners-Lee", progress: 40, image: "https://placehold.co/600x400.png?text=Curso+2", dataAiHint: "web development" },
    { id: "course3", name: "Fundamentos de Ciencia de Datos", instructor: "Dr. Alan Turing", progress: 90, image: "https://placehold.co/600x400.png?text=Curso+3", dataAiHint: "data science" },
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
          <Image src="https://placehold.co/300x200.png" alt="Curso Reciente" width={300} height={200} className="rounded-lg shadow-md object-cover" data-ai-hint="education learning"/>
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
}
