
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, XCircle, CheckCircle, Loader2, Eye, Users, Globe, Briefcase, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessionRole } from '@/app/dashboard/layout';

type FileVisibility = 'private' | 'instructors' | 'public';
type FileCategory = 'company' | 'learning';

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  visibility: FileVisibility;
  category: FileCategory;
}

const visibilityOptions: { value: FileVisibility; label: string; icon: React.ElementType }[] = [
  { value: 'public', label: 'Todos (Público)', icon: Globe },
  { value: 'instructors', label: 'Instructores y Administradores', icon: Users },
  { value: 'private', label: 'Solo para mí (o solo Admins para Rec. Empresa)', icon: Eye },
];

const categoryOptions: { value: FileCategory; label: string; icon: React.ElementType }[] = [
  { value: 'learning', label: 'Archivos de Aprendizaje', icon: BookOpen },
  { value: 'company', label: 'Recursos de la Empresa', icon: Briefcase },
];

export function FileUploader() {
  const { currentSessionRole } = useSessionRole();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedVisibility, setSelectedVisibility] = useState<FileVisibility>('public');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('learning');

  const isAdmin = currentSessionRole === 'administrador';
  const isInstructor = currentSessionRole === 'instructor';
  const canUpload = isAdmin || isInstructor;

  useEffect(() => {
    // Si es instructor, la categoría siempre es 'learning' y no puede cambiarla.
    if (isInstructor) {
      setSelectedCategory('learning');
    }
  }, [isInstructor]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'uploading',
      visibility: selectedVisibility, // Usar siempre la visibilidad seleccionada
      category: selectedCategory,
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, [selectedVisibility, selectedCategory]);

  useEffect(() => {
    files.filter(f => f.status === 'uploading' && f.progress === 0).forEach(uploadedFile => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 10) + 10;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id ? { ...f, progress: 100, status: Math.random() > 0.2 ? 'success' : 'error', error: Math.random() <= 0.2 ? 'Fallo al subir: Problema de red' : undefined } : f
            )
          );
        } else {
          setFiles(prev =>
            prev.map(f => (f.id === uploadedFile.id ? { ...f, progress: currentProgress } : f))
          );
        }
      }, 200 + Math.random() * 300);
    });
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    }
  });

  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getVisibilityLabel = (visibility: FileVisibility) => {
    return visibilityOptions.find(opt => opt.value === visibility)?.label || 'Desconocido';
  };

  const getCategoryLabel = (category: FileCategory) => {
    return categoryOptions.find(opt => opt.value === category)?.label || 'Desconocido';
  };

  if (!canUpload) return null; // No mostrar nada si no puede subir

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle>Subir Recursos</CardTitle>
        <CardDescription>
          {isAdmin && "Selecciona la categoría y visibilidad, luego arrastra y suelta archivos o haz clic para buscar."}
          {isInstructor && "Selecciona la visibilidad (los archivos se subirán a 'Archivos de Aprendizaje'), luego arrastra y suelta archivos o haz clic para buscar."}
          {" Admite imágenes, PDF, videos y documentos."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isAdmin && ( // Solo los admins pueden cambiar la categoría
            <div className="space-y-2">
              <Label htmlFor="category-select" className="text-base font-medium">Categoría del Recurso:</Label>
              <Select value={selectedCategory} onValueChange={(value: FileCategory) => setSelectedCategory(value)}>
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center">
                        <opt.icon className="w-4 h-4 mr-2" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Instructores no ven selector de categoría, se asume "Archivos de Aprendizaje" */}
          {isInstructor && (
             <div className="space-y-2">
                <Label className="text-base font-medium">Categoría del Recurso:</Label>
                <p className="text-sm text-muted-foreground p-2 border rounded-md bg-muted flex items-center">
                    <BookOpen className="w-4 h-4 mr-2"/>
                    Archivos de Aprendizaje (Automático)
                </p>
            </div>
          )}

          {/* Admins e Instructores pueden seleccionar visibilidad */}
          <div className="space-y-2">
            <Label htmlFor="visibility-select" className="text-base font-medium">Visibilidad para los nuevos archivos:</Label>
            <Select value={selectedVisibility} onValueChange={(value: FileVisibility) => setSelectedVisibility(value)}>
              <SelectTrigger id="visibility-select">
                <SelectValue placeholder="Seleccionar visibilidad" />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center">
                      <opt.icon className="w-4 h-4 mr-2" />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdmin && selectedCategory === 'company' && selectedVisibility === 'private' && (
                 <p className="text-xs text-muted-foreground pl-1">Nota: 'Solo para mí' en 'Recursos de la Empresa' significa visible solo para Administradores.</p>
            )}
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/70 hover:bg-muted/50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-16 h-16 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          {isDragActive ? (
            <p className="text-lg font-semibold text-primary">Suelta los archivos aquí...</p>
          ) : (
            <>
              <p className="text-lg font-semibold">Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos</p>
              <p className="text-sm text-muted-foreground">Tamaño máximo de archivo: 50MB</p>
            </>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Archivos Listos para Subir ({files.length})</h4>
            <ScrollArea className="h-[200px] pr-3">
              <ul className="space-y-3">
                {files.map(uploadedFile => (
                  <li key={uploadedFile.id} className="flex items-center p-3 border rounded-lg bg-card space-x-3 shadow-sm">
                    <FileText className="w-8 h-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1 mt-1">
                        <p className="text-xs text-muted-foreground">{formatBytes(uploadedFile.file.size)}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                           Categoría: {getCategoryLabel(uploadedFile.category)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                           Visibilidad: {getVisibilityLabel(uploadedFile.visibility)}
                        </Badge>
                      </div>
                      {uploadedFile.status === 'uploading' && uploadedFile.progress < 100 && (
                        <Progress value={uploadedFile.progress} className="h-1.5 mt-2" />
                      )}
                      {uploadedFile.status === 'success' && (
                        <Badge variant="default" className="mt-2 bg-accent text-accent-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" /> Éxito (Simulado)
                        </Badge>
                      )}
                      {uploadedFile.status === 'error' && (
                        <Badge variant="destructive" className="mt-2">
                          <XCircle className="w-3 h-3 mr-1" /> Error: {uploadedFile.error || 'Fallo al subir'}
                        </Badge>
                      )}
                       {uploadedFile.status === 'uploading' && uploadedFile.progress === 100 && uploadedFile.status !== 'success' && uploadedFile.status !== 'error' && (
                        <Badge variant="default" className="mt-2 bg-blue-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" /> Procesando...
                        </Badge>
                       )}
                    </div>
                    {uploadedFile.status === 'uploading' && uploadedFile.progress < 100 && (
                       <Loader2 className="w-5 h-5 text-muted-foreground animate-spin shrink-0" />
                    )}
                    {(uploadedFile.status === 'success' || uploadedFile.status === 'error') && (
                      <Button variant="ghost" size="icon" onClick={() => removeFile(uploadedFile.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <XCircle className="w-5 h-5" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
         {files.length > 0 && (
            <div className="mt-6 flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setFiles([])}>Limpiar Todo</Button>
                 <Button className="bg-primary hover:bg-primary/90">Iniciar Subida ({files.filter(f => f.status === 'uploading' && f.progress < 100).length})</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
