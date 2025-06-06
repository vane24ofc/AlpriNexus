
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
  password: z.string().min(1, { message: 'La contraseña es requerida.' }),
  rememberMe: z.boolean().optional(),
});

interface UserApiResponse {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    status: 'active' | 'inactive';
    avatarUrl?: string | null;
}

const SIMULATED_AUTH_TOKEN_KEY = 'simulatedAuthToken';
const DUMMY_TOKEN_VALUE = 'secret-dummy-token-123';

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const responseData = await response.json(); 

      console.log('LOGIN PAGE: API Response Status:', response.status); 
      console.log('LOGIN PAGE: API Response Data:', responseData); 

      if (!response.ok) {
        throw new Error(responseData.message || `Error ${response.status} en el inicio de sesión.`);
      }
      
      const { user } = responseData as { user: UserApiResponse };

      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionRole', user.role);
        localStorage.setItem('nexusAlpriUserProfile', JSON.stringify({ name: user.fullName, email: user.email, id: user.id, avatarUrl: user.avatarUrl }));
        localStorage.setItem(SIMULATED_AUTH_TOKEN_KEY, DUMMY_TOKEN_VALUE); 
        
        if (values.rememberMe) {
          localStorage.setItem('rememberUser', 'true');
        } else {
          localStorage.removeItem('rememberUser');
        }
      }
      
      toast({ title: "Inicio de Sesión Exitoso", description: `¡Bienvenido de nuevo, ${user.fullName}!` });
      router.push('/dashboard');
      // router.refresh(); // Comentado para evitar problemas de redirección
      
    } catch (error: any) {
      console.error("Login error:", error); 
      toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: error.message || "Credenciales incorrectas o error del servidor." });
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
          src="https://placehold.co/800x1000.png" 
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
