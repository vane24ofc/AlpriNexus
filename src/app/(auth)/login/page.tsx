
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/common/logo';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import type { Role } from '@/app/dashboard/layout';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo inválida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Simulación de llamada a API
      // En un futuro, esto sería:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: values.email, password: values.password }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Error en el inicio de sesión');
      // }
      // const data = await response.json(); // data contendría { token: '...', user: { role: '...', name: '...' email: '...' } }
      
      // Simulación de respuesta exitosa de API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red

      let roleFromApi: Role = 'estudiante'; 
      let userNameFromApi = 'Estudiante Ejemplo';
      const emailFromApi = values.email;

      // Lógica de roles basada en email (simulación, esto vendría del backend)
      if (values.email === 'admin@example.com' && values.password === 'password') {
        roleFromApi = 'administrador';
        userNameFromApi = 'Admin Nexus';
      } else if (values.email === 'instructor@example.com' && values.password === 'password') {
        roleFromApi = 'instructor';
        userNameFromApi = 'Instructor Pro';
      } else if ((values.email === 'student@example.com' || values.email === 'estudiante@example.com') && values.password === 'password') {
        roleFromApi = 'estudiante';
        userNameFromApi = `Estudiante ${values.email.split('@')[0]}`;
      } else {
        // Simular credenciales incorrectas
        throw new Error('Credenciales incorrectas. Inténtalo de nuevo.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionRole', roleFromApi);
        localStorage.setItem('nexusAlpriUserProfile', JSON.stringify({ name: userNameFromApi, email: emailFromApi }));
        // En un futuro, también guardaríamos el token: localStorage.setItem('authToken', data.token);
        if (values.rememberMe) {
          // La lógica de "Remember Me" podría ser más compleja, por ahora solo se registra el valor.
          // El backend usualmente manejaría esto con tokens de mayor duración.
          localStorage.setItem('rememberUser', 'true');
        } else {
          localStorage.removeItem('rememberUser');
        }
      }
      
      toast({ title: "Inicio de Sesión Exitoso", description: `¡Bienvenido de nuevo, ${userNameFromApi}!` });
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Login error:", error);
      toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: error.message || "Ocurrió un error inesperado." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-4xl overflow-hidden rounded-lg bg-card shadow-xl min-h-[700px]">
      {/* Columna del Formulario */}
      <div className="w-full p-8 md:w-1/2 flex flex-col justify-center">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-6 h-9 w-auto" href="/" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">¡Bienvenido de nuevo!</h1>
          <p className="mt-2 mb-6 text-muted-foreground">
            Ingresa para obtener acceso ilimitado a datos e información.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico <span className="text-primary">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="tu@ejemplo.com" {...field} disabled={isSubmitting} />
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
                    <FormLabel>Contraseña <span className="text-primary">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Ingresa tu contraseña" 
                          {...field} 
                          className="pr-10"
                          disabled={isSubmitting}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          <span className="sr-only">{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-muted-foreground">
                        Recordarme
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Link href="#" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Button type="submit" className="w-full text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Columna Decorativa */}
      <div className="hidden bg-muted md:block md:w-1/2 relative">
        <Image 
          src="/login-decorative.png" 
          alt="Diseño abstracto decorativo para inicio de sesión" 
          fill
          style={{objectFit: 'cover'}}
          data-ai-hint="professional learning"
          priority
        />
      </div>
    </div>
  );
}
