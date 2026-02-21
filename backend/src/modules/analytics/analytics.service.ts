import { prisma } from "../../config/database.js";

export const analyticsService = {
  async getOverview() {
    const [totalCourses, totalStudents, totalEnrollments, revenueResult] =
      await Promise.all([
        prisma.course.count({ where: { isDeleted: false } }),
        prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
        prisma.enrollment.count(),
        prisma.$queryRaw<[{ total: number }]>`
          SELECT COALESCE(SUM(c.price), 0)::float AS total
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          WHERE c.is_free = false
        `,
      ]);

    return {
      totalCourses,
      totalStudents,
      totalEnrollments,
      totalRevenue: revenueResult[0]?.total ?? 0,
    };
  },

  async getEnrollmentGrowth(days = 10) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT
        TO_CHAR(enrolled_at, 'YYYY-MM-DD') AS date,
        COUNT(*)::int AS count
      FROM enrollments
      WHERE enrolled_at >= ${since}
      GROUP BY TO_CHAR(enrolled_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    return result;
  },

  async getTopCourses(limit = 5) {
    const courses = await prisma.course.findMany({
      where: { isDeleted: false, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: limit,
    });

    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      thumbnailUrl: c.thumbnailUrl,
      enrollmentCount: c._count.enrollments,
    }));
  },

  async getRevenueByCourse() {
    const result = await prisma.$queryRaw<
      {
        course_id: string;
        title: string;
        price: number;
        enrollment_count: number;
        total_revenue: number;
      }[]
    >`
      SELECT
        c.id AS course_id,
        c.title,
        c.price::float AS price,
        COUNT(e.id)::int AS enrollment_count,
        (c.price * COUNT(e.id))::float AS total_revenue
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.is_deleted = false AND c.is_free = false
      GROUP BY c.id, c.title, c.price
      ORDER BY total_revenue DESC
    `;

    return result.map((r) => ({
      courseId: r.course_id,
      title: r.title,
      price: r.price,
      enrollmentCount: r.enrollment_count,
      totalRevenue: r.total_revenue,
    }));
  },

  async getCompletionRates() {
    const result = await prisma.$queryRaw<
      {
        instructor_id: string;
        first_name: string;
        last_name: string;
        total_enrollments: number;
        completed: number;
      }[]
    >`
      SELECT
        u.id AS instructor_id,
        u.first_name,
        u.last_name,
        COUNT(e.id)::int AS total_enrollments,
        COUNT(CASE WHEN e.status = 'COMPLETED' THEN 1 END)::int AS completed
      FROM users u
      JOIN courses c ON u.id = c.instructor_id
      JOIN enrollments e ON c.id = e.course_id
      WHERE u.role = 'INSTRUCTOR' AND c.is_deleted = false
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY total_enrollments DESC
    `;

    return result.map((r) => ({
      instructorId: r.instructor_id,
      firstName: r.first_name,
      lastName: r.last_name,
      totalEnrollments: r.total_enrollments,
      completed: r.completed,
      completionRate:
        r.total_enrollments > 0
          ? Math.round((r.completed / r.total_enrollments) * 100)
          : 0,
    }));
  },

  async getInstructorOverview(instructorId: string) {
    const [courseCount, studentResult, revenueResult] = await Promise.all([
      prisma.course.count({
        where: { instructorId, isDeleted: false },
      }),
      prisma.enrollment.count({
        where: { course: { instructorId, isDeleted: false } },
      }),
      prisma.$queryRaw<[{ total: number }]>`
        SELECT COALESCE(SUM(c.price), 0)::float AS total
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ${instructorId} AND c.is_free = false
      `,
    ]);

    return {
      courseCount,
      totalStudents: studentResult,
      totalRevenue: revenueResult[0]?.total ?? 0,
    };
  },

  async getInstructorRevenue(instructorId: string) {
    const result = await prisma.$queryRaw<
      {
        course_id: string;
        title: string;
        price: number;
        enrollment_count: number;
        total_revenue: number;
      }[]
    >`
      SELECT
        c.id AS course_id,
        c.title,
        c.price::float AS price,
        COUNT(e.id)::int AS enrollment_count,
        (c.price * COUNT(e.id))::float AS total_revenue
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.instructor_id = ${instructorId} AND c.is_deleted = false
      GROUP BY c.id, c.title, c.price
      ORDER BY total_revenue DESC
    `;

    return result.map((r) => ({
      courseId: r.course_id,
      title: r.title,
      price: r.price,
      enrollmentCount: r.enrollment_count,
      totalRevenue: r.total_revenue,
    }));
  },
};
