
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Users, MoreHorizontal, Edit, Trash2, ShieldCheck, BookUser, GraduationCap, UserPlus, Search, Loader2, EyeOff, Eye as EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Role } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';

export interface User { 
  id: string; 
  name: string; 
  email: string;
  role: Role;
  joinDate: string; 
  avatarUrl?: string;
  status: 'active' | 'inactive';
  createdAt?: string; 
  updatedAt?: string;
}

interface ApiUser { 
  id: string; 
  fullName: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  avatarUrl?: string | null; 
  createdAt: string; 
  updatedAt: string; 
}

const roleDisplayInfo: Record<Role, { label: string; icon: React.ElementType; badgeClass: string }> = {
  administrador: { label: "Administrador", icon: ShieldCheck, badgeClass: "bg-primary text-primary-foreground" },
  instructor: { label: "Instructor", icon: BookUser, badgeClass: "bg-accent text-accent-foreground" },
  estudiante: { label: "Estudiante", icon: GraduationCap, badgeClass: "bg-secondary text-secondary-foreground" },
};

const SIMULATED_AUTH_TOKEN_KEY = 'simulatedAuthToken';

interface UserRowProps {
    user: User;
    onOpenDialog: (user: User, type: 'delete' | 'changeRole' | 'toggleStatus', newRole?: Role) => void;
}

const MemoizedUserRow = React.memo(function UserRow({ user, onOpenDialog }: UserRowProps) {
    const roleInfo = roleDisplayInfo[user.role];
    const RoleIcon = roleInfo.icon;
    const ToggleStatusIcon = user.status === 'active' ? EyeOff : EyeIcon;

    return (
        <TableRow>
            <TableCell className="hidden md:table-cell">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}`} alt={user.name} data-ai-hint="user avatar"/>
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            </TableCell>
            <TableCell className="font-medium max-w-[150px] sm:max-w-xs truncate">
            {user.name}
            <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
            </TableCell>
            <TableCell className="hidden sm:table-cell max-w-[150px] sm:max-w-xs truncate">{user.email}</TableCell>
            <TableCell>
            <Badge variant="outline" className={`text-xs ${roleInfo.badgeClass} border-current whitespace-nowrap`}>
                <RoleIcon className="mr-1.5 h-3.5 w-3.5" />
                {roleInfo.label}
            </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell whitespace-nowrap">{user.joinDate ? new Date(user.joinDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</TableCell>
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
                <DropdownMenuItem onClick={() => onOpenDialog(user, 'toggleStatus')}>
                    <ToggleStatusIcon className="mr-2 h-4 w-4" /> 
                    {user.status === 'active' ? 'Desactivar Usuario' : 'Activar Usuario'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                    {React.createElement(roleInfo.icon, {className: "mr-2 h-4 w-4"})}
                    Cambiar Rol a:
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {(Object.keys(roleDisplayInfo) as Role[]).filter(r => r !== user.role).map(newRoleKey => (
                            <DropdownMenuItem key={newRoleKey} onClick={() => onOpenDialog(user, 'changeRole', newRoleKey)}>
                                {React.createElement(roleDisplayInfo[newRoleKey].icon, {className: "mr-2 h-4 w-4"})}
                                {roleDisplayInfo[newRoleKey].label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onOpenDialog(user, 'delete')} className="text-destructive hover:!text-destructive focus:!text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuario
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});
MemoizedUserRow.displayName = 'MemoizedUserRow';

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userToModify, setUserToModify] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'changeRole' | 'toggleStatus' | null>(null);
  const [newRoleForChange, setNewRoleForChange] = useState<Role | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem(SIMULATED_AUTH_TOKEN_KEY);
    }

    if (!token) {
      toast({ variant: 'destructive', title: 'No Autorizado', description: 'No se encontró token de autenticación. Por favor, inicie sesión.' });
      router.push('/login');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast({ variant: 'destructive', title: 'Sesión Expirada o Inválida', description: 'Por favor, inicie sesión de nuevo.' });
          localStorage.removeItem(SIMULATED_AUTH_TOKEN_KEY); // Limpiar token inválido
          router.push('/login');
          setIsLoading(false);
          return;
        }
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const dataFromApi: ApiUser[] = await response.json();
      const mappedUsers: User[] = dataFromApi.map(apiUser => ({
        id: String(apiUser.id), 
        name: apiUser.fullName,
        email: apiUser.email,
        role: apiUser.role,
        status: apiUser.status,
        avatarUrl: apiUser.avatarUrl || undefined,
        joinDate: new Date(apiUser.createdAt).toISOString(),
        createdAt: apiUser.createdAt,
        updatedAt: apiUser.updatedAt,
      }));
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users from API:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Cargar Usuarios',
        description: error.message || 'No se pudieron obtener los usuarios del servidor.',
      });
      setUsers([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    setSearchTerm(initialSearch);
    fetchUsers();
  }, [searchParams, fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(lowercasedSearchTerm) ||
      user.email.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [users, searchTerm]);

  const openDialog = useCallback((user: User, type: 'delete' | 'changeRole' | 'toggleStatus', newRole?: Role) => {
    setUserToModify(user);
    setActionType(type);
    if (type === 'changeRole' && newRole) {
      setNewRoleForChange(newRole);
    }
  }, []);

  const closeDialog = () => {
    setUserToModify(null);
    setActionType(null);
    setNewRoleForChange(null);
  };
  
  const getAuthHeaders = (): HeadersInit | undefined => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(SIMULATED_AUTH_TOKEN_KEY);
      if (token) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
      }
    }
    // En caso de no encontrar token, el endpoint de API debería rechazar la petición
    // Pero para ser explícitos, podríamos forzar un error o manejarlo aquí.
    // Por ahora, si no hay token, la llamada fallará en el backend.
    return { 'Content-Type': 'application/json' };
  };


  const handleDeleteUser = async () => {
    if (!userToModify) return;
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/users/${userToModify.id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(), // Añadir cabeceras de autenticación
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el usuario.');
      }
      toast({
        title: "Usuario Eliminado",
        description: `El usuario "${userToModify.name}" ha sido eliminado.`,
      });
      fetchUsers(); 
      closeDialog();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error de Eliminación", description: error.message });
      closeDialog();
    } finally {
      setIsActionLoading(false);
    }
  };
  
  const handleChangeRole = async () => {
    if (!userToModify || !newRoleForChange) return;
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/users/${userToModify.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRoleForChange }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar el rol.');
      }
      toast({
        title: "Rol de Usuario Actualizado",
        description: `El rol de "${userToModify.name}" ha sido cambiado a ${roleDisplayInfo[newRoleForChange].label}.`,
      });
      fetchUsers(); 
      closeDialog();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error de Actualización de Rol", description: error.message });
      closeDialog();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!userToModify) return;
    setIsActionLoading(true);
    const newStatus = userToModify.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`/api/users/${userToModify.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar el estado del usuario.');
      }
      toast({
        title: `Usuario ${newStatus === 'active' ? 'Activado' : 'Desactivado'}`,
        description: `El usuario "${userToModify.name}" ha sido ${newStatus === 'active' ? 'activado' : 'desactivado'}.`,
      });
      fetchUsers(); 
      closeDialog();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al Cambiar Estado", description: error.message });
      closeDialog();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    const params = new URLSearchParams(searchParams.toString());
    if (newSearchTerm) {
      params.set('search', newSearchTerm);
    } else {
      params.delete('search');
    }
    const currentPathname = typeof window !== 'undefined' ? window.location.pathname : '';
    router.replace(`${currentPathname}?${params.toString()}`, { scroll: false });
  };
  
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando usuarios...</p>
      </div>
    );
  }

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
            Visualiza, gestiona y busca usuarios registrados en AlpriNexus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre o correo electrónico..."
                className="pl-10 w-full md:w-1/2 lg:w-1/3"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {searchTerm ? `No se encontraron usuarios para "${searchTerm}".` : "No hay usuarios registrados en la base de datos."}
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                {filteredUsers.map((user) => (
                  <MemoizedUserRow key={user.id} user={user} onOpenDialog={openDialog} />
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {userToModify && actionType && (
        <AlertDialog open={!!userToModify} onOpenChange={closeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === 'delete' && `¿Estás seguro de que quieres eliminar permanentemente al usuario "${userToModify.name}"? Esta acción no se puede deshacer.`}
                {actionType === 'changeRole' && `¿Estás seguro de que quieres cambiar el rol de "${userToModify.name}" a ${newRoleForChange ? roleDisplayInfo[newRoleForChange].label : ''}?`}
                {actionType === 'toggleStatus' && `¿Estás seguro de que quieres ${userToModify.status === 'active' ? 'desactivar' : 'activar'} al usuario "${userToModify.name}"?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDialog} disabled={isActionLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (actionType === 'delete') handleDeleteUser();
                  if (actionType === 'changeRole') handleChangeRole();
                  if (actionType === 'toggleStatus') handleToggleUserStatus();
                }}
                disabled={isActionLoading}
                className={actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : (actionType === 'toggleStatus' && userToModify.status === 'active' ? 'bg-orange-500 hover:bg-orange-600 text-white' : (actionType === 'toggleStatus' && userToModify.status === 'inactive' ? 'bg-green-500 hover:bg-green-600 text-white': ''))}
              >
                {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {actionType === 'delete' && 'Eliminar Permanentemente'}
                {actionType === 'changeRole' && 'Confirmar Cambio de Rol'}
                {actionType === 'toggleStatus' && (userToModify.status === 'active' ? 'Desactivar Usuario' : 'Activar Usuario')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
