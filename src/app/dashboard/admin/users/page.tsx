
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, MoreHorizontal, Edit, Trash2, ShieldCheck, BookUser, GraduationCap, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Role } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinDate: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
}

const sampleUsers: User[] = [
  { id: 'user1', name: 'Carlos Administrador', email: 'admin@example.com', role: 'administrador', joinDate: '2023-01-15', avatarUrl: 'https://placehold.co/40x40.png?text=CA', status: 'active' },
  { id: 'user2', name: 'Isabel Instructora', email: 'instructor@example.com', role: 'instructor', joinDate: '2023-02-20', avatarUrl: 'https://placehold.co/40x40.png?text=II', status: 'active' },
  { id: 'user3', name: 'Esteban Estudiante', email: 'student@example.com', role: 'estudiante', joinDate: '2023-03-10', avatarUrl: 'https://placehold.co/40x40.png?text=EE', status: 'active' },
  { id: 'user4', name: 'Ana Otro-Estudiante', email: 'student2@example.com', role: 'estudiante', joinDate: '2023-05-01', avatarUrl: 'https://placehold.co/40x40.png?text=AE', status: 'inactive' },
  { id: 'user5', name: 'Roberto Instructor-Jefe', email: 'head.instructor@example.com', role: 'instructor', joinDate: '2023-01-25', status: 'active' },
];

const roleDisplayInfo: Record<Role, { label: string; icon: React.ElementType; badgeClass: string }> = {
  administrador: { label: "Administrador", icon: ShieldCheck, badgeClass: "bg-primary text-primary-foreground" },
  instructor: { label: "Instructor", icon: BookUser, badgeClass: "bg-accent text-accent-foreground" },
  estudiante: { label: "Estudiante", icon: GraduationCap, badgeClass: "bg-secondary text-secondary-foreground" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const { toast } = useToast(); // Initialize useToast

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "Usuario Eliminado",
        description: `El usuario "${userToDelete.name}" ha sido eliminado (simulado).`,
        variant: "destructive",
      });
    }
  };
  
  const handleChangeRole = (userId: string, newRole: Role) => {
    const userToChange = users.find(user => user.id === userId);
    if (userToChange) {
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, role: newRole } : user));
      toast({
        title: "Rol de Usuario Actualizado",
        description: `El rol de "${userToChange.name}" ha sido cambiado a ${roleDisplayInfo[newRole].label} (simulado).`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Users className="mr-3 h-8 w-8 text-primary" />
          Gestión de Usuarios
        </h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/admin/users/new">
            <UserPlus className="mr-2 h-5 w-5" /> Añadir Nuevo Usuario
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Listado de Usuarios</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los usuarios registrados en la plataforma AlpriNexus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay usuarios registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell w-[60px]">Avatar</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Correo Electrónico</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha de Ingreso</TableHead>
                  <TableHead className="hidden md:table-cell">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleInfo = roleDisplayInfo[user.role];
                  const RoleIcon = roleInfo.icon;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="hidden md:table-cell">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {user.name}
                        <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell max-w-xs truncate">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${roleInfo.badgeClass} border-current`}>
                          <RoleIcon className="mr-1.5 h-3.5 w-3.5" />
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{new Date(user.joinDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Más acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                               <Link href={`/dashboard/admin/users/${user.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Editar Usuario
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Cambiar Rol a:</DropdownMenuLabel>
                            {(Object.keys(roleDisplayInfo) as Role[]).filter(r => r !== user.role).map(newRole => (
                                <DropdownMenuItem key={newRole} onClick={() => handleChangeRole(user.id, newRole)}>
                                    {React.createElement(roleDisplayInfo[newRole].icon, {className: "mr-2 h-4 w-4"})}
                                    {roleDisplayInfo[newRole].label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:!text-destructive focus:!text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
