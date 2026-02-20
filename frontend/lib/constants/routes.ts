export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  COURSES: "/courses",
  COURSE_DETAIL: (slug: string) => `/courses/${slug}`,

  STUDENT: {
    HOME: "/student",
    COURSES: "/student/courses",
    COURSE: (id: string) => `/student/courses/${id}`,
    LESSON: (courseId: string, lessonId: string) =>
      `/student/courses/${courseId}/lessons/${lessonId}`,
  },

  INSTRUCTOR: {
    HOME: "/instructor",
    COURSES: "/instructor/courses",
    NEW_COURSE: "/instructor/courses/new",
    EDIT_COURSE: (id: string) => `/instructor/courses/${id}`,
    COURSE_LESSONS: (id: string) => `/instructor/courses/${id}/lessons`,
    COURSE_STUDENTS: (id: string) => `/instructor/courses/${id}/students`,
    COURSE_ANALYTICS: (id: string) => `/instructor/courses/${id}/analytics`,
    ANALYTICS: "/instructor/analytics",
  },

  ADMIN: {
    HOME: "/admin",
    USERS: "/admin/users",
    COURSES: "/admin/courses",
    CATEGORIES: "/admin/categories",
    ANALYTICS: "/admin/analytics",
  },

  SUPER_ADMIN: {
    HOME: "/super-admin",
    ADMINS: "/super-admin/admins",
    USERS: "/super-admin/users",
    COURSES: "/super-admin/courses",
    ANALYTICS: "/super-admin/analytics",
    CONFIG: "/super-admin/config",
  },
} as const;

export const ROLE_DASHBOARD: Record<string, string> = {
  STUDENT: ROUTES.STUDENT.HOME,
  INSTRUCTOR: ROUTES.INSTRUCTOR.HOME,
  ADMIN: ROUTES.ADMIN.HOME,
  SUPER_ADMIN: ROUTES.SUPER_ADMIN.HOME,
};
