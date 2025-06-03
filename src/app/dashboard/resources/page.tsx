
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
}

// These initial samples will act as our "simulated API response" for now.
const initialSampleCompanyResources: ResourceFile[] = [
  { id: 'cr1', name: 'Políticas Internas Q4 2023.pdf', type: 'PDF', size: '2.5 MB', uploadDate: '2023-10-15', url: '#', visibility: 'instructors', category: 'company' },
  { id: 'cr2', name: 'Plan Estratégico 2024.docx', type: 'Documento', size: '1.2 MB', uploadDate: '2023-11-01', url: '#', visibility: 'private', category: 'company' },
  { id: 'cr3', name: 'Guía de Marca NexusAlpri.pdf', type: 'PDF', size: '5.0 MB', uploadDate: '2023-09-20', url: '#', visibility: 'public', category: 'company' },
  { id: 'cr4', name: 'Reporte Anual 2023.pdf', type: 'PDF', size: '3.0 MB', uploadDate: '2024-01-10', url: '#', visibility: 'public', category: 'company'},
  { id: 'cr5', name: 'Manual de Procedimientos de Seguridad.docx', type: 'Documento', size: '750 KB', uploadDate: '2024-02-01', url: '#', visibility: 'instructors', category: 'company' },
  { id: 'cr6', name: 'Presentación Resultados Trimestrales.pptx', type: 'Presentación', size: '4.2 MB', uploadDate: '2024-01-20', url: '#', visibility: 'private', category: 'company' },
];

const initialSampleLearningResources: ResourceFile[] = [
  { id: 'lr1', name: 'Introducción a JavaScript - Módulo 1.mp4', type: 'Video', size: '150 MB', uploadDate: '2023-11-05', url: '#', visibility: 'public', category: 'learning' },
  { id: 'lr2', name: 'Ejercicios Prácticos de Python.pdf', type: 'PDF', size: '800 KB', uploadDate: '2023-11-02', url: '#', visibility: 'public', category: 'learning' },
  { id: 'lr3', name: 'Presentación - Desarrollo Web Moderno.pptx', type: 'Presentación', size: '3.5 MB', uploadDate: '2023-10-28', url: '#', visibility: 'instructors', category: 'learning' },
  { id: 'lr4', name: 'Glosario de Términos de IA.docx', type: 'Documento', size: '450 KB', uploadDate: '2023-11-10', url: '#', visibility: 'instructors', category: 'learning' },
  { id: 'lr5', name: 'Notas Privadas del Instructor sobre Web Avanzado.docx', type: 'Documento', size: '50 KB', uploadDate: '2023-11-12', url: '#', visibility: 'private', category: 'learning' },
];

const visibilityDisplay: Record<FileVisibility, { label: string; icon: React.ElementType; badgeClass: string }> = {
  public: { label: 'Todos', icon: Globe, badgeClass: 'bg-green-500 hover:bg-green-600 text-white' },
  instructors: { label: 'Instructores', icon: Users, badgeClass: 'bg-blue-500 hover:bg-blue-600 text-white' },
  private: { label: 'Privado', icon: Eye, badgeClass: 'bg-gray-500 hover:bg-gray-600 text-white' },
};

export default function ResourcesPage() {
  const { currentSessionRole } = useSessionRole();
  const { toast } = useToast();
  const [companyResources, setCompanyResources] = useState<ResourceFile[]>([]);
  const [learningResources, setLearningResources] = useState<ResourceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [resourceToDelete, setResourceToDelete] = useState<ResourceFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const canUploadAndManage = useMemo(() => currentSessionRole === 'administrador' || currentSessionRole === 'instructor', [currentSessionRole]);

  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Replace with actual API calls
      // For now, use the initial sample data as if it came from an API
      // try {
      //   const companyResponse = await fetch('/api/resources?category=company');
      //   if (!companyResponse.ok) throw new Error('Failed to fetch company resources');
      //   const companyData = await companyResponse.json();
      //   setCompanyResources(companyData);

      //   const learningResponse = await fetch('/api/resources?category=learning');
      //   if (!learningResponse.ok) throw new Error('Failed to fetch learning resources');
      //   const learningData = await learningResponse.json();
      //   setLearningResources(learningData);
      // } catch (error) {
      //   console.error("Error fetching resources from API:", error);
      //   toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los recursos." });
      //   setCompanyResources(initialSampleCompanyResources); // Fallback to sample on API error
      //   setLearningResources(initialSampleLearningResources); // Fallback to sample on API error
      // }

      setCompanyResources(initialSampleCompanyResources);
      setLearningResources(initialSampleLearningResources);
      
      setIsLoading(false);
    };
    loadResources();
  }, []);

  const filterFilesByVisibility = (files: ResourceFile[], role: Role | null) => {
    if (!role) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(lowerSearchTerm) || file.type.toLowerCase().includes(lowerSearchTerm);
      if (!matchesSearch) return false;

      if (role === 'administrador') return true;
      if (role === 'instructor') {
        return file.visibility === 'public' || file.visibility === 'instructors' || (file.visibility === 'private' && file.category === 'learning'); // Instructors can see their private learning files
      }
      return file.visibility === 'public';
    });
  };

  const companyResourcesForRole = useMemo(() => {
    return filterFilesByVisibility(companyResources, currentSessionRole);
  }, [companyResources, currentSessionRole, searchTerm]);

  const learningResourcesForRole = useMemo(() => {
    return filterFilesByVisibility(learningResources, currentSessionRole);
  }, [learningResources, currentSessionRole, searchTerm]);

  const openDeleteDialog = (resource: ResourceFile) => {
    setResourceToDelete(resource);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;

    // TODO: API Call - DELETE /api/resources/:resourceId (or specific endpoint based on category)
    // On success, the API should handle deletion. The client would then typically refetch the list
    // or optimistically update the UI. For this simulation, we'll just update the local state.

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (resourceToDelete.category === 'company') {
      setCompanyResources(prev => prev.filter(r => r.id !== resourceToDelete.id));
    } else {
      setLearningResources(prev => prev.filter(r => r.id !== resourceToDelete.id));
    }

    toast({
      title: "Recurso Eliminado (Simulado)",
      description: `El archivo "${resourceToDelete.name}" ha sido eliminado.`,
      variant: "destructive",
    });
    
    setResourceToDelete(null);
    setIsDeleteDialogOpen(false);
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
        {files.length > 0 ? (
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
                      <TableCell className="hidden lg:table-cell">{file.uploadDate}</TableCell>
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
                            >
                              <Trash2 className="h-4 w-4" />
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

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando recursos...</p>
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
                />
            </div>
        </CardContent>
      </Card>

      {canUploadAndManage && (
        <FileUploader />
      )}

      {renderResourceTable(
        companyResourcesForRole,
        "Recursos de la Empresa",
        "Documentos y archivos importantes de la organización, filtrados según tu rol y permisos.",
        Shield
      )}

      {renderResourceTable(
        learningResourcesForRole,
        "Archivos de Aprendizaje",
        "Materiales de estudio, videos, y documentos para los cursos, filtrados según tu rol y permisos.",
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
              <AlertDialogCancel onClick={() => { setResourceToDelete(null); setIsDeleteDialogOpen(false); }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteResource} className="bg-destructive hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    