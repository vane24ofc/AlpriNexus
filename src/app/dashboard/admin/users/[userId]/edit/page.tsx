
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserForm from '@/app/dashboard/admin/users/user-form';
import type { Role } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Importar Button

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
  const [initialUserData, setInitialUserData] = useState<any | undefined>(undefined);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setIsLoadingUser(false);
      toast({ variant: "destructive", title: "Error", description: "ID de usuario no válido."});
      router.push('/dashboard/admin/users');
      return;
    }
    setIsLoadingUser(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Usuario no encontrado o error al cargar.' }));
        throw new Error(errorData.message || 'Usuario no encontrado o error al cargar.');
      }
      const userFromApi: ApiUser = await response.json();
      setInitialUserData({
        fullName: userFromApi.fullName,
        email: userFromApi.email,
        role: userFromApi.role,
        status: userFromApi.status,
        avatarUrl: userFromApi.avatarUrl || '',
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
    if (!submissionData.password || submissionData.password.trim() === '') {
      delete submissionData.password;
      delete submissionData.confirmPassword;
    }
    submissionData.avatarUrl = submissionData.avatarUrl || '';

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status} al actualizar el usuario.` }));
        throw new Error(errorData.message || `Error ${response.status} al actualizar el usuario.`);
      }

      toast({
        title: "Usuario Actualizado Exitosamente",
        description: `La información del usuario "${data.fullName}" ha sido actualizada.`,
      });
      router.push('/dashboard/admin/users');
      router.refresh();
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

  if (!initialUserData && !isLoadingUser) {
    return (
         <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center p-4">
            <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
            <p className="text-xl font-semibold text-destructive">Error al Cargar Usuario</p>
            <p className="text-muted-foreground">No se pudieron cargar los datos del usuario para editar. Es posible que el usuario no exista o haya un problema de red.</p>
            <Button onClick={() => router.push('/dashboard/admin/users')} className="mt-4">Volver a Usuarios</Button>
         </div>
    );
  }
  
  if (!initialUserData) { // Este caso puede ser redundante por el anterior pero es una salvaguarda
    return null; // O algún otro UI de carga/error si isLoadingUser es true pero initialUserData aún no está
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
