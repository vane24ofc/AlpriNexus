
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
  joinDate: string; // Keep for display, not editable in this form
  avatarUrl?: string;
  status: 'active' | 'inactive';
  // Password fields won't be pre-filled for security/simplicity in this example
}

// Sample users to simulate fetching data - in a real app, this would come from an API
const sampleUsersForEdit: User[] = [
  { id: 'user1', name: 'Carlos Administrador', email: 'admin@example.com', role: 'administrador', joinDate: '2023-01-15', avatarUrl: 'https://placehold.co/40x40.png?text=CA', status: 'active' },
  { id: 'user2', name: 'Isabel Instructora', email: 'instructor@example.com', role: 'instructor', joinDate: '2023-02-20', avatarUrl: 'https://placehold.co/40x40.png?text=II', status: 'active' },
  { id: 'user3', name: 'Esteban Estudiante', email: 'student@example.com', role: 'estudiante', joinDate: '2023-03-10', avatarUrl: 'https://placehold.co/40x40.png?text=EE', status: 'active' },
  { id: 'user4', name: 'Ana Otro-Estudiante', email: 'student2@example.com', role: 'estudiante', joinDate: '2023-05-01', avatarUrl: 'https://placehold.co/40x40.png?text=AE', status: 'inactive' },
  { id: 'user5', name: 'Roberto Instructor-Jefe', email: 'head.instructor@example.com', role: 'instructor', joinDate: '2023-01-25', status: 'active' },
];

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
      // Simulate API call to fetch user data
      setTimeout(() => {
        const userToEdit = sampleUsersForEdit.find(u => u.id === userId);
        if (userToEdit) {
          // For editing, we don't pre-fill password fields for security.
          // The form schema expects them, so provide empty strings.
          setInitialUserData({
            fullName: userToEdit.name,
            email: userToEdit.email,
            role: userToEdit.role,
            status: userToEdit.status,
            password: '', // Password fields should be re-entered if change is needed
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
        setIsLoadingUser(false);
      }, 500);
    }
  }, [userId, router, toast]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Datos del usuario a actualizar:", data);
    // Note: Password change logic would be more complex in a real app.
    // Here we just log, including the new password if entered.

    // Simulación de actualización de usuario
    // In a real app, here you would make an API call to update the user.
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    toast({
      title: "Usuario Actualizado Exitosamente",
      description: `La información del usuario "${data.fullName}" ha sido actualizada.`,
    });

    setIsSubmitting(false);
    router.push('/dashboard/admin/users'); // Redirigir a la lista de usuarios
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
