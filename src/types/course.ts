
export interface Lesson {
  id: string;
  title: string;
  content?: string; // For text content
  contentType?: 'text' | 'video' | 'quiz'; // Default to 'text' if undefined
  videoUrl?: string; // if contentType is 'video'
  quizPlaceholder?: string; // if contentType is 'quiz'
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
  dataAiHint?: string;
}
