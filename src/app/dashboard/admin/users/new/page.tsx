
"use client";

import React, { useState } from 'react';
import UserForm from '@/app/dashboard/admin/users/user-form';
import type { Role } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinDate: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
}

const USERS_STORAGE_KEY = 'nexusAlpriAllUsers';

export default function CreateUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Datos del usuario a crear:", data);

    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.fullName,
      email: data.email,
      role: data.role,
      joinDate: new Date().toISOString().split('T')[0],
      status: data.status,
      avatarUrl: `https://placehold.co/40x40.png?text=${data.fullName.split(' ').map((n:string) => n[0]).join('').toUpperCase()}`
    };

    try {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        users.push(newUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

        toast({
          title: "Usuario Creado Exitosamente",
          description: `El usuario "${newUser.name}" con el rol de ${newUser.role} ha sido creado y guardado localmente.`,
        });
        router.push('/dashboard/admin/users');
    } catch (error) {
        console.error("Error saving new user to localStorage:", error);
        toast({
            variant: "destructive",
            title: "Error al Guardar",
            description: "No se pudo guardar el nuevo usuario localmente."
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
      <UserForm onSubmitUser={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

    