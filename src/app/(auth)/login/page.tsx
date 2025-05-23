
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/common/logo';
import { Mail, Lock } from 'lucide-react';
import type { Role } from '@/app/dashboard/layout'; // Import Role type

const formSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo inválida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate login
    console.log(values);
    
    let roleToStore: Role = 'estudiante'; // Default role

    if (values.email === 'admin@example.com') {
      roleToStore = 'administrador';
    } else if (values.email === 'instructor@example.com') {
      roleToStore = 'instructor';
    } else if (values.email === 'student@example.com') {
      roleToStore = 'estudiante';
    }

    // Store the role in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionRole', roleToStore);
    }

    // All roles redirect to /dashboard; DashboardLayout will handle showing correct content
    router.push('/dashboard');
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="items-center text-center">
        <Logo className="mb-4 h-10 w-auto" />
        <CardTitle className="text-3xl font-bold">Bienvenido de Nuevo</CardTitle>
        <CardDescription>
          Inicia sesión para acceder a tu cuenta de AlpriNexus.
          <br />
          <span className="text-xs">
            Admin: admin@example.com / password
            <br />
            Instructor: instructor@example.com / password
            <br />
            Estudiante: student@example.com / password
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="tu@ejemplo.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg">
              Iniciar Sesión
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
