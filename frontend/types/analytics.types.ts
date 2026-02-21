export interface OverviewStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export interface EnrollmentGrowthItem {
  date: string;
  count: number;
}

export interface PopularCourse {
  id: string;
  title: string;
  enrollmentCount: number;
}

export interface RevenueItem {
  courseId: string;
  title: string;
  price: number;
  enrollmentCount: number;
  totalRevenue: number;
}

export interface CompletionRate {
  instructorId: string;
  firstName: string;
  lastName: string;
  totalEnrollments: number;
  completed: number;
  completionRate: number;
}

export interface InstructorOverview {
  courseCount: number;
  totalStudents: number;
  totalRevenue: number;
}
