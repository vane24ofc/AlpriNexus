
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UploadCloud, FileText, XCircle, CheckCircle, Edit3, Trash2, Eye, Users, Globe, Briefcase, BookOpen, Search, Grid, ListFilter, PlusCircle, Download, FolderArchive, Info, Loader2, Filter, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileUploader } from '@/components/uploads/file-uploader';
import { useToast } from '@/hooks/use-toast';
import { useSessionRole } from '@/app/dashboard/layout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type FileVisibility = 'private' | 'instructors' | 'public';
type FileCategory = 'company' | 'learning';

interface ApiResource {
  id: string;
  name: string;
  type: string; // e.g., "Imagen", "PDF", "Video"
  size: string; // e.g., "1.2MB"
  uploadDate: string; // ISO string
  url?: string; // Placeholder or actual download URL
  visibility: FileVisibility;
  category: FileCategory;
  uploaderUserId?: number; // Assuming API might provide this
  createdAt?: string;
  updatedAt?: string;
}

const visibilityOptions: { value: FileVisibility; label: string; icon: React.ElementType }[] = [
  { value: 'public', label: 'Público', icon: Globe },
  { value: 'instructors', label: 'Instructores', icon: Users },
  { value: 'private', label: 'Privado', icon: Eye },
];

const categoryOptions: { value: FileCategory; label: string; icon: React.ElementType }[] = [
  { value: 'learning', label: 'Aprendizaje', icon: BookOpen },
  { value: 'company', label: 'Empresa', icon: Briefcase },
];

const fileTypeIcons: { [key: string]: React.ElementType } = {
  Imagen: UploadCloud,
  PDF: FileText,
  Video: Video,
  Documento: FileText,
  Presentación: FileText,
  "Hoja de Cálculo": FileText,
  Desconocido: FolderArchive,
};

const SIMULATED_USER_ID = 1; // Assuming an ID for logged-in user for private resources

export default function ResourcesPage() {
  const { toast } = useToast();
  const { currentSessionRole } = useSessionRole();

  const [resources, setResources] = useState<ApiResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FileCategory | 'all'>('all');
  const [filterVisibility, setFilterVisibility] = useState<FileVisibility | 'all'>('all');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ApiResource | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; visibility: FileVisibility; category: FileCategory }>({
    name: '',
    visibility: 'public',
    category: 'learning',
  });
  const [isDeletingResource, setIsDeletingResource] = useState<ApiResource | null>(null);

  const isAdmin = currentSessionRole === 'administrador';
  const isInstructor = currentSessionRole === 'instructor';
  const canManageAllResources = isAdmin;
  const canUpload = isAdmin || isInstructor;

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: "Error al cargar recursos"}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: ApiResource[] = await response.json();
      setResources(data);
    } catch (error: any) {
      console.error("Error cargando recursos:", error);
      toast({ variant: "destructive", title: "Error al Cargar Recursos", description: error.message });
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleResourceRegistered = (newResource: ApiResource) => {
    setResources(prev => [newResource, ...prev].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
    setIsUploadModalOpen(false); // Close modal after successful registration
  };

  const handleEditResource = (resource: ApiResource) => {
    setEditingResource(resource);
    setEditFormData({
      name: resource.name,
      visibility: resource.visibility,
      category: resource.category,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingResource || !editFormData.name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "El nombre no puede estar vacío." });
      return;
    }
    setIsLoading(true); // Indicate processing for edit
    try {
      const response = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: "Error al actualizar recurso"}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      const updatedResource: { resource: ApiResource } = await response.json();
      setResources(prev => prev.map(r => r.id === updatedResource.resource.id ? updatedResource.resource : r));
      toast({ title: "Recurso Actualizado", description: `"${updatedResource.resource.name}" ha sido actualizado.` });
      setIsEditModalOpen(false);
      setEditingResource(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al Actualizar", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!isDeletingResource) return;
    setIsLoading(true); // Indicate processing for delete
    try {
      const response = await fetch(`/api/resources/${isDeletingResource.id}`, { method: 'DELETE' });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({message: "Error al eliminar recurso"}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      setResources(prev => prev.filter(r => r.id !== isDeletingResource.id));
      toast({ title: "Recurso Eliminado", description: `"${isDeletingResource.name}" ha sido eliminado.`, variant: "destructive" });
      setIsDeletingResource(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al Eliminar", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadResource = (resource: ApiResource) => {
    // This is a simulation, as actual file download depends on where files are stored (e.g., S3, GCS)
    toast({ title: "Descarga Simulada", description: `Simulando descarga de "${resource.name}". URL: ${resource.url || 'No disponible'}` });
    // If resource.url was a direct link, you could do: window.open(resource.url, '_blank');
  };

  const filteredResources = useMemo(() => {
    return resources
      .filter(resource => {
        const searchTermLower = searchTerm.toLowerCase();
        if (searchTerm && !resource.name.toLowerCase().includes(searchTermLower)) {
          return false;
        }
        if (filterCategory !== 'all' && resource.category !== filterCategory) {
          return false;
        }
        if (filterVisibility !== 'all' && resource.visibility !== filterVisibility) {
          return false;
        }
        // Non-admins/instructors should only see public resources or their own private ones (if that logic was added)
        if (!canManageAllResources && resource.visibility === 'instructors') return false;
        if (!canManageAllResources && resource.visibility === 'private' && resource.uploaderUserId !== SIMULATED_USER_ID) return false; // Simplistic check
        return true;
      })
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [resources, searchTerm, filterCategory, filterVisibility, canManageAllResources]);

  const getFileTypeIcon = (type: string) => {
    return fileTypeIcons[type] || FolderArchive;
  };
  
  const renderResourceCard = (resource: ApiResource) => {
    const FileIcon = getFileTypeIcon(resource.type);
    return (
      <Card key={resource.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-primary/20 transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <FileIcon className="w-10 h-10 text-primary mb-2" />
            <Badge variant={resource.visibility === 'public' ? 'default' : resource.visibility === 'instructors' ? 'secondary' : 'outline'} className="text-xs whitespace-nowrap capitalize">
              {resource.visibility}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight line-clamp-2" title={resource.name}>{resource.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground flex-grow space-y-1.5">
          <p><strong>Tipo:</strong> {resource.type}</p>
          <p><strong>Tamaño:</strong> {resource.size}</p>
          <p><strong>Categoría:</strong> <span className="capitalize">{resource.category}</span></p>
          <p><strong>Subido:</strong> {format(parseISO(resource.uploadDate), "dd MMM, yyyy 'a las' p", { locale: es })}</p>
        </CardContent>
        <CardFooter className="border-t pt-3 flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => handleDownloadResource(resource)}><Download className="mr-2 h-4 w-4" />Descargar</Button>
          {(canManageAllResources || (isInstructor && resource.uploaderUserId === SIMULATED_USER_ID)) && ( // Simple ownership check
            <>
              <Button size="sm" variant="outline" onClick={() => handleEditResource(resource)}><Edit3 className="mr-2 h-4 w-4" />Editar</Button>
              <Button size="sm" variant="destructive-outline" onClick={() => setIsDeletingResource(resource)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</Button>
            </>
          )}
        </CardFooter>
      </Card>
    );
  };

  const renderResourceListItem = (resource: ApiResource) => {
    const FileIcon = getFileTypeIcon(resource.type);
     return (
      <Card key={resource.id} className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3 flex items-center gap-3">
          <FileIcon className="w-8 h-8 text-primary flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <p className="font-semibold truncate" title={resource.name}>{resource.name}</p>
            <p className="text-xs text-muted-foreground">
              {resource.type} • {resource.size} • {format(parseISO(resource.uploadDate), "dd/MM/yy", { locale: es })}
            </p>
             <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs capitalize">Cat: {resource.category}</Badge>
                <Badge variant="secondary" className="text-xs capitalize">Vis: {resource.visibility}</Badge>
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Button size="icon-sm" variant="ghost" onClick={() => handleDownloadResource(resource)} title="Descargar"><Download className="h-4 w-4" /></Button>
            {(canManageAllResources || (isInstructor && resource.uploaderUserId === SIMULATED_USER_ID)) && (
                <>
                <Button size="icon-sm" variant="ghost" onClick={() => handleEditResource(resource)} title="Editar"><Edit3 className="h-4 w-4" /></Button>
                <Button size="icon-sm" variant="ghost" onClick={() => setIsDeletingResource(resource)} className="text-destructive hover:text-destructive" title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">Cargando recursos...</p>
        </div>
      );
    }
    if (filteredResources.length === 0) {
      return (
        <Card className="col-span-full">
          <CardContent className="py-16 text-center">
            <Info className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No se encontraron recursos</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm || filterCategory !== 'all' || filterVisibility !== 'all'
                ? "Intenta ajustar tu búsqueda o filtros."
                : (canUpload ? "Comienza subiendo tu primer recurso." : "No hay recursos disponibles con los filtros actuales.")}
            </p>
            {canUpload && !searchTerm && filterCategory === 'all' && filterVisibility === 'all' && (
                 <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4">
                    <UploadCloud className="mr-2 h-5 w-5" /> Subir Primer Recurso
                </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources.map(renderResourceCard)}
        </div>
      );
    }
    return <div className="space-y-3">{filteredResources.map(renderResourceListItem)}</div>;
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <FolderArchive className="mr-3 h-8 w-8 text-primary" />
          Gestión de Recursos
        </h1>
        {canUpload && (
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" /> Añadir Recurso
          </Button>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Biblioteca de Recursos</CardTitle>
            <CardDescription>Busca, filtra y gestiona todos los recursos disponibles en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-5 items-end">
                <div className="flex-grow relative">
                    <Label htmlFor="search-resources" className="sr-only">Buscar recursos</Label>
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-resources"
                        type="search"
                        placeholder="Buscar por nombre de recurso..."
                        className="pl-9 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    {isAdmin && (
                        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as FileCategory | 'all')} disabled={isLoading}>
                            <SelectTrigger className="w-full sm:w-[180px]" id="filter-category">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Categorías</SelectItem>
                                {categoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    {canManageAllResources && ( // Only admin sees visibility filter for all resources
                        <Select value={filterVisibility} onValueChange={(v) => setFilterVisibility(v as FileVisibility | 'all')} disabled={isLoading}>
                        <SelectTrigger className="w-full sm:w-[180px]" id="filter-visibility">
                            <SelectValue placeholder="Visibilidad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toda Visibilidad</SelectItem>
                            {visibilityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="flex items-center gap-1 border p-0.5 rounded-md h-10">
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon-sm" onClick={() => setViewMode('grid')} aria-label="Vista de cuadrícula" className="h-full"><Grid className="h-5 w-5" /></Button>
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon-sm" onClick={() => setViewMode('list')} aria-label="Vista de lista" className="h-full"><ListFilter className="h-5 w-5" /></Button>
                </div>
            </div>
            {renderContent()}
        </CardContent>
      </Card>


      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
           <DialogHeader>
                <DialogTitle className="text-xl">Subir Nuevos Recursos</DialogTitle>
                <DialogDescription>
                    Los archivos se registrarán en la base de datos. La subida real no está implementada.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto p-1 -m-1">
                <FileUploader onResourceRegistered={handleResourceRegistered} />
            </div>
            <DialogFooter className="mt-auto pt-4 border-t">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cerrar</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {editingResource && (
        <Dialog open={isEditModalOpen} onOpenChange={() => {setIsEditModalOpen(false); setEditingResource(null);}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Metadatos del Recurso</DialogTitle>
              <DialogDescription>Modifica la información de "{editingResource.name}".</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Nombre del Recurso</Label>
                <Input id="edit-name" value={editFormData.name} onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))} />
              </div>
              {isAdmin && (
                <div className="space-y-1.5">
                    <Label htmlFor="edit-category">Categoría</Label>
                    <Select value={editFormData.category} onValueChange={(v) => setEditFormData(prev => ({...prev, category: v as FileCategory}))}>
                    <SelectTrigger id="edit-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {categoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="edit-visibility">Visibilidad</Label>
                <Select value={editFormData.visibility} onValueChange={(v) => setEditFormData(prev => ({...prev, visibility: v as FileVisibility}))}>
                  <SelectTrigger id="edit-visibility"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {setIsEditModalOpen(false); setEditingResource(null);}}>Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeletingResource && (
        <AlertDialog open={!!isDeletingResource} onOpenChange={() => setIsDeletingResource(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar el recurso "{isDeletingResource.name}". Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeletingResource(null)} disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteResource} className="bg-destructive hover:bg-destructive/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sí, Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    