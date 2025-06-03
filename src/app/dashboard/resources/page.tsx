
"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Shield, BookOpen, Eye, Users, Globe, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSessionRole, type Role } from '@/app/dashboard/layout';
import { FileUploader } from "@/components/uploads/file-uploader";
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
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

const visibilityDisplay: Record<FileVisibility, { label: string; icon: React.ElementType; badgeClass: string }> = {
  public: { label: 'Todos', icon: Globe, badgeClass: 'bg-green-500 hover:bg-green-600 text-white' },
  instructors: { label: 'Instructores', icon: Users, badgeClass: 'bg-blue-500 hover:bg-blue-600 text-white' },
  private: { label: 'Privado', icon: Eye, badgeClass: 'bg-gray-500 hover:bg-gray-600 text-white' },
};

export default function ResourcesPage() {
  const { currentSessionRole } = useSessionRole();
  const { toast } = useToast();
  const [allResourcesFromApi, setAllResourcesFromApi] = useState<ResourceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [resourceToDelete, setResourceToDelete] = useState<ResourceFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const canUploadAndManage = useMemo(() => currentSessionRole === 'administrador' || currentSessionRole === 'instructor', [currentSessionRole]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) {
        let errorData = { message: `HTTP error! status: ${response.status}` };
        try {
            errorData = await response.json();
        } catch (jsonError) {
            console.error("Could not parse error response as JSON:", jsonError);
        }
        throw new Error(errorData.message || `Failed to fetch resources (status: ${response.status})`);
      }
      const apiData: ResourceFile[] = await response.json();
      setAllResourcesFromApi(apiData);
    } catch (error: any) {
      console.error("Full error object in fetchResources catch block:", error); 
      toast({ variant: "destructive", title: "Error al Cargar Recursos", description: error.message });
      setAllResourcesFromApi([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filterFilesByVisibilityAndCategory = (files: ResourceFile[], role: Role | null) => {
    if (!role) return { company: [], learning: [] };
    const lowerSearchTerm = searchTerm.toLowerCase();

    const company: ResourceFile[] = [];
    const learning: ResourceFile[] = [];

    files.forEach(file => {
      const matchesSearch = file.name.toLowerCase().includes(lowerSearchTerm) || file.type.toLowerCase().includes(lowerSearchTerm);
      if (!matchesSearch) return;

      let isVisible = false;
      if (role === 'administrador') {
        isVisible = true;
      } else if (role === 'instructor') {
        isVisible = file.visibility === 'public' || file.visibility === 'instructors' || (file.visibility === 'private' && file.category === 'learning');
      } else { 
        isVisible = file.visibility === 'public';
      }

      if (isVisible) {
        if (file.category === 'company') {
          company.push(file);
        } else if (file.category === 'learning') {
          learning.push(file);
        }
      }
    });
    return { company, learning };
  };

  const { company: companyResourcesForRole, learning: learningResourcesForRole } = useMemo(() => {
    return filterFilesByVisibilityAndCategory(allResourcesFromApi, currentSessionRole);
  }, [allResourcesFromApi, currentSessionRole, searchTerm]);

  const openDeleteDialog = (resource: ResourceFile) => {
    setResourceToDelete(resource);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resources/${resourceToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status} al eliminar.`}));
        throw new Error(errorData.message || 'No se pudo eliminar el recurso.');
      }
      toast({
        title: "Recurso Eliminado",
        description: `El archivo "${resourceToDelete.name}" ha sido eliminado exitosamente.`,
      });
      
      setAllResourcesFromApi(prev => prev.filter(r => r.id !== resourceToDelete.id));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: error.message,
      });
    } finally {
      setResourceToDelete(null);
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
    } catch (error) {
      return dateString; 
    }
  };
  
  const handleResourceRegistered = () => {
    toast({
      title: "Lista Actualizada",
      description: "Actualizando la lista de recursos...",
    });
    fetchResources(); // Re-fetch resources from the API
  };


  const renderResourceTable = (files: ResourceFile[], title: string, description: string, icon: React.ElementType) => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          {React.createElement(icon, { className: "mr-2 h-6 w-6 text-primary" })}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && files.length === 0 && allResourcesFromApi.length === 0 ? ( 
             <div className="flex justify-center items-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        ) : files.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] hidden md:table-cell"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Visibilidad</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha de Subida</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => {
                  const displayInfo = visibilityDisplay[file.visibility];
                  const VisibilityIcon = displayInfo?.icon;

                  return (
                    <TableRow key={file.id}>
                      <TableCell className="hidden md:table-cell">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={file.name}>{file.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{file.type}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {displayInfo && VisibilityIcon && (
                          <Badge variant="secondary" className={`text-xs ${displayInfo.badgeClass}`}>
                            <VisibilityIcon className="mr-1 h-3 w-3" />
                            {displayInfo.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(file.uploadDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.url || '#'} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-1 h-4 w-4" /> Visualizar
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.url || '#'} download={file.name}>
                              <Download className="mr-1 h-4 w-4" /> Descargar
                            </a>
                          </Button>
                          {canUploadAndManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => openDeleteDialog(file)}
                              title="Eliminar Recurso"
                              disabled={isDeleting && resourceToDelete?.id === file.id}
                            >
                              {isDeleting && resourceToDelete?.id === file.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
             {searchTerm ? `No se encontraron archivos para "${searchTerm}" en esta sección.` : "No hay archivos disponibles en esta sección para tu rol actual."}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading && allResourcesFromApi.length === 0) { 
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando recursos desde la base de datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Gestión de Recursos</CardTitle>
          <CardDescription>
            {canUploadAndManage
              ? "Sube y gestiona los materiales de tu curso, documentos y otros recursos. Controla la visibilidad para cada categoría."
              : "Visualiza y descarga los archivos y recursos disponibles."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-6">
                <Input
                    type="search"
                    placeholder="Buscar archivos por nombre o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                    disabled={isLoading && allResourcesFromApi.length === 0}
                />
            </div>
        </CardContent>
      </Card>

      {canUploadAndManage && (
        <FileUploader onResourceRegistered={handleResourceRegistered} />
      )}

      {renderResourceTable(
        companyResourcesForRole,
        "Recursos de la Empresa",
        "Documentos y archivos importantes de la organización.",
        Shield
      )}

      {renderResourceTable(
        learningResourcesForRole,
        "Archivos de Aprendizaje",
        "Materiales de estudio, videos, y documentos para los cursos.",
        BookOpen
      )}

      {resourceToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar el archivo "{resourceToDelete.name}"? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setResourceToDelete(null); setIsDeleteDialogOpen(false); }} disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteResource} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
