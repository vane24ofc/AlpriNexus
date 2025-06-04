
"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Shield, BookOpen, Eye, Users, Globe, Loader2, Trash2, Edit3, Briefcase, Grid, List, PlusCircle, Search as SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSessionRole, type Role } from '@/app/dashboard/layout';
import { FileUploader } from "@/components/uploads/file-uploader";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog, // Ensure AlertDialog (root) is imported
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as ConfirmDialogContent, // This is okay as an alias
  AlertDialogDescription as ConfirmDialogDescription,
  AlertDialogFooter as ConfirmDialogFooter,
  AlertDialogHeader as ConfirmDialogHeader,
  AlertDialogTitle as ConfirmDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

type FileVisibility = 'private' | 'instructors' | 'public';
type FileCategory = 'company' | 'learning';

interface ResourceFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  url?: string;
  visibility: FileVisibility;
  category: FileCategory;
  uploaderUserId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  url?: string;
  visibility: FileVisibility;
  category: FileCategory;
  uploaderUserId?: number;
  createdAt?: string;
  updatedAt?: string;
  actingUserRole?: Role; 
}

const SIMULATED_AUTH_TOKEN_KEY = 'simulatedAuthToken';

const visibilityOptions: { value: FileVisibility; label: string; icon: React.ElementType; badgeClass?: string }[] = [
  { value: 'public', label: 'Todos (Público)', icon: Globe, badgeClass: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700' },
  { value: 'instructors', label: 'Instructores y Admins', icon: Users, badgeClass: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700' },
  { value: 'private', label: 'Solo para mí (Privado)', icon: Eye, badgeClass: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600' },
];

const categoryOptions: { value: FileCategory; label: string; icon: React.ElementType }[] = [
  { value: 'learning', label: 'Archivos de Aprendizaje', icon: BookOpen },
  { value: 'company', label: 'Recursos de la Empresa', icon: Briefcase },
];

const getFileIcon = (fileType: string): React.ElementType => {
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return FileText;
  if (type.includes('imagen') || type.includes('image') || type.includes('jpg') || type.includes('png')) return FileText; // Could use ImageIcon from lucide if specific icons are needed
  if (type.includes('video')) return FileText; // Could use VideoIcon
  if (type.includes('documento') || type.includes('doc') || type.includes('word')) return FileText;
  return FileText;
};

export default function ResourcesPage() {
  const { currentSessionRole } = useSessionRole();
  const { toast } = useToast();
  const [allResourcesFromApi, setAllResourcesFromApi] = useState<ResourceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [resourceToDelete, setResourceToDelete] = useState<ResourceFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceFile | null>(null);
  
  const [editFormName, setEditFormName] = useState('');
  const [editFormVisibility, setEditFormVisibility] = useState<FileVisibility>('public');
  const [editFormCategory, setEditFormCategory] = useState<FileCategory>('learning');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [filterCategory, setFilterCategory] = useState<FileCategory | 'all'>('all');
  const [filterVisibility, setFilterVisibility] = useState<FileVisibility | 'all'>('all');

  const canUploadAndManage = useMemo(() => currentSessionRole === 'administrador' || currentSessionRole === 'instructor', [currentSessionRole]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(errorData.message || `Fallo al cargar recursos (status: ${response.status})`);
      }
      const apiData: ResourceFile[] = await response.json();
      setAllResourcesFromApi(apiData);
    } catch (error: any) {
      console.error("Error cargando recursos:", error);
      toast({ variant: "destructive", title: "Error al Cargar Recursos", description: error.message });
      setAllResourcesFromApi([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleResourceRegistered = useCallback((newResource: ApiResource) => {
    toast({
      title: "Recurso Registrado",
      description: `El recurso "${newResource.name}" fue añadido. Actualizando lista...`,
    });
    setIsUploadModalOpen(false);
    fetchResources();
  }, [fetchResources, toast]);

  const filteredResources = useMemo(() => {
    return allResourcesFromApi.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) || file.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategoryFilter = filterCategory === 'all' || file.category === filterCategory;
      
      let isVisibleToCurrentUser = false;
      if (currentSessionRole === 'administrador') {
        isVisibleToCurrentUser = true;
      } else if (currentSessionRole === 'instructor') {
        isVisibleToCurrentUser = file.visibility === 'public' || file.visibility === 'instructors' || (file.visibility === 'private' && file.category === 'learning');
      } else { 
        isVisibleToCurrentUser = file.visibility === 'public';
      }

      const matchesVisibilityFilter = filterVisibility === 'all' || file.visibility === filterVisibility;
      return matchesSearch && matchesCategoryFilter && isVisibleToCurrentUser && (currentSessionRole === 'administrador' ? matchesVisibilityFilter : true) ;
    });
  }, [allResourcesFromApi, searchTerm, filterCategory, filterVisibility, currentSessionRole]);


  const openDeleteDialog = (resource: ResourceFile) => {
    setResourceToDelete(resource);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteResource = async () => {
    if (!resourceToDelete || !currentSessionRole) {
      toast({ variant: "destructive", title: "Error", description: "No se puede eliminar el recurso sin datos o rol de usuario." });
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem(SIMULATED_AUTH_TOKEN_KEY) : null;
    if (!token) {
      toast({ variant: "destructive", title: "Error de Autenticación", description: "Token no encontrado. No se puede eliminar." });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resources/${resourceToDelete.id}?actingUserRole=${currentSessionRole}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al eliminar' }));
        throw new Error(errorData.message || 'No se pudo eliminar el recurso.');
      }
      toast({ title: "Recurso Eliminado", description: `El archivo "${resourceToDelete.name}" ha sido eliminado.` });
      fetchResources();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al Eliminar", description: error.message });
    } finally {
      setResourceToDelete(null);
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
    }
  };

  const handleOpenEditModal = (resource: ResourceFile) => {
    setEditingResource(resource);
    setEditFormName(resource.name);
    setEditFormVisibility(resource.visibility);
    setEditFormCategory(resource.category);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedResource = async () => {
    if (!editingResource || !editFormName.trim()) {
      toast({ variant: "destructive", title: "Validación Fallida", description: "El nombre del recurso es obligatorio." });
      return;
    }
    if (!currentSessionRole) {
      toast({ variant: "destructive", title: "Error de Sesión", description: "No se pudo determinar tu rol. Intenta recargar." });
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem(SIMULATED_AUTH_TOKEN_KEY) : null;
    if (!token) {
      toast({ variant: "destructive", title: "Error de Autenticación", description: "No se encontró token. No se puede actualizar." });
      return;
    }

    setIsSavingEdit(true);
    const payload = { 
      name: editFormName.trim(), 
      visibility: editFormVisibility, 
      category: editFormCategory,
      actingUserRole: currentSessionRole,
    };

    try {
      const response = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al actualizar' }));
        throw new Error(errorData.message || `No se pudo actualizar el recurso (status: ${response.status}).`);
      }
      toast({ title: "Recurso Actualizado", description: "Los metadatos del recurso han sido actualizados." });
      fetchResources();
      setIsEditModalOpen(false);
      setEditingResource(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al Actualizar", description: error.message });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return 'Fecha desconocida';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd MMM yyyy, HH:mm", { locale: es }) : dateString;
  };

  const renderResourceItem = (file: ResourceFile) => {
    const FileIcon = getFileIcon(file.type);
    const visibilityInfo = visibilityOptions.find(opt => opt.value === file.visibility);
    const CategoryIcon = categoryOptions.find(opt => opt.value === file.category)?.icon || FileText;

    if (viewMode === 'grid') {
      return (
        <Card key={file.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <FileIcon className="h-8 w-8 text-primary" />
              {canUploadAndManage && (
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleOpenEditModal(file)} title="Editar Metadatos">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => openDeleteDialog(file)} title="Eliminar Recurso">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <CardTitle className="text-md leading-tight line-clamp-2" title={file.name}>{file.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex-grow space-y-1.5">
            <p>Tipo: {file.type}</p>
            <p>Tamaño: {file.size}</p>
            <p>Subido: {formatDateDisplay(file.uploadDate)}</p>
            <div className="flex items-center gap-1.5">
              <CategoryIcon className="h-3.5 w-3.5" /> {categoryOptions.find(opt => opt.value === file.category)?.label}
            </div>
            {visibilityInfo && (
              <Badge variant="outline" className={`text-xs ${visibilityInfo.badgeClass || ''}`}>
                <visibilityInfo.icon className="mr-1 h-3 w-3" />
                {visibilityInfo.label}
              </Badge>
            )}
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Button variant="outline" size="sm" asChild className="w-full">
              <a href={file.url || '#'} target="_blank" rel="noopener noreferrer" download={file.name}>
                <Download className="mr-2 h-4 w-4" /> Descargar
              </a>
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return (
      <TableRow key={file.id}>
        <TableCell className="hidden md:table-cell"><FileIcon className="h-6 w-6 text-muted-foreground" /></TableCell>
        <TableCell className="font-medium max-w-xs truncate" title={file.name}>{file.name}</TableCell>
        <TableCell className="hidden sm:table-cell">{file.type}</TableCell>
        <TableCell className="hidden md:table-cell">
          {visibilityInfo && (
            <Badge variant="outline" className={`text-xs ${visibilityInfo.badgeClass || ''}`}>
              <visibilityInfo.icon className="mr-1 h-3 w-3" />
              {visibilityInfo.label}
            </Badge>
          )}
        </TableCell>
        <TableCell className="hidden lg:table-cell">{categoryOptions.find(opt => opt.value === file.category)?.label}</TableCell>
        <TableCell className="hidden lg:table-cell">{formatDateDisplay(file.uploadDate)}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end items-center space-x-1">
            <Button variant="outline" size="sm" asChild>
              <a href={file.url || '#'} target="_blank" rel="noopener noreferrer" download={file.name} title="Descargar">
                <Download className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Descargar</span>
              </a>
            </Button>
            {canUploadAndManage && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEditModal(file)} title="Editar Metadatos">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => openDeleteDialog(file)} title="Eliminar Recurso" disabled={isDeleting && resourceToDelete?.id === file.id}>
                  {(isDeleting && resourceToDelete?.id === file.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  if (isLoading && allResourcesFromApi.length === 0) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando recursos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Briefcase className="mr-3 h-8 w-8 text-primary" />
          Gestión de Recursos
        </h1>
        {canUploadAndManage && (
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" /> Añadir Recurso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Subir Nuevos Recursos</DialogTitle>
                <DialogDescription>
                  Arrastra y suelta archivos o selecciónalos. Los metadatos se guardarán en la base de datos.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[70vh] overflow-y-auto">
                <FileUploader onResourceRegistered={handleResourceRegistered} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <CardTitle className="text-lg">Biblioteca de Recursos</CardTitle>
            <CardDescription>Explora, busca y gestiona los recursos disponibles.</CardDescription>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} title="Vista de Lista">
              <List className="h-5 w-5" />
            </Button>
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} title="Vista de Cuadrícula">
              <Grid className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="search-resources">Buscar por nombre o tipo</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-resources"
                  type="search"
                  placeholder="Buscar..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading && allResourcesFromApi.length === 0}
                />
              </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="filter-category">Categoría</Label>
                <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as FileCategory | 'all')}>
                <SelectTrigger id="filter-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    {categoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            {(currentSessionRole === 'administrador') && (
              <div className="space-y-1.5">
                <Label htmlFor="filter-visibility">Visibilidad</Label>
                <Select value={filterVisibility} onValueChange={(value) => setFilterVisibility(value as FileVisibility | 'all')}>
                  <SelectTrigger id="filter-visibility"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Visibilidades</SelectItem>
                    {visibilityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isLoading && filteredResources.length === 0 && allResourcesFromApi.length > 0 ? (
            <div className="text-center py-10"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></div>
          ) : filteredResources.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              {searchTerm || filterCategory !== 'all' || (filterVisibility !== 'all' && currentSessionRole === 'administrador') ? 'No se encontraron recursos con los filtros aplicados.' : 'No hay recursos disponibles que coincidan con tu rol y filtros.'}
            </p>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredResources.map(renderResourceItem)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell w-[50px]"></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Visibilidad</TableHead>
                    <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                    <TableHead className="hidden lg:table-cell">Fecha Subida</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{filteredResources.map(renderResourceItem)}</TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingResource && (
        <Dialog open={isEditModalOpen} onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setEditingResource(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Metadatos del Recurso</DialogTitle>
              <DialogDescription>Actualiza la información de "{editingResource.name}".</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Nombre del Archivo</Label>
                <Input id="edit-name" value={editFormName} onChange={(e) => setEditFormName(e.target.value)} disabled={isSavingEdit} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-category">Categoría</Label>
                <Select value={editFormCategory} onValueChange={(v) => setEditFormCategory(v as FileCategory)} disabled={isSavingEdit}>
                  <SelectTrigger id="edit-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}><div className="flex items-center"><opt.icon className="w-4 h-4 mr-2" />{opt.label}</div></SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-visibility">Visibilidad</Label>
                <Select value={editFormVisibility} onValueChange={(v) => setEditFormVisibility(v as FileVisibility)} disabled={isSavingEdit}>
                  <SelectTrigger id="edit-visibility"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}><div className="flex items-center"><opt.icon className="w-4 h-4 mr-2" />{opt.label}</div></SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {setIsEditModalOpen(false); setEditingResource(null);}} disabled={isSavingEdit}>Cancelar</Button>
              <Button onClick={handleSaveEditedResource} disabled={isSavingEdit || !editFormName.trim()}>
                {isSavingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteDialogOpen && !!resourceToDelete} onOpenChange={(open) => {
        if (!open) {
          setIsDeleteDialogOpen(false);
          setResourceToDelete(null);
        } else {
          // This part might be redundant if openDeleteDialog always sets resourceToDelete
          if(resourceToDelete) setIsDeleteDialogOpen(true); 
        }
      }}>
        {resourceToDelete && (
          <ConfirmDialogContent>
            <ConfirmDialogHeader>
              <ConfirmDialogTitle>Confirmar Eliminación</ConfirmDialogTitle>
              <ConfirmDialogDescription>
                ¿Seguro que quieres eliminar el archivo "{resourceToDelete.name}"? Esta acción no se puede deshacer.
              </ConfirmDialogDescription>
            </ConfirmDialogHeader>
            <ConfirmDialogFooter>
              <AlertDialogCancel onClick={() => { setIsDeleteDialogOpen(false); setResourceToDelete(null);}} disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteResource} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Eliminar
              </AlertDialogAction>
            </ConfirmDialogFooter>
          </ConfirmDialogContent>
        )}
      </AlertDialog>
    </div>
  );
}

    