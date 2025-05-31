
"use client";

import React, { useState } from 'react';
import UserForm from '@/app/dashboard/admin/users/user-form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

export default function CreateUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    // Ensure avatarUrl is an empty string if not provided, instead of null/undefined for the API
    const submissionData = {
      ...data,
      avatarUrl: data.avatarUrl || '', 
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status} al crear el usuario.`);
      }

      const result = await response.json();
      toast({
        title: "Usuario Creado Exitosamente",
        description: `El usuario "${data.fullName}" con ID ${result.userId} ha sido creado.`,
      });
      router.push('/dashboard/admin/users');
      router.refresh(); // Forzar actualización de la lista de usuarios en la página de destino
    } catch (error: any) {
      console.error("Error creando usuario:", error);
      toast({
        variant: "destructive",
        title: "Error al Crear Usuario",
        description: error.message || "No se pudo crear el nuevo usuario. Revise los datos o inténtelo más tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <UserPlus className="mr-3 h-8 w-8 text-primary" />
          Añadir Nuevo Usuario
        </h1>
      </div>
      <UserForm 
        onSubmitUser={handleSubmit} 
        isSubmitting={isSubmitting}
        isEditing={false}
      />
    </div>
  );
}
