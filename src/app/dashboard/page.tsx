
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, BookOpen, Users, Activity } from "lucide-react";
import Image from "next/image";

export default function DashboardHomePage() {
  // This could be dynamic based on user role
  const userName = "Usuario Demo"; 
  const role = "Estudiante"; // or 'Instructor', 'Administrador'

  const quickLinks = [
    { title: "Mis Cursos", translatedTitle: "mis cursos", href: "/dashboard/student/my-courses", icon: BookOpen, roles: ['estudiante', 'instructor'] },
    { title: "Gestión de Usuarios", translatedTitle: "gestión de usuarios", href: "/dashboard/admin/users", icon: Users, roles: ['administrador'] },
    { title: "Ver Progreso", translatedTitle: "ver progreso", href: "/dashboard/student/progress", icon: BarChart, roles: ['estudiante'] },
    { title: "Subir Recursos", translatedTitle: "subir recursos", href: "/dashboard/resources", icon: Activity, roles: ['administrador', 'instructor'] },
  ].filter(link => link.roles.includes(role.toLowerCase()));


  return (
    <div className="space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold">¡Bienvenido de nuevo, {userName}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Has iniciado sesión como {role}. Aquí&apos;s un resumen rápido de tu panel de AlpriNexus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Explora tus cursos, gestiona contenido o sigue tu progreso. Usa la barra lateral para navegar por las diferentes secciones de la plataforma.
          </p>
          {quickLinks.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mb-3">Enlaces Rápidos:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map(link => (
                  <Button key={link.title} variant="outline" asChild className="justify-start p-6 text-left h-auto hover:bg-primary/10 hover:border-primary">
                    <Link href={link.href}>
                      <link.icon className="mr-3 h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold">{link.title}</p>
                        <p className="text-xs text-muted-foreground">Ir a {link.translatedTitle}</p>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +50 nuevas inscripciones esta semana
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              Tasa de finalización promedio
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Curso Destacado</CardTitle>
            <CardDescription>Echa un vistazo a nuestro último curso destacado para mejorar tus habilidades.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:flex">
            <div className="md:w-1/2">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Curso Destacado"
                width={600}
                height={400}
                className="object-cover w-full h-full"
                data-ai-hint="online course learning"
              />
            </div>
            <div className="p-6 md:w-1/2 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-2">Desarrollo Web Avanzado</h3>
              <p className="text-muted-foreground mb-4">
                Domina las tecnologías web modernas, incluyendo React, Node.js y GraphQL. Construye aplicaciones complejas y escalables.
              </p>
              <Button asChild className="self-start">
                <Link href="#">Saber Más</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

    </div>
  );
}
