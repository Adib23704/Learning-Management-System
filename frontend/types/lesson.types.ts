export interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  order: number;
  isPreview: boolean;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}
