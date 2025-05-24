
"use client";

import React, { useState } from 'react';
import UserForm from '@/app/dashboard/admin/users/user-form';
import type { Role } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2 } from 'lucide-react';

interface NewUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinDate: string;
  status: 'active' | 'inactive';
}

export default function CreateUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Datos del usuario a crear:", data);

    // Simulación de creación de usuario
    const newUser: NewUser = {
      id: crypto.randomUUID(),
      name: data.fullName,
      email: data.email,
      role: data.role,
      joinDate: new Date().toISOString().split('T')[0], // Fecha actual
      status: data.status,
    };

    // En una app real, aquí harías una llamada API para guardar el usuario.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular guardado

    toast({
      title: "Usuario Creado Exitosamente",
      description: `El usuario "${newUser.name}" con el rol de ${newUser.role} ha sido creado.`,
    });

    setIsSubmitting(false);
    router.push('/dashboard/admin/users'); // Redirigir a la lista de usuarios
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <UserPlus className="mr-3 h-8 w-8 text-primary" />
          Añadir Nuevo Usuario
        </h1>
      </div>
      <UserForm onSubmitUser={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
