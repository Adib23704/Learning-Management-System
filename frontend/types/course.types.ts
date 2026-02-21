import type { Category } from "./category.types";
import type { User } from "./user.types";

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  isFree: boolean;
  status: CourseStatus;
  instructorId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  instructor?: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">;
  category?: Category | null;
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

export interface CourseFilters {
  cursor?: string;
  limit?: number;
  search?: string;
  categoryId?: string;
  isFree?: boolean;
  status?: CourseStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
