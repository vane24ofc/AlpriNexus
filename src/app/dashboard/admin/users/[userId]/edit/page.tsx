
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserForm from '@/app/dashboard/admin/users/user-form';
import type { Role } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit } from 'lucide-react';

interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [initialUserData, setInitialUserData] = useState<any | undefined>(undefined); // UserForm expects fullName, etc.

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setIsLoadingUser(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Usuario no encontrado o error al cargar.');
      }
      const userFromApi: ApiUser = await response.json();
      setInitialUserData({
        fullName: userFromApi.fullName,
        email: userFromApi.email,
        role: userFromApi.role,
        status: userFromApi.status,
        avatarUrl: userFromApi.avatarUrl || '', // Ensure avatarUrl is always a string for the form
        // Passwords are not fetched or pre-filled for editing security
        password: '', 
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error("Error cargando usuario para editar:", error);
      toast({ variant: "destructive", title: "Error al Cargar Usuario", description: error.message });
      router.push('/dashboard/admin/users');
    } finally {
      setIsLoadingUser(false);
    }
  }, [userId, router, toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    const submissionData = { ...data };
    // If password fields are empty (or only one is filled, zod would catch), don't send them.
    // The API will only update password if it's present in the body.
    if (!submissionData.password || submissionData.password.trim() === '') {
      delete submissionData.password;
      delete submissionData.confirmPassword;
    }

    // Ensure avatarUrl is an empty string if not provided, instead of null/undefined
    submissionData.avatarUrl = submissionData.avatarUrl || '';

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status} al actualizar el usuario.`);
      }

      toast({
        title: "Usuario Actualizado Exitosamente",
        description: `La información del usuario "${data.fullName}" ha sido actualizada.`,
      });
      router.push('/dashboard/admin/users');
      router.refresh(); // Forzar actualización de la lista de usuarios
    } catch (error: any) {
      console.error("Error actualizando usuario:", error);
      toast({ variant: "destructive", title: "Error al Actualizar", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando datos del usuario...</p>
      </div>
    );
  }

  if (!initialUserData) {
    return (
         <div className="flex h-screen flex-col items-center justify-center space-y-4">
            <p className="text-lg text-destructive">No se pudieron cargar los datos del usuario para editar.</p>
         </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Edit className="mr-3 h-8 w-8 text-primary" />
          Editar Usuario: {initialUserData.fullName}
        </h1>
      </div>
      <UserForm 
        onSubmitUser={handleSubmit} 
        isSubmitting={isSubmitting}
        initialData={initialUserData}
        isEditing={true}
      />
    </div>
  );
}
