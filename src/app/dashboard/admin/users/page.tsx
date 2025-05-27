
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Users, MoreHorizontal, Edit, Trash2, ShieldCheck, BookUser, GraduationCap, UserPlus, Search, Loader2 } from 'lucide-react';
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
  name: string;
  email: string;
  role: Role;
  joinDate: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
}

const USERS_STORAGE_KEY = 'nexusAlpriAllUsers';

// Simulación de datos iniciales si localStorage está vacío o la API falla
const initialSampleUsers: User[] = [
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


interface UserRowProps {
    user: User;
    onOpenDialog: (user: User, type: 'delete' | 'changeRole', newRole?: Role) => void;
}

const MemoizedUserRow = React.memo(function UserRow({ user, onOpenDialog }: UserRowProps) {
    const roleInfo = roleDisplayInfo[user.role];
    const RoleIcon = roleInfo.icon;
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
            <TableCell className="hidden lg:table-cell whitespace-nowrap">{new Date(user.joinDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
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
  const [actionType, setActionType] = useState<'delete' | 'changeRole' | null>(null);
  const [newRoleForChange, setNewRoleForChange] = useState<Role | null>(null);

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    setSearchTerm(initialSearch);

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // TODO: Reemplazar con llamada a API: const fetchedUsers = await api.getUsers();
        // setUsers(fetchedUsers);
        
        // Fallback a localStorage mientras la API no está lista
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          setUsers(initialSampleUsers);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialSampleUsers));
        }
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        toast({ variant: "destructive", title: "Error al Cargar", description: "No se pudieron cargar los usuarios." });
        setUsers(initialSampleUsers); // Fallback a datos de ejemplo en caso de error
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [searchParams, toast]);

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

  const openDialog = useCallback((user: User, type: 'delete' | 'changeRole', newRole?: Role) => {
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

    // TODO: Reemplazar con llamada a API: await api.deleteUser(userToModify.id);
    const updatedUsers = users.filter(user => user.id !== userToModify.id);
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers)); // Actualiza localStorage

    toast({
      title: "Usuario Eliminado",
      description: `El usuario "${userName}" ha sido eliminado.`,
      variant: "destructive",
    });
    closeDialog();
  };
  
  const handleChangeRole = async () => {
    if (!userToModify || !newRoleForChange) return;
    const userName = userToModify.name;
    const newRoleLabel = roleDisplayInfo[newRoleForChange].label;

    // TODO: Reemplazar con llamada a API: await api.updateUserRole(userToModify.id, newRoleForChange);
    const updatedUsers = users.map(user => 
        user.id === userToModify.id ? { ...user, role: newRoleForChange! } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers)); // Actualiza localStorage

    toast({
      title: "Rol de Usuario Actualizado",
      description: `El rol de "${userName}" ha sido cambiado a ${newRoleLabel}.`,
    });
    closeDialog();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Actualizar URL sin recargar para que el término de búsqueda sea "bookmarkable"
    const params = new URLSearchParams(searchParams.toString());
    if (event.target.value) {
      params.set('search', event.target.value);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  //pathname no esta definido, lo defino asi:
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';


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
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDialog}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (actionType === 'delete') handleDeleteUser();
                  if (actionType === 'changeRole') handleChangeRole();
                }}
                className={actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {actionType === 'delete' && 'Eliminar Permanentemente'}
                {actionType === 'changeRole' && 'Confirmar Cambio de Rol'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
    
