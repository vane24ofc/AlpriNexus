
export interface Lesson {
  id: string;
  title: string;
  content?: string; // Nuevo campo para el contenido de la lección
  // En un futuro: contentType: 'video' | 'text' | 'quiz';
  // En un futuro: contentUrl?: string;
  // En un futuro: description?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string; // URL de la imagen de miniatura (local o remota)
  instructorName: string; // Nombre del instructor que lo creó/subió
  status: 'pending' | 'approved' | 'rejected';
  lessons: Lesson[];
  interactiveContent?: string; // Placeholder para contenido interactivo
  // dataAiHint para la imagen es buena idea, la añadiremos al usar <Image/>
}
