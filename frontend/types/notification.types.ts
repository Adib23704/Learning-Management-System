export type NotificationType =
  | "ENROLLMENT"
  | "COURSE_PUBLISHED"
  | "COURSE_COMPLETED"
  | "GENERAL";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string;
  createdAt: string;
}
