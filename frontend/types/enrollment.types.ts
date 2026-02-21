import type { Course } from "./course.types";

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED";

export interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
  droppedAt: string | null;
  studentId: string;
  courseId: string;
  course?: Course;
}

export interface LessonProgress {
  id: string;
  isCompleted: boolean;
  completedAt: string | null;
  enrollmentId: string;
  lessonId: string;
}
