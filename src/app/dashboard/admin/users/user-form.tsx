
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Role } from '@/app/dashboard/layout';
import { Eye, EyeOff, Loader2, Save, UserPlus, Shield, BookUser, GraduationCap, CheckCircle, XCircle, User, Mail } from 'lucide-react';

const userFormBaseSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Dirección de correo inválida." }),
  role: z.enum(['administrador', 'instructor', 'estudiante'], { required_error: "Debe seleccionar un rol." }),
  status: z.enum(['active', 'inactive'], { required_error: "Debe seleccionar un estado." }),
});

// Schema for creating a new user (passwords are required)
const createUserFormSchema = userFormBaseSchema.extend({
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "La confirmación de contraseña es obligatoria." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

// Schema for editing an existing user (passwords are optional)
const editUserFormSchema = userFormBaseSchema.extend({
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && !data.confirmPassword) return false; // if password, confirmPassword is required
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) return false; // if both, they must match
  if (data.password && data.password.length < 6) return false; // if password, must be min 6 chars
  return true;
}, {
  message: "Las contraseñas no coinciden o la nueva contraseña es demasiado corta (mín. 6 caracteres). Si no desea cambiar la contraseña, deje ambos campos vacíos.",
  path: ["confirmPassword"], 
});


type UserFormValues = z.infer<typeof createUserFormSchema> | z.infer<typeof editUserFormSchema>;

interface UserFormProps {
  initialData?: Partial<UserFormValues>;
  onSubmitUser: (data: UserFormValues) => Promise<void>;
  isSubmitting: boolean;
  isEditing?: boolean;
}

const roleOptions: { value: Role; label: string; icon: React.ElementType }[] = [
  { value: 'administrador', label: 'Administrador', icon: Shield },
  { value: 'instructor', label: 'Instructor', icon: BookUser },
  { value: 'estudiante', label: 'Estudiante', icon: GraduationCap },
];

const statusOptions: { value: 'active' | 'inactive'; label: string; icon: React.ElementType }[] = [
  { value: 'active', label: 'Activo', icon: CheckCircle },
  { value: 'inactive', label: 'Inactivo', icon: XCircle },
];

export default function UserForm({ initialData = {}, onSubmitUser, isSubmitting, isEditing = false }: UserFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formSchema = isEditing ? editUserFormSchema : createUserFormSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      password: '', // Passwords are not pre-filled for editing
      confirmPassword: '',
      role: initialData?.role || undefined,
      status: initialData?.status || 'active',
    },
  });
  
  // Update defaultValues if initialData changes (e.g., when data is fetched for editing)
  React.useEffect(() => {
    if (isEditing && initialData) {
      form.reset({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        role: initialData.role || undefined,
        status: initialData.status || 'active',
        password: '', // Important: Do not pre-fill passwords
        confirmPassword: '',
      });
    }
  }, [initialData, isEditing, form]);


  const processSubmit = async (data: UserFormValues) => {
    // If editing and password fields are empty, don't send them in the update.
    const submissionData = { ...data };
    if (isEditing && !submissionData.password) {
      delete submissionData.password;
      delete submissionData.confirmPassword;
    }
    await onSubmitUser(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Detalles del Usuario' : 'Detalles del Nuevo Usuario'}</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Actualice la información del usuario. Deje los campos de contraseña vacíos si no desea cambiarla.' 
                : 'Complete la información para crear un nuevo usuario en la plataforma.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo <span className="text-primary">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Ej: Ana López" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico <span className="text-primary">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="Ej: ana.lopez@ejemplo.com" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña {isEditing ? '(Dejar vacío para no cambiar)' : <span className="text-primary">*</span>}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={isEditing ? 'Nueva contraseña (opcional)' : "Mínimo 6 caracteres"}
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
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña {isEditing ? '(Dejar vacío para no cambiar)' : <span className="text-primary">*</span>}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={isEditing ? 'Confirmar nueva contraseña' : "Repetir contraseña"}
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol del Usuario <span className="text-primary">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center">
                              <opt.icon className="mr-2 h-4 w-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del Usuario <span className="text-primary">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center">
                              <opt.icon className="mr-2 h-4 w-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting 
              ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> 
              : (isEditing ? <Save className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />)
            }
            {isSubmitting ? (isEditing ? 'Guardando Cambios...' : 'Creando Usuario...') : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
