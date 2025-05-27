
export interface Lesson {
  id: string;
  title: string;
  content?: string; // For text content
  contentType?: 'text' | 'video' | 'quiz'; // Default to 'text' if undefined
  videoUrl?: string; // if contentType is 'video'
  quizPlaceholder?: string; // Used as the main question for quizzes
  quizOptions?: string[]; // Array of answer options for quizzes
  correctQuizOptionIndex?: number; // Index of the correct option in quizOptions
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
