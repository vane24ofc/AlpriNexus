
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
import { Eye, EyeOff } from 'lucide-react';
import type { Role } from '@/app/dashboard/layout';
import React, { useState } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo inválida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  rememberMe: z.boolean().optional(),
});

// Inline SVG for Google icon
const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.7 512 244 512 110.3 512 0 401.7 0 265.2 0 128.5 110.3 18.5 244 18.5c71.4 0 126.9 27.8 175 74.8l-66.5 64.2c-28.4-26.8-64.8-44.8-108.5-44.8-82.9 0-150.7 67.4-150.7 150.9s67.8 150.9 150.7 150.9c87.4 0 125.8-39.1 133.6-90.9H244v-74.6h236.6c2.5 12.4 4.6 25.5 4.6 40.2z"></path></svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    
    let roleToStore: Role = 'estudiante'; 

    if (values.email === 'admin@example.com') {
      roleToStore = 'administrador';
    } else if (values.email === 'instructor@example.com') {
      roleToStore = 'instructor';
    } else if (values.email === 'student@example.com') {
      roleToStore = 'estudiante';
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionRole', roleToStore);
    }
    router.push('/dashboard');
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
          
          <div className="text-xs text-muted-foreground mb-4 p-3 border border-dashed border-border rounded-md bg-background/30">
            <p className="font-semibold mb-1">Credenciales de prueba:</p>
            Admin: admin@example.com / password <br />
            Instructor: instructor@example.com / password <br />
            Estudiante: student@example.com / password
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico <span className="text-primary">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="tu@ejemplo.com" {...field} />
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
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
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
              <Button type="submit" className="w-full text-base font-semibold">
                Iniciar Sesión
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                O inicia sesión con
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full text-base">
            <GoogleIcon />
            Continuar con Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Columna Decorativa */}
      <div className="hidden bg-gray-100 md:block md:w-1/2 relative">
        <Image 
          src="https://placehold.co/800x1000.png" // Placeholder para el arte abstracto
          alt="Diseño abstracto decorativo" 
          layout="fill" 
          objectFit="cover"
          data-ai-hint="abstract geometric colorful pattern"
        />
      </div>
    </div>
  );

    