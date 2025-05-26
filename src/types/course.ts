
export interface Lesson {
  id: string;
  title: string;
  content?: string; 
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string; 
  instructorName: string; 
  status: 'pending' | 'approved' | 'rejected';
  lessons: Lesson[];
  interactiveContent?: string; 
  dataAiHint?: string; // Añadido para mejor consistencia al usar imágenes
}

    