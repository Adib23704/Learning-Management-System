import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/index.js";
import { emailService } from "../../common/services/email.service.js";
import { prisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { emitToUser } from "../../socket/emitter.js";
import { courseRepository } from "../course/course.repository.js";
import { notificationService } from "../notification/notification.service.js";
import type { EnrollmentQueryInput } from "./enrollment.dto.js";
import { enrollmentRepository } from "./enrollment.repository.js";

export const enrollmentService = {
  async getMyEnrollments(studentId: string, query: EnrollmentQueryInput) {
    return enrollmentRepository.findByStudentId(studentId, query);
  },

  async getEnrollmentDetail(studentId: string, courseId: string) {
    const enrollment = await enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (!enrollment) throw new NotFoundError("Enrollment");
    return enrollment;
  },

  async enroll(studentId: string, courseId: string) {
    const course = await courseRepository.findById(courseId);
    if (!course) throw new NotFoundError("Course");
    if (course.status !== "PUBLISHED") {
      throw new BadRequestError("Cannot enroll in an unpublished course");
    }

    const existing = await enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (existing) {
      if (existing.status === "DROPPED") {
        throw new BadRequestError(
          "You previously dropped this course. Contact support to re-enroll.",
        );
      }
      throw new ConflictError("You are already enrolled in this course");
    }

    const enrollment = await enrollmentRepository.create(studentId, courseId);

    this.onEnrollment(studentId, course).catch((err) =>
      logger.error({ err }, "Post-enrollment side effects failed"),
    );

    return enrollment;
  },

  async onEnrollment(
    studentId: string,
    course: { id: string; title: string; instructorId: string },
  ) {
    const [student, instructor] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: { firstName: true, lastName: true, email: true },
      }),
      prisma.user.findUnique({
        where: { id: course.instructorId },
        select: { firstName: true, lastName: true, email: true },
      }),
    ]);

    if (!student || !instructor) return;

    const studentName = `${student.firstName} ${student.lastName}`;
    const instructorName = `${instructor.firstName} ${instructor.lastName}`;

    await notificationService.create(
      course.instructorId,
      "New Enrollment",
      `${studentName} enrolled in "${course.title}"`,
      "ENROLLMENT",
    );

    emitToUser(studentId, "enrollment:new", { courseId: course.id });

    await Promise.allSettled([
      emailService.sendEnrollmentConfirmation(
        student.email,
        student.firstName,
        course.title,
      ),
      emailService.sendNewEnrollmentNotification(
        instructor.email,
        instructorName,
        studentName,
        course.title,
      ),
    ]);
  },

  async drop(studentId: string, courseId: string) {
    const enrollment = await enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (!enrollment) throw new NotFoundError("Enrollment");
    if (enrollment.studentId !== studentId) {
      throw new ForbiddenError("Not your enrollment");
    }
    if (enrollment.status !== "ACTIVE") {
      throw new BadRequestError("Can only drop active enrollments");
    }

    return enrollmentRepository.drop(enrollment.id);
  },

  async markLessonComplete(
    studentId: string,
    courseId: string,
    lessonId: string,
  ) {
    const enrollment = await enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (!enrollment) throw new NotFoundError("Enrollment");
    if (enrollment.status !== "ACTIVE") {
      throw new BadRequestError("Enrollment is not active");
    }

    await enrollmentRepository.markLessonComplete(enrollment.id, lessonId);
    const updated = await enrollmentRepository.recalculateProgress(
      enrollment.id,
    );

    if (updated.status === "COMPLETED") {
      this.onCourseComplete(studentId, courseId).catch((err) =>
        logger.error({ err }, "Post-completion side effects failed"),
      );
    }

    return updated;
  },

  async onCourseComplete(studentId: string, courseId: string) {
    const [student, course] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: { firstName: true, email: true },
      }),
      prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true },
      }),
    ]);

    if (!student || !course) return;

    await notificationService.create(
      studentId,
      "Course Completed!",
      `Congratulations! You've completed "${course.title}"`,
      "COURSE_COMPLETED",
    );

    await emailService.sendCourseCompletionEmail(
      student.email,
      student.firstName,
      course.title,
    );
  },

  async getProgress(studentId: string, courseId: string) {
    const enrollment = await enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (!enrollment) throw new NotFoundError("Enrollment");

    const progress = await enrollmentRepository.getProgress(enrollment.id);
    return {
      enrollment: {
        id: enrollment.id,
        progress: enrollment.progress,
        status: enrollment.status,
      },
      lessons: progress,
    };
  },
};
