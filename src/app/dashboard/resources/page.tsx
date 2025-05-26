
"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Shield, BookOpen, Eye, Users, Globe } from 'lucide-react'; 
import { Badge } from '@/components/ui/badge';
import { useSessionRole } from '@/app/dashboard/layout';
import { FileUploader } from "@/components/uploads/file-uploader";

type FileVisibility = 'private' | 'instructors' | 'public';

interface ResourceFile {
  id: string;
  name: string;
  type: string; 
  size: string;
  uploadDate: string;
  url?: string; 
  visibility: FileVisibility;
}

const sampleCompanyResources: ResourceFile[] = [
  { id: 'cr1', name: 'Políticas Internas Q4 2023.pdf', type: 'PDF', size: '2.5 MB', uploadDate: '2023-10-15', url: '#', visibility: 'instructors' },
  { id: 'cr2', name: 'Plan Estratégico 2024.docx', type: 'Documento', size: '1.2 MB', uploadDate: '2023-11-01', url: '#', visibility: 'private' }, 
  { id: 'cr3', name: 'Guía de Marca NexusAlpri.pdf', type: 'PDF', size: '5.0 MB', uploadDate: '2023-09-20', url: '#', visibility: 'public' },
  { id: 'cr4', name: 'Reporte Anual 2023.pdf', type: 'PDF', size: '3.0 MB', uploadDate: '2024-01-10', url: '#', visibility: 'public'},
  { id: 'cr5', name: 'Presentación de Ventas Global.pptx', type: 'Presentación', size: '4.5 MB', uploadDate: '2024-02-01', url: '#', visibility: 'instructors'},
  { id: 'cr6', name: 'Manual de Bienvenida para Nuevos Empleados.pdf', type: 'PDF', size: '1.8 MB', uploadDate: '2024-03-01', url: '#', visibility: 'public' },
  { id: 'cr7', name: 'Protocolos de Seguridad IT.docx', type: 'Documento', size: '750 KB', uploadDate: '2024-02-15', url: '#', visibility: 'private' },
];

const sampleLearningResources: ResourceFile[] = [
  { id: 'lr1', name: 'Introducción a JavaScript - Módulo 1.mp4', type: 'Video', size: '150 MB', uploadDate: '2023-11-05', url: '#', visibility: 'public' },
  { id: 'lr2', name: 'Ejercicios Prácticos de Python.pdf', type: 'PDF', size: '800 KB', uploadDate: '2023-11-02', url: '#', visibility: 'public' },
  { id: 'lr3', name: 'Presentación - Desarrollo Web Moderno.pptx', type: 'Presentación', size: '3.5 MB', uploadDate: '2023-10-28', url: '#', visibility: 'instructors' },
  { id: 'lr4', name: 'Glosario de Términos de IA.docx', type: 'Documento', size: '450 KB', uploadDate: '2023-11-10', url: '#', visibility: 'instructors' },
  { id: 'lr5', name: 'Notas Privadas del Instructor sobre Web Avanzado.docx', type: 'Documento', size: '50 KB', uploadDate: '2023-11-12', url: '#', visibility: 'private' },
  { id: 'lr6', name: 'Video Tutorial de React Hooks.mp4', type: 'Video', size: '120 MB', uploadDate: '2024-01-20', url: '#', visibility: 'public'},
];

const visibilityDisplay: Record<FileVisibility, { label: string; icon: React.ElementType; badgeClass: string }> = {
  public: { label: 'Todos', icon: Globe, badgeClass: 'bg-green-500 hover:bg-green-600 text-white' },
  instructors: { label: 'Instructores', icon: Users, badgeClass: 'bg-blue-500 hover:bg-blue-600 text-white' },
  private: { label: 'Privado', icon: Eye, badgeClass: 'bg-gray-500 hover:bg-gray-600 text-white' },
};


export default function ResourcesPage() {
  const { currentSessionRole } = useSessionRole(); 

  const canUpload = currentSessionRole === 'administrador' || currentSessionRole === 'instructor';

  const filterFilesByVisibility = (files: ResourceFile[], role: typeof currentSessionRole) => {
    return files.filter(file => {
      if (role === 'administrador') return true; // Admins see all files in a category
      if (role === 'instructor') return file.visibility === 'public' || file.visibility === 'instructors' || file.visibility === 'private';
      // Students only see public files
      return file.visibility === 'public';
    });
  };

  const companyResourcesForRole = useMemo(() => {
    return filterFilesByVisibility(sampleCompanyResources, currentSessionRole);
  }, [currentSessionRole]);
  
  const learningResourcesForRole = useMemo(() => {
    return filterFilesByVisibility(sampleLearningResources, currentSessionRole);
  }, [currentSessionRole]);


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
                    <TableCell className="font-medium">{file.name}</TableCell>
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
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={file.url || '#'} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={file.url || '#'} download={file.name}>
                            <Download className="mr-2 h-4 w-4" /> Descargar
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">
             No hay archivos disponibles en esta sección para tu rol actual.
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Gestión de Recursos</CardTitle>
          <CardDescription>
            {canUpload
              ? "Sube y gestiona los materiales de tu curso, documentos y otros recursos. Controla la visibilidad para cada categoría."
              : "Visualiza y descarga los archivos y recursos disponibles."}
          </CardDescription>
        </CardHeader>
      </Card>

      {canUpload && (
        <FileUploader />
      )}
      
      {renderResourceTable(
        companyResourcesForRole, 
        "Recursos de la Empresa", 
        "Documentos y archivos importantes de la organización. Su visibilidad es controlada por los administradores.",
        Shield
      )}
      
      {renderResourceTable(
        learningResourcesForRole,
        "Archivos de Aprendizaje",
        "Materiales de estudio, videos, y documentos para los cursos.",
        BookOpen
      )}
    </div>
  );
}

