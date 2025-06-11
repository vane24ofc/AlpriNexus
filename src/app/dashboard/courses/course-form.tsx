
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ImageUp, PlusCircle, Trash2, Save, Send, Loader2, Sparkles, FileText, Video, Puzzle, Brain } from 'lucide-react';
import Image from 'next/image';
import type { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSessionRole } from '@/app/dashboard/layout';
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

const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "El título de la lección debe tener al menos 3 caracteres." }),
  contentType: z.enum(['text', 'video', 'quiz']).default('text'),
  content: z.string().optional(),
  videoUrl: z.string().url({ message: "Por favor, introduce una URL válida para el video (ej: https://www.youtube.com/embed/VIDEO_ID)." }).optional().or(z.literal('')).or(z.null())
    .refine(val => val === null || val === '' || (typeof val === 'string' && val.startsWith('https://www.youtube.com/embed/')), {
        message: "La URL debe ser un enlace 'embed' de YouTube (ej: https://www.youtube.com/embed/VIDEO_ID)",
    }),
  quizPlaceholder: z.string().optional(),
  quizOptions: z.array(z.string().optional()).optional().default(['', '', '']),
  correctQuizOptionIndex: z.number().optional(),
}).refine(data => {
  if (data.contentType === 'quiz') {
    const providedOptions = data.quizOptions?.filter(opt => opt && opt.trim() !== '').length || 0;
    if (providedOptions < 2) {
      return false; 
    }
    if (providedOptions > 0 && data.correctQuizOptionIndex === undefined) {
        return false;
    }
    if (data.correctQuizOptionIndex !== undefined && (data.correctQuizOptionIndex < 0 || data.correctQuizOptionIndex >= (data.quizOptions || []).length || !(data.quizOptions?.[data.correctQuizOptionIndex]?.trim())  )) {
        if (data.quizOptions?.[data.correctQuizOptionIndex]?.trim() === '') {
            return false; 
        }
    }
  }
  return true;
}, {
  message: "Para quizzes, debe proporcionar al menos 2 opciones con texto, y seleccionar una respuesta correcta que no esté vacía.",
  path: ['correctQuizOptionIndex'], 
});


const courseFormSchema = z.object({
  title: z.string().min(5, { message: "El título del curso debe tener al menos 5 caracteres." }),
  description: z.string().min(20, { message: "La descripción debe tener al menos 20 caracteres." }),
  thumbnailFile: z.instanceof(File).optional().nullable(),
  lessons: z.array(lessonSchema).min(1, { message: "El curso debe tener al menos una lección." }),
  interactiveContent: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  initialData?: Course;
  onSubmitCourse: (data: CourseFormValues, thumbnailUrl?: string) => Promise<void>;
  isSubmitting: boolean;
}

const lessonTypeOptions = [
  { value: 'text', label: 'Texto', icon: FileText },
  { value: 'video', label: 'Video (YouTube Embed)', icon: Video },
  { value: 'quiz', label: 'Quiz (Interactivo)', icon: Puzzle },
];

export default function CourseForm({ initialData, onSubmitCourse, isSubmitting }: CourseFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentSessionRole } = useSessionRole();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnailUrl || null);
  const [isAiGeneratingThumbnail, setIsAiGeneratingThumbnail] = useState(false);
  const [isAiGeneratingOutline, setIsAiGeneratingOutline] = useState(false);

  const [aiGeneratingLessonContentFor, setAiGeneratingLessonContentFor] = useState<number | null>(null);
  const [showConfirmReplaceLessonContentDialog, setShowConfirmReplaceLessonContentDialog] = useState(false);
  const [aiLessonContentToApply, setAiLessonContentToApply] = useState<{ index: number; content: string } | null>(null);
  
  const isAnyAiWorking = isAiGeneratingThumbnail || isAiGeneratingOutline || aiGeneratingLessonContentFor !== null;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      thumbnailFile: null,
      lessons: initialData?.lessons?.map(l => ({
        id: l.id,
        title: l.title,
        contentType: l.contentType || 'text',
        content: l.content || '',
        videoUrl: l.videoUrl || '',
        quizPlaceholder: l.quizPlaceholder || 'Pregunta de ejemplo para el quiz',
        quizOptions: l.quizOptions && l.quizOptions.length >= 0 ? (l.quizOptions.concat(['','','']).slice(0,3) as [string,string,string]) : ['', '', ''],
        correctQuizOptionIndex: l.correctQuizOptionIndex
      })) || [{ title: '', contentType: 'text', content: '', videoUrl: '', quizPlaceholder: 'Pregunta de ejemplo para el quiz', quizOptions: ['', '', ''], correctQuizOptionIndex: undefined }],
      interactiveContent: initialData?.interactiveContent || '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "lessons",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        thumbnailFile: null,
        lessons: initialData.lessons?.map(l => ({
          id: l.id,
          title: l.title,
          contentType: l.contentType || 'text',
          content: l.content || '',
          videoUrl: l.videoUrl || '',
          quizPlaceholder: l.quizPlaceholder || '',
          quizOptions: l.quizOptions && l.quizOptions.length >= 0 ? (l.quizOptions.concat(['','','']).slice(0,3) as [string,string,string]) : ['', '', ''],
          correctQuizOptionIndex: l.correctQuizOptionIndex
        })) || [{ title: '', contentType: 'text', content: '', videoUrl: '', quizPlaceholder: 'Pregunta de ejemplo para el quiz', quizOptions: ['', '', ''], correctQuizOptionIndex: undefined }],
        interactiveContent: initialData.interactiveContent || '',
      });
      setThumbnailPreview(initialData.thumbnailUrl || null);
    }
  }, [initialData, form]);


  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: "destructive", title: "Archivo Demasiado Grande", description: "La imagen no debe exceder los 5MB." });
        form.setValue('thumbnailFile', null);
        setThumbnailPreview(initialData?.thumbnailUrl || null);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ variant: "destructive", title: "Tipo de Archivo Inválido", description: "Por favor, selecciona un archivo de imagen." });
        form.setValue('thumbnailFile', null);
        setThumbnailPreview(initialData?.thumbnailUrl || null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        form.setValue('thumbnailFile', file);
        form.clearErrors('thumbnailFile');
      };
      reader.readAsDataURL(file);
    } else {
        form.setValue('thumbnailFile', null);
        setThumbnailPreview(initialData?.thumbnailUrl || null);
    }
  };

  const triggerThumbnailSelect = () => {
    thumbnailFileRef.current?.click();
  };


  const handleGenerateLessonContent = async (lessonIndex: number) => {
    const courseTitle = form.getValues("title");
    const courseDescription = form.getValues("description");
    const lessonTitle = form.getValues(`lessons.${lessonIndex}.title`);

    if (!courseTitle.trim()) {
      form.setError("title", { type: "manual", message: "El título del curso es necesario para generar contenido de lección."});
      return;
    }
    if (!lessonTitle.trim()) {
      form.setError(`lessons.${lessonIndex}.title`, { type: "manual", message: "El título de la lección es necesario."});
      return;
    }
    
    setAiGeneratingLessonContentFor(lessonIndex);
    try {
      const input: GenerateLessonContentInput = { courseTitle, courseDescription, lessonTitle };

      if (result.generatedContent && !result.generatedContent.startsWith('Error:')) {
        const currentContent = form.getValues(`lessons.${lessonIndex}.content`);
        if (currentContent && currentContent.trim() !== '') {
          setAiLessonContentToApply({ index: lessonIndex, content: result.generatedContent });
          setShowConfirmReplaceLessonContentDialog(true);
        } else {
          form.setValue(`lessons.${lessonIndex}.content`, result.generatedContent);
          toast({ title: "Contenido Generado por IA", description: `Se ha añadido un borrador de contenido para la Lección ${lessonIndex + 1}.` });
        }
      } else {
         toast({ variant: "destructive", title: "Error de IA", description: result.generatedContent || "La IA no pudo generar contenido para la lección." });
      }
    } catch (error) {
      console.error("Error generando contenido de lección con IA:", error);
      toast({ variant: "destructive", title: "Error de IA", description: "Ocurrió un error al generar contenido para la lección." });
    } finally {
      setAiGeneratingLessonContentFor(null);
    }
  };

  const confirmReplaceLessonContent = () => {
    if (aiLessonContentToApply) {
      form.setValue(`lessons.${aiLessonContentToApply.index}.content`, aiLessonContentToApply.content);
      toast({ title: "Contenido Reemplazado", description: `El contenido de la Lección ${aiLessonContentToApply.index + 1} ha sido actualizado con el borrador de la IA.` });
    }
    setShowConfirmReplaceLessonContentDialog(false);
    setAiLessonContentToApply(null);
  };

  const cancelReplaceLessonContent = () => {
    setShowConfirmReplaceLessonContentDialog(false);
    setAiLessonContentToApply(null);
  };

  const processSubmit = async (data: CourseFormValues) => {
    let finalThumbnailUrl = initialData?.thumbnailUrl;

    if (thumbnailPreview && thumbnailPreview !== initialData?.thumbnailUrl) {
        finalThumbnailUrl = thumbnailPreview; 
    } else if (!thumbnailPreview && initialData?.thumbnailUrl) {
        finalThumbnailUrl = initialData.thumbnailUrl;
    } else if (!thumbnailPreview && !initialData?.thumbnailUrl && !data.thumbnailFile) {
        finalThumbnailUrl = thumbnailPreview || "https://placehold.co/600x400.png?text=Curso"; 
    }

    const lessonsWithDetails = data.lessons.map(lesson => {
        const filteredQuizOptions = lesson.contentType === 'quiz' 
            ? (lesson.quizOptions || []).filter(opt => opt && opt.trim() !== '') 
            : undefined;
        return {
            ...lesson,
            id: lesson.id || crypto.randomUUID(),
            content: lesson.contentType === 'text' ? lesson.content || '' : undefined,
            videoUrl: lesson.contentType === 'video' ? lesson.videoUrl || undefined : undefined,
            quizPlaceholder: lesson.contentType === 'quiz' ? lesson.quizPlaceholder || '' : undefined,
            quizOptions: filteredQuizOptions && filteredQuizOptions.length > 0 ? filteredQuizOptions : undefined,
            correctQuizOptionIndex: lesson.contentType === 'quiz' && filteredQuizOptions && filteredQuizOptions.length > 0 ? lesson.correctQuizOptionIndex : undefined,
            contentType: lesson.contentType || 'text'
        };
    });

    await onSubmitCourse({...data, lessons: lessonsWithDetails}, finalThumbnailUrl);
  };
  
  const formDisabled = isSubmitting || isAnyAiWorking;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
                <CardDescription>Proporciona los detalles básicos de tu curso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Curso</FormLabel>
                      <FormControl><Input placeholder="Ej: Desarrollo Web Moderno con React" {...field} disabled={formDisabled} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Curso</FormLabel>
                      <FormControl><Textarea placeholder="Describe de qué trata tu curso, a quién va dirigido, y qué aprenderán los estudiantes." {...field} rows={5} disabled={formDisabled} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lecciones del Curso</CardTitle>
                  <CardDescription>Añade y organiza las lecciones. Debes añadir al menos una.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((fieldItem, index) => {
                  const currentLessonType = form.watch(`lessons.${index}.contentType`);
                  const isCurrentLessonAiGenerating = aiGeneratingLessonContentFor === index;
                  const lessonTitleValue = form.watch(`lessons.${index}.title`);
                  const courseTitleValue = form.watch("title");

                  return (
                  <div key={fieldItem.id} className="flex flex-col gap-3 p-4 border rounded-md bg-muted/30 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-primary pt-2 text-lg">{index + 1}.</span>
                      <div className="flex-grow space-y-3">
                        <FormField
                          control={form.control}
                          name={`lessons.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título de la Lección</FormLabel>
                              <FormControl><Input placeholder={`Título para Lección ${index + 1}`} {...field} disabled={formDisabled} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lessons.${index}.contentType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Contenido</FormLabel>
                              <Select onValueChange={(value) => {
                                  field.onChange(value);
                                  const currentLessonValues = form.getValues(`lessons.${index}`);
                                  form.setValue(`lessons.${index}`, {
                                    ...currentLessonValues,
                                    contentType: value as 'text' | 'video' | 'quiz',
                                    content: value === 'text' ? currentLessonValues.content || '' : '',
                                    videoUrl: value === 'video' ? currentLessonValues.videoUrl || '' : '',
                                    quizPlaceholder: value === 'quiz' ? currentLessonValues.quizPlaceholder || 'Pregunta de ejemplo' : '',
                                    quizOptions: value === 'quiz' ? (currentLessonValues.quizOptions || ['', '', '']) : ['', '', ''],
                                    correctQuizOptionIndex: value === 'quiz' ? currentLessonValues.correctQuizOptionIndex : undefined,
                                  });
                                }} 
                                defaultValue={field.value} 
                                disabled={formDisabled}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo de contenido" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {lessonTypeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <div className="flex items-center">
                                        <opt.icon className="mr-2 h-4 w-4" />
                                        {opt.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {currentLessonType === 'text' && (
                          <FormField
                            control={form.control}
                            name={`lessons.${index}.content`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between items-center mb-1">
                                  <FormLabel>Contenido de Texto</FormLabel>
                                  <Button 
                            )}
                          />
                        )}
                        {currentLessonType === 'video' && (
                           <FormField
                            control={form.control}
                            name={`lessons.${index}.videoUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL del Video (YouTube Embed)</FormLabel>
                                <FormControl><Input placeholder="Ej: https://www.youtube.com/embed/VIDEO_ID" {...field} value={field.value ?? ''} disabled={formDisabled} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {currentLessonType === 'quiz' && (
                          <div className="space-y-3 pt-2 border-t mt-3">
                            <FormField
                              control={form.control}
                              name={`lessons.${index}.quizPlaceholder`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pregunta del Quiz</FormLabel>
                                  <FormControl><Textarea placeholder="Escribe aquí la pregunta principal del quiz." {...field} value={field.value ?? ''} rows={2} disabled={formDisabled} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`lessons.${index}.correctQuizOptionIndex`}
                              render={({ field: correctIndexField }) => (
                                <FormItem className="mt-3">
                                  <FormLabel className="text-sm font-medium">Opciones de Respuesta (Marque la correcta):</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={(value) => {
                                        const numValue = parseInt(value, 10);
                                        correctIndexField.onChange(isNaN(numValue) ? undefined : numValue);
                                      }}
                                      value={correctIndexField.value !== undefined ? correctIndexField.value.toString() : ""}
                                      className="space-y-1.5 mt-1"
                                      disabled={formDisabled}
                                    >
                                      {(form.watch(`lessons.${index}.quizOptions`) || ['', '', '']).slice(0, 3).map((_, optionIndex) => {
                                        const optionInputName = `lessons.${index}.quizOptions.${optionIndex}` as const;
                                        const currentOptionText = form.watch(optionInputName);
                                        const canSelectRadio = !!(currentOptionText && currentOptionText.trim() !== '');

                                        return (
                                          <FormField
                                            key={`${fieldItem.id}-option-${optionIndex}`}
                                            control={form.control}
                                            name={optionInputName}
                                            render={({ field: optionInputField }) => (
                                              <FormItem className="flex items-center space-x-2 space-y-0 py-1">
                                                 <FormControl>
                                                  <RadioGroupItem
                                                    value={optionIndex.toString()}
                                                    id={`${optionInputName}-radio`}
                                                    disabled={formDisabled || !canSelectRadio}
                                                    className="peer"
                                                  />
                                                </FormControl>
                                                <Label 
                                                  htmlFor={optionInputField.name}
                                                  className={`w-16 text-sm shrink-0 font-normal ${(!canSelectRadio && correctIndexField.value === optionIndex) ? 'text-muted-foreground opacity-70' : ''}`}
                                                >
                                                  Opción {String.fromCharCode(65 + optionIndex)}:
                                                </Label>
                                                <FormControl>
                                                  <Input
                                                    id={optionInputField.name}
                                                    placeholder="Texto de la opción..."
                                                    className="flex-grow h-9"
                                                    {...optionInputField}
                                                    value={optionInputField.value ?? ''}
                                                    onChange={(e) => {
                                                       optionInputField.onChange(e);
                                                       if (e.target.value.trim() === '' && correctIndexField.value === optionIndex) {
                                                         correctIndexField.onChange(undefined);
                                                       }
                                                       form.trigger(`lessons.${index}.correctQuizOptionIndex`);
                                                    }}
                                                    disabled={formDisabled}
                                                  />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                        );
                                      })}
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage /> 
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                      {fields.length > 1 && (
                           <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive/80 shrink-0 mt-1" aria-label="Eliminar lección" disabled={formDisabled}>
                              <Trash2 className="h-5 w-5" />
                          </Button>
                      )}
                    </div>
                  </div>
                  );
                })}
                <Button type="button" variant="outline" onClick={() => append({ title: '', contentType: 'text', content: '', videoUrl: '', quizPlaceholder: 'Pregunta de ejemplo', quizOptions: ['', '', ''], correctQuizOptionIndex: undefined })} className="w-full mt-4" disabled={formDisabled}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Añadir Lección
                </Button>
                 {form.formState.errors.lessons?.root?.message && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.lessons.root.message}</p>
                )}
                 {form.formState.errors.lessons?.message && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.lessons.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Miniatura del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="aspect-video w-full rounded-md border border-dashed flex items-center justify-center overflow-hidden bg-muted/30">
                  {thumbnailPreview ? (
                    <Image src={thumbnailPreview} alt="Previsualización de miniatura" width={300} height={168} className="object-cover h-full w-full" data-ai-hint="course thumbnail" />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <ImageUp className="mx-auto h-12 w-12 mb-2" />
                      <p>Previsualización</p>
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="thumbnailFile"
                  render={() => (
                    <FormItem>
                      <FormLabel className="sr-only">Archivo de Miniatura</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" ref={thumbnailFileRef} onChange={handleThumbnailChange} className="hidden" disabled={formDisabled}/>
                      </FormControl>
                       <Button type="button" variant="outline" onClick={triggerThumbnailSelect} className="w-full" disabled={formDisabled}>
                         <ImageUp className="mr-2 h-4 w-4" /> {thumbnailPreview ? 'Cambiar Miniatura' : 'Seleccionar Miniatura'}
                       </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                <FormField
                  control={form.control}
                  name="interactiveContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Contenido Interactivo</FormLabel>
                      <FormControl><Textarea placeholder="Pega aquí código embed (ej: iframes de videos, quizzes interactivos) o describe el contenido." {...field} rows={4} disabled={formDisabled} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs text-muted-foreground mt-2">Ej: Un video de bienvenida, un quiz de H5P, etc.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={formDisabled}>
            Cancelar
          </Button>
          <Button type="submit" disabled={formDisabled} className="min-w-[120px]">
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : (currentSessionRole === 'instructor' ? <Send className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />)}
            {isSubmitting ? 'Guardando...' : (currentSessionRole === 'instructor' ? 'Enviar a Revisión' : 'Guardar Curso')}
          </Button>
        </div>
      </form>

      {showConfirmReplaceLessonContentDialog && aiLessonContentToApply && (
        <AlertDialog open={showConfirmReplaceLessonContentDialog} onOpenChange={setShowConfirmReplaceLessonContentDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Reemplazar Contenido Existente?</AlertDialogTitle>
              <AlertDialogDescription>
                La IA ha generado un borrador de contenido para la Lección {aiLessonContentToApply.index + 1}.
                ¿Deseas reemplazar el texto que ya has escrito en esta lección?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelReplaceLessonContent}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmReplaceLessonContent}>Reemplazar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Form>
  );
}
