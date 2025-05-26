
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserForm from '@/app/dashboard/admin/users/user-form';
import type { Role } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinDate: string; 
  avatarUrl?: string;
  status: 'active' | 'inactive';
}

const USERS_STORAGE_KEY = 'nexusAlpriAllUsers';

export default function EditUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [initialUserData, setInitialUserData] = useState<any | undefined>(undefined);

  useEffect(() => {
    if (userId) {
      setIsLoadingUser(true);
      try {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
          const users: User[] = JSON.parse(storedUsers);
          const userToEdit = users.find(u => u.id === userId);
          if (userToEdit) {
            setInitialUserData({
              fullName: userToEdit.name,
              email: userToEdit.email,
              role: userToEdit.role,
              status: userToEdit.status,
              password: '', 
              confirmPassword: '',
            });
          } else {
            toast({
              variant: "destructive",
              title: "Usuario no encontrado",
              description: "No se pudo encontrar el usuario para editar.",
            });
            router.push('/dashboard/admin/users');
          }
        } else {
            toast({
                variant: "destructive",
                title: "Datos no encontrados",
                description: "No hay usuarios guardados localmente para editar.",
            });
            router.push('/dashboard/admin/users');
        }
      } catch (error) {
        console.error("Error loading user for editing from localStorage:", error);
        toast({ variant: "destructive", title: "Error al Cargar", description: "No se pudo cargar el usuario para editar." });
      } finally {
        setIsLoadingUser(false);
      }
    }
  }, [userId, router, toast]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Datos del usuario a actualizar:", data);
    
    try {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex > -1) {
            const currentUserData = users[userIndex];
            users[userIndex] = {
                ...currentUserData,
                name: data.fullName,
                email: data.email,
                role: data.role,
                status: data.status,
                // Password update logic would be more complex here,
                // involving hashing if it were a real backend.
                // For localStorage, we'd just store the new password if provided.
            };
            // If data.password is provided and valid, it would be handled here.
            // For this simulation, we're not directly updating a password in localStorage
            // unless UserForm explicitly returns it for submissionData.

            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
            toast({
              title: "Usuario Actualizado Exitosamente",
              description: `La información del usuario "${data.fullName}" ha sido actualizada.`,
            });
        } else {
            toast({ variant: "destructive", title: "Error de Actualización", description: "No se encontró el usuario para actualizar." });
        }
        router.push('/dashboard/admin/users');
    } catch (error) {
        console.error("Error updating user in localStorage:", error);
        toast({ variant: "destructive", title: "Error al Guardar", description: "No se pudo guardar el usuario actualizado localmente." });
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

    