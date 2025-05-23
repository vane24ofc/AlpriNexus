
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FileUploader } from "@/components/uploads/file-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Shield, BookOpen, Eye, Users, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type FileVisibility = 'private' | 'instructors' | 'public';

interface ResourceFile {
  id: string;
  name: string;
  type: string; 
  size: string;
  uploadDate: string;
  url?: string; 
  visibility: FileVisibility;
  // uploadedByRole?: 'admin' | 'instructor'; // Para una lógica 'private' más precisa
}

const sampleCompanyResources: Omit<ResourceFile, 'visibility'>[] = [ // No necesitan visibilidad individual, la sección es admin-only
  { id: 'cr1', name: 'Políticas Internas Q4 2023.pdf', type: 'PDF', size: '2.5 MB', uploadDate: '2023-10-15', url: '#' },
  { id: 'cr2', name: 'Plan Estratégico 2024.docx', type: 'Documento', size: '1.2 MB', uploadDate: '2023-11-01', url: '#' },
  { id: 'cr3', name: 'Guía de Marca AlpriNexus.pdf', type: 'PDF', size: '5.0 MB', uploadDate: '2023-09-20', url: '#' },
];

const sampleLearningResources: ResourceFile[] = [
  { id: 'lr1', name: 'Introducción a JavaScript - Módulo 1.mp4', type: 'Video', size: '150 MB', uploadDate: '2023-11-05', url: '#', visibility: 'public' },
  { id: 'lr2', name: 'Ejercicios Prácticos de Python.pdf', type: 'PDF', size: '800 KB', uploadDate: '2023-11-02', url: '#', visibility: 'public' },
  { id: 'lr3', name: 'Presentación - Desarrollo Web Moderno.pptx', type: 'Presentación', size: '3.5 MB', uploadDate: '2023-10-28', url: '#', visibility: 'instructors' },
  { id: 'lr4', name: 'Glosario de Términos de IA.docx', type: 'Documento', size: '450 KB', uploadDate: '2023-11-10', url: '#', visibility: 'instructors' },
  { id: 'lr5', name: 'Notas Privadas del Instructor sobre Web Avanzado.docx', type: 'Documento', size: '50 KB', uploadDate: '2023-11-12', url: '#', visibility: 'private' },
];

const visibilityDisplay: Record<FileVisibility, { label: string; icon: React.ElementType; badgeClass: string }> = {
  public: { label: 'Todos', icon: Globe, badgeClass: 'bg-green-500 hover:bg-green-600' },
  instructors: { label: 'Instructores', icon: Users, badgeClass: 'bg-blue-500 hover:bg-blue-600' },
  private: { label: 'Privado', icon: Eye, badgeClass: 'bg-gray-500 hover:bg-gray-600' },
};


export default function ResourcesPage() {
  const pathname = usePathname();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) {
      setCurrentUserRole('administrador');
    } else if (pathname.startsWith('/dashboard/instructor')) {
      setCurrentUserRole('instructor');
    } else if (pathname.startsWith('/dashboard/student')) {
      setCurrentUserRole('estudiante');
    } else {
      setCurrentUserRole('estudiante'); 
    }
  }, [pathname]);

  const canUpload = currentUserRole === 'administrador' || currentUserRole === 'instructor';

  const filteredLearningResources = sampleLearningResources.filter(file => {
    if (file.visibility === 'public') return true;
    if (file.visibility === 'instructors' && (currentUserRole === 'administrador' || currentUserRole === 'instructor')) return true;
    // Simplificación para 'private' en datos de ejemplo: solo visible para admins/instructors.
    // En una app real, se necesitaría verificar si el currentUser es el propietario del archivo.
    if (file.visibility === 'private' && (currentUserRole === 'administrador' || currentUserRole === 'instructor')) return true;
    return false;
  });

  const renderResourceTable = (files: (Omit<ResourceFile, 'visibility'> | ResourceFile)[], title: string, description: string, icon: React.ElementType, showVisibilityCol: boolean = false) => (
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
                {showVisibilityCol && <TableHead className="hidden md:table-cell">Visibilidad</TableHead>}
                <TableHead className="hidden lg:table-cell">Fecha de Subida</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => {
                const displayInfo = 'visibility' in file ? visibilityDisplay[file.visibility as FileVisibility] : null;
                const VisibilityIcon = displayInfo?.icon;
                
                return (
                  <TableRow key={file.id}>
                    <TableCell className="hidden md:table-cell">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{file.type}</TableCell>
                    {showVisibilityCol && (
                      <TableCell className="hidden md:table-cell">
                        {displayInfo && VisibilityIcon && (
                          <Badge variant="secondary" className={`text-xs text-white ${displayInfo.badgeClass}`}>
                            <VisibilityIcon className="mr-1 h-3 w-3" />
                            {displayInfo.label}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="hidden lg:table-cell">{file.uploadDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.url} download={file.name}><Download className="mr-2 h-4 w-4" /> Descargar</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No hay archivos disponibles en esta sección.
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
              ? "Sube y gestiona los materiales de tu curso, documentos y otros recursos. Los estudiantes podrán visualizar los 'Archivos de Aprendizaje' según su visibilidad."
              : "Visualiza y descarga los archivos de aprendizaje disponibles para tus cursos."}
          </CardDescription>
        </CardHeader>
      </Card>

      {canUpload && (
        <FileUploader />
      )}

      {currentUserRole === 'administrador' && 
        renderResourceTable(
            sampleCompanyResources, 
            "Recursos de la Empresa", 
            "Archivos importantes y documentos internos de la organización. Visible solo para administradores.",
            Shield
      )}
      
      {renderResourceTable(
        filteredLearningResources,
        "Archivos de Aprendizaje",
        "Materiales de estudio, videos, y documentos para los cursos. Visibilidad controlada por el cargador.",
        BookOpen,
        true // Show visibility column
      )}
    </div>
  );
}
