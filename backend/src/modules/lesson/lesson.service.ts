import { ForbiddenError, NotFoundError } from "../../common/errors/index.js";
import type { AppRole } from "../../common/types/express.js";
import { courseRepository } from "../course/course.repository.js";
import type { CreateLessonInput, UpdateLessonInput } from "./lesson.dto.js";
import { lessonRepository } from "./lesson.repository.js";

async function verifyCourseOwnership(
  courseId: string,
  userId: string,
  userRole: AppRole,
) {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new NotFoundError("Course");
  if (userRole === "INSTRUCTOR" && course.instructorId !== userId) {
    throw new ForbiddenError(
      "You can only manage lessons for your own courses",
    );
  }
  return course;
}

export const lessonService = {
  async listByCourse(courseId: string) {
    return lessonRepository.findByCourse(courseId);
  },

  async getById(id: string) {
    const lesson = await lessonRepository.findById(id);
    if (!lesson) throw new NotFoundError("Lesson");
    return lesson;
  },

  async create(
    courseId: string,
    input: CreateLessonInput,
    userId: string,
    userRole: AppRole,
  ) {
    await verifyCourseOwnership(courseId, userId, userRole);
    const order = await lessonRepository.getNextOrder(courseId);
    return lessonRepository.create({
      ...input,
      videoUrl: input.videoUrl || undefined,
      order,
      courseId,
    });
  },

  async update(
    id: string,
    input: UpdateLessonInput,
    userId: string,
    userRole: AppRole,
  ) {
    const lesson = await lessonRepository.findById(id);
    if (!lesson) throw new NotFoundError("Lesson");
    await verifyCourseOwnership(lesson.courseId, userId, userRole);
    return lessonRepository.update(id, input);
  },

  async delete(id: string, userId: string, userRole: AppRole) {
    const lesson = await lessonRepository.findById(id);
    if (!lesson) throw new NotFoundError("Lesson");
    await verifyCourseOwnership(lesson.courseId, userId, userRole);
    return lessonRepository.delete(id);
  },

  async reorder(
    courseId: string,
    items: { id: string; order: number }[],
    userId: string,
    userRole: AppRole,
  ) {
    await verifyCourseOwnership(courseId, userId, userRole);
    return lessonRepository.reorder(courseId, items);
  },
};
