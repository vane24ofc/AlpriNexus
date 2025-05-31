
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
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

interface User {
  id: string;
  name: string; // Corresponds to fullName from API
  email: string;
  role: Role;
  joinDate: string; // Derived from createdAt from API
  avatarUrl?: string;
  status: 'active' | 'inactive';
  // Add createdAt and updatedAt if needed for direct use, though joinDate is derived
  createdAt?: string; 
  updatedAt?: string;
}

// For API response structure
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


const USERS_STORAGE_KEY = 'nexusAlpriAllUsers';

// Simulación de datos iniciales si localStorage está vacío o la API falla
const initialSampleUsers: User[] = [
  { id: 'user1', name: 'Carlos Administrador', email: 'admin@example.com', role: 'administrador', joinDate: '2023-01-15', avatarUrl: 'https://placehold.co/40x40.png?text=CA', status: 'active' },
  { id: 'user2', name: 'Isabel Instructora', email: 'instructor@example.com', role: 'instructor', joinDate: '2023-02-20', avatarUrl: 'https://placehold.co/40x40.png?text=II', status: 'active' },
  { id: 'user3', name: 'Esteban Estudiante', email: 'student@example.com', role: 'estudiante', joinDate: '2023-03-10', avatarUrl: 'https://placehold.co/40x40.png?text=EE', status: 'active' },
];

const roleDisplayInfo: Record<Role, { label: string; icon: React.ElementType; badgeClass: string }> = {
  administrador: { label: "Administrador", icon: ShieldCheck, badgeClass: "bg-primary text-primary-foreground" },
  instructor: { label: "Instructor", icon: BookUser, badgeClass: "bg-accent text-accent-foreground" },
  estudiante: { label: "Estudiante", icon: GraduationCap, badgeClass: "bg-secondary text-secondary-foreground" },
};


interface UserRowProps {
    user: User;
    onOpenDialog: (user: User, type: 'delete' | 'changeRole' | 'toggleStatus', newRole?: Role) => void;
}

const MemoizedUserRow = React.memo(function UserRow({ user, onOpenDialog }: UserRowProps) {
    const roleInfo = roleDisplayInfo[user.role];
    const RoleIcon = roleInfo.icon;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const ToggleStatusIcon = user.status === 'active' ? EyeOff : EyeIcon;

    return (
        <TableRow>
            <TableCell className="hidden md:table-cell">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar"/>
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

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const dataFromApi: ApiUser[] = await response.json();
      const mappedUsers: User[] = dataFromApi.map(apiUser => ({
        id: apiUser.id,
        name: apiUser.fullName,
        email: apiUser.email,
        role: apiUser.role,
        status: apiUser.status,
        avatarUrl: apiUser.avatarUrl,
        joinDate: new Date(apiUser.createdAt).toISOString().split('T')[0],
        createdAt: apiUser.createdAt,
        updatedAt: apiUser.updatedAt,
      }));
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users from API:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Cargar Usuarios',
        description: error.message || 'No se pudieron obtener los usuarios del servidor. Mostrando datos de ejemplo.',
      });
      // Fallback to localStorage/sample data if API fails
      try {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          setUsers(initialSampleUsers);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialSampleUsers));
        }
      } catch (localError) {
        console.error("Error cargando usuarios desde localStorage tras fallo de API:", localError);
        setUsers(initialSampleUsers); // Ultimate fallback
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    setSearchTerm(initialSearch);
    fetchUsers();
  }, [searchParams, fetchUsers]);

  // Temporarily keep localStorage for Edit/Delete/ChangeRole/ToggleStatus simulation
  // This useEffect will be removed or modified once PUT/DELETE APIs are implemented
  useEffect(() => {
    if (!isLoading && users.length > 0 && localStorage.getItem(USERS_STORAGE_KEY)) { 
      // Only update localStorage if it was already used (e.g., after a modification simulation)
      // Or if the API failed and we are relying on local data.
      // For now, let's be cautious and only update if there's an explicit simulated modification
      // This part needs refinement once actual API calls for mutations are in place.
      // For now, let's assume that if fetchUsers failed and used localStorage, we want to save changes made via UI back to localStorage.
      const apiFailedAndLocalStorageUsed = users === initialSampleUsers || (localStorage.getItem(USERS_STORAGE_KEY) && users !== initialSampleUsers);
      if (apiFailedAndLocalStorageUsed) {
         localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    } else if (!isLoading && users.length === 0 && !localStorage.getItem(USERS_STORAGE_KEY)) {
      // If API returns no users and localStorage is also empty, maybe store empty or sample
    }
  }, [users, isLoading]);


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

  const handleDeleteUser = async () => {
    if (!userToModify) return;
    const userName = userToModify.name;
    // TODO: Implement API DELETE /api/users/[userId]
    // For now, simulate with localStorage:
    const updatedUsers = users.filter(user => user.id !== userToModify!.id);
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers)); // Persist simulated change
    
    toast({
      title: "Usuario Eliminado (Simulado)",
      description: `El usuario "${userName}" ha sido eliminado localmente.`,
      variant: "destructive",
    });
    closeDialog();
  };
  
  const handleChangeRole = async () => {
    if (!userToModify || !newRoleForChange) return;
    const userName = userToModify.name;
    const newRoleLabel = roleDisplayInfo[newRoleForChange].label;
    // TODO: Implement API PUT /api/users/[userId] { role: newRoleForChange }
    // For now, simulate with localStorage:
    const updatedUsers = users.map(user => 
            user.id === userToModify!.id ? { ...user, role: newRoleForChange! } : user
        );
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers)); // Persist simulated change
    
    toast({
      title: "Rol de Usuario Actualizado (Simulado)",
      description: `El rol de "${userName}" ha sido cambiado a ${newRoleLabel} localmente.`,
    });
    closeDialog();
  };

  const handleToggleUserStatus = async () => {
    if (!userToModify) return;
    const newStatus = userToModify.status === 'active' ? 'inactive' : 'active';
    const userName = userToModify.name;
    const statusMessage = newStatus === 'active' ? 'activado' : 'desactivado';

    // TODO: Implement API PUT /api/users/[userId] { status: newStatus }
    // For now, simulate with localStorage:
    const updatedUsers = users.map(user =>
        user.id === userToModify!.id ? { ...user, status: newStatus } : user
      );
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers)); // Persist simulated change

    toast({
      title: `Usuario ${statusMessage} (Simulado)`,
      description: `El usuario "${userName}" ha sido ${statusMessage} localmente.`,
    });
    closeDialog();
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
              {searchTerm ? `No se encontraron usuarios para "${searchTerm}".` : "No hay usuarios registrados."}
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
              <AlertDialogCancel onClick={closeDialog}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (actionType === 'delete') handleDeleteUser();
                  if (actionType === 'changeRole') handleChangeRole();
                  if (actionType === 'toggleStatus') handleToggleUserStatus();
                }}
                className={actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : (actionType === 'toggleStatus' && userToModify.status === 'active' ? 'bg-orange-500 hover:bg-orange-600 text-white' : (actionType === 'toggleStatus' && userToModify.status === 'inactive' ? 'bg-green-500 hover:bg-green-600 text-white': ''))}
              >
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
    
