
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, XCircle, CheckCircle, Loader2, Eye, Users, Globe, Briefcase, BookOpen, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessionRole } from '@/app/dashboard/layout';
import { useToast } from '@/hooks/use-toast';

type FileVisibility = 'private' | 'instructors' | 'public';
type FileCategory = 'company' | 'learning';

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  visibility: FileVisibility;
  category: FileCategory;
  apiResourceId?: string;
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
}


interface FileUploaderProps {
  onResourceRegistered?: (newResource: ApiResource) => void;
}

const visibilityOptions: { value: FileVisibility; label: string; icon: React.ElementType }[] = [
  { value: 'public', label: 'Todos (Público)', icon: Globe },
  { value: 'instructors', label: 'Instructores y Administradores', icon: Users },
  { value: 'private', label: 'Solo para mí (Privado)', icon: Eye },
];

const categoryOptions: { value: FileCategory; label: string; icon: React.ElementType }[] = [
  { value: 'learning', label: 'Archivos de Aprendizaje', icon: BookOpen },
  { value: 'company', label: 'Recursos de la Empresa', icon: Briefcase },
];

const SIMULATED_UPLOADER_USER_ID = 1;

export function FileUploader({ onResourceRegistered }: FileUploaderProps) {
  const { currentSessionRole } = useSessionRole();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedVisibility, setSelectedVisibility] = useState<FileVisibility>('public');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('learning');
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const { toast } = useToast();

  const isAdmin = currentSessionRole === 'administrador';
  const isInstructor = currentSessionRole === 'instructor';
  const canUpload = isAdmin || isInstructor;

  useEffect(() => {
    if (isInstructor) {
      setSelectedCategory('learning'); 
    }
  }, [isInstructor]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: 'pending',
      visibility: selectedVisibility,
      category: isAdmin ? selectedCategory : 'learning',
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, [selectedVisibility, selectedCategory, isAdmin]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return 'Desconocido';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'Imagen';
    if (extension === 'pdf') return 'PDF';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'Video';
    if (['doc', 'docx'].includes(extension)) return 'Documento';
    if (['ppt', 'pptx'].includes(extension)) return 'Presentación';
    if (['xls', 'xlsx'].includes(extension)) return 'Hoja de Cálculo';
    return extension.toUpperCase();
  };

  const handleSimulateUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || (f.status === 'error' && !f.apiResourceId));
    if (pendingFiles.length === 0) {
        toast({ title: "No hay archivos para subir", description: "Por favor, añade algunos archivos primero o asegúrate de que no hayan fallado previamente." });
        return;
    }
    setIsSimulatingUpload(true);
    toast({ title: "Subida Iniciada", description: "Los archivos seleccionados están siendo procesados." });

    for (const uploadedFile of pendingFiles) {
      setFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'uploading', progress: 0, error: undefined } : f));
      
      for (let currentProgress = 0; currentProgress <= 100; currentProgress += Math.floor(Math.random() * 20) + 20) {
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
        setFiles(prev =>
          prev.map(f => (f.id === uploadedFile.id ? { ...f, progress: Math.min(currentProgress, 100) } : f))
        );
        if (currentProgress >= 100) break;
      }

      const resourcePayload = {
        name: uploadedFile.file.name,
        type: getFileType(uploadedFile.file.name),
        size: formatBytes(uploadedFile.file.size),
        visibility: uploadedFile.visibility,
        category: uploadedFile.category,
        uploaderUserId: canUpload ? SIMULATED_UPLOADER_USER_ID : undefined,
      };

      try {
        const response = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourcePayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({message: "Error desconocido del servidor."}));
          throw new Error(errorData.message || `Error ${response.status} al crear metadatos.`);
        }
        
        const result: { message: string; resource: ApiResource } = await response.json();
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id ? { 
                ...f, 
                progress: 100, 
                status: 'success',
                apiResourceId: result.resource.id
            } : f
          )
        );
        toast({ title: "Archivo Registrado", description: `Metadatos para "${uploadedFile.file.name}" creados en la base de datos.` });
        
        if (onResourceRegistered) {
          onResourceRegistered(result.resource);
        }

      } catch (apiError: any) {
        console.error(`API Error for ${uploadedFile.file.name}:`, apiError);
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id ? { 
                ...f, 
                progress: 100, 
                status: 'error',
                error: apiError.message || 'Fallo al registrar en BD.'
            } : f
          )
        );
        toast({ variant: "destructive", title: `Error al Registrar ${uploadedFile.file.name}`, description: apiError.message });
      }
    }
    setIsSimulatingUpload(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', 'jpg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    disabled: isSimulatingUpload,
  });

  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id && file.status !== 'uploading'));
  };
  
  const clearAllNonSuccessfulFiles = () => {
    setFiles(prev => prev.filter(f => f.status === 'success' || f.status === 'uploading'));
    if (files.some(f => f.status === 'uploading' && isSimulatingUpload)) {
      toast({title: "Algunos archivos están en proceso", description: "Espera a que terminen las subidas activas para limpiar."})
    }
  };

  const getVisibilityLabel = (visibility: FileVisibility) => {
    return visibilityOptions.find(opt => opt.value === visibility)?.label || 'Desconocido';
  };

  const getCategoryLabel = (category: FileCategory) => {
    return categoryOptions.find(opt => opt.value === category)?.label || 'Desconocido';
  };
  
  const filesToUploadOrRetryCount = files.filter(f => f.status === 'pending' || (f.status === 'error' && !f.apiResourceId)).length;

  if (!canUpload) return null;

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle>Subir Recursos</CardTitle>
        <CardDescription>
          {isAdmin && "Selecciona la categoría y visibilidad, luego arrastra y suelta archivos o haz clic para buscar."}
          {isInstructor && "Selecciona la visibilidad (tus archivos se subirán a 'Archivos de Aprendizaje'), luego arrastra y suelta archivos o haz clic para buscar."}
          {" Se registrarán los metadatos en la base de datos. La subida real del archivo no está implementada."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="category-select" className="text-base font-medium">Categoría del Recurso:</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value: FileCategory) => setSelectedCategory(value)}
                disabled={isSimulatingUpload}
              >
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

          {isInstructor && (
             <div className="space-y-2">
                <Label className="text-base font-medium">Categoría del Recurso:</Label>
                <p className="text-sm text-muted-foreground p-2 border rounded-md bg-muted flex items-center">
                    <BookOpen className="w-4 h-4 mr-2"/>
                    Archivos de Aprendizaje (Automático)
                </p>
            </div>
          )}
          
          <div className="space-y-2">
              <Label htmlFor="visibility-select" className="text-base font-medium">Visibilidad para los nuevos archivos:</Label>
              <Select 
                  value={selectedVisibility} 
                  onValueChange={(value: FileVisibility) => setSelectedVisibility(value)}
                  disabled={isSimulatingUpload}
              >
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
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/70 hover:bg-muted/50'}
            ${isSimulatingUpload ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-16 h-16 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          {isDragActive ? (
            <p className="text-lg font-semibold text-primary">Suelta los archivos aquí...</p>
          ) : (
            <>
              <p className="text-lg font-semibold">Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos</p>
              <p className="text-sm text-muted-foreground">Tamaño máximo de archivo: 50MB (para simulación)</p>
            </>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Archivos en Cola ({files.length})</h4>
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
                           Cat: {getCategoryLabel(uploadedFile.category)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                           Vis: {getVisibilityLabel(uploadedFile.visibility)}
                        </Badge>
                      </div>
                      {uploadedFile.status === 'uploading' && (
                        <Progress value={uploadedFile.progress} className="h-1.5 mt-2" />
                      )}
                      {uploadedFile.status === 'success' && (
                        <Badge variant="default" className="mt-2 bg-accent text-accent-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" /> Registrado en BD
                        </Badge>
                      )}
                      {uploadedFile.status === 'error' && (
                        <Badge variant="destructive" className="mt-2">
                          <XCircle className="w-3 h-3 mr-1" /> Error: {uploadedFile.error || 'Fallo al registrar'}
                        </Badge>
                      )}
                       {uploadedFile.status === 'pending' && (
                        <Badge variant="outline" className="mt-2">
                            Pendiente de Registro
                        </Badge>
                       )}
                    </div>
                    {(uploadedFile.status !== 'uploading' || uploadedFile.progress === 100) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFile(uploadedFile.id)} 
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        disabled={isSimulatingUpload && uploadedFile.status === 'uploading'}
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    )}
                    {uploadedFile.status === 'uploading' && uploadedFile.progress < 100 && isSimulatingUpload &&(
                       <Loader2 className="w-5 h-5 text-muted-foreground animate-spin shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
         {files.length > 0 && (
            <div className="mt-6 flex justify-end gap-2">
                 <Button variant="outline" onClick={clearAllNonSuccessfulFiles} disabled={isSimulatingUpload && files.some(f=> f.status === 'uploading')}>Limpiar Cola (No Exitosos)</Button>
                 <Button onClick={handleSimulateUploadAll} disabled={isSimulatingUpload || filesToUploadOrRetryCount === 0} className="min-w-[150px]">
                    {isSimulatingUpload ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />}
                    {isSimulatingUpload ? 'Registrando...' : `Registrar ${filesToUploadOrRetryCount > 0 ? `(${filesToUploadOrRetryCount}) Archivo(s)` : 'Archivos'}`}
                  </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

