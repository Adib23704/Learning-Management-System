import type { CourseStatus } from "@prisma/client";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/index.js";
import type { AppRole } from "../../common/types/express.js";
import { generateSlug } from "../../common/utils/slug.js";
import { cloudinary } from "../../config/cloudinary.js";
import type {
  CourseQueryInput,
  CreateCourseInput,
  UpdateCourseInput,
} from "./course.dto.js";
import { courseRepository } from "./course.repository.js";

export const courseService = {
  async list(query: CourseQueryInput) {
    return courseRepository.findMany(query);
  },

  async getById(id: string) {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError("Course");
    return course;
  },

  async getBySlug(slug: string) {
    const course = await courseRepository.findBySlug(slug);
    if (!course) throw new NotFoundError("Course");
    return course;
  },

  async create(input: CreateCourseInput, instructorId: string) {
    const slug = generateSlug(input.title);
    return courseRepository.create({
      title: input.title,
      description: input.description,
      price: input.price,
      isFree: input.isFree,
      slug,
      instructor: { connect: { id: instructorId } },
      ...(input.categoryId && {
        category: { connect: { id: input.categoryId } },
      }),
    });
  },

  async update(
    id: string,
    input: UpdateCourseInput,
    userId: string,
    userRole: AppRole,
  ) {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError("Course");

    if (userRole === "INSTRUCTOR" && course.instructorId !== userId) {
      throw new ForbiddenError("You can only edit your own courses");
    }

    const data: Record<string, unknown> = { ...input };
    if (input.title) {
      data.slug = generateSlug(input.title);
    }
    if (input.categoryId !== undefined) {
      delete data.categoryId;
      if (input.categoryId) {
        data.category = { connect: { id: input.categoryId } };
      } else {
        data.category = { disconnect: true };
      }
    }

    return courseRepository.update(id, data);
  },

  async delete(id: string, userId: string, userRole: AppRole) {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError("Course");

    if (userRole === "INSTRUCTOR" && course.instructorId !== userId) {
      throw new ForbiddenError("You can only delete your own courses");
    }

    return courseRepository.softDelete(id);
  },

  async updateStatus(
    id: string,
    status: CourseStatus,
    userId: string,
    userRole: AppRole,
  ) {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError("Course");

    if (userRole === "INSTRUCTOR" && course.instructorId !== userId) {
      throw new ForbiddenError("You can only manage your own courses");
    }

    const validTransitions: Record<string, string[]> = {
      DRAFT: ["PUBLISHED"],
      PUBLISHED: ["ARCHIVED", "DRAFT"],
      ARCHIVED: ["DRAFT"],
    };

    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      const allowed = validTransitions[course.status] || [];
      if (!allowed.includes(status)) {
        throw new BadRequestError(
          `Cannot transition from ${course.status} to ${status}`,
        );
      }
    }

    return courseRepository.updateStatus(id, status);
  },

  async uploadThumbnail(
    id: string,
    file: Express.Multer.File,
    userId: string,
    userRole: AppRole,
  ) {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError("Course");

    if (userRole === "INSTRUCTOR" && course.instructorId !== userId) {
      throw new ForbiddenError("You can only edit your own courses");
    }

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "lms/thumbnails",
            transformation: { width: 800, height: 450, crop: "fill" },
          },
          (err, result) => {
            if (err || !result)
              return reject(err || new Error("Upload failed"));
            resolve(result);
          },
        );
        stream.end(file.buffer);
      },
    );

    return courseRepository.updateThumbnail(id, result.secure_url);
  },

  async getEnrolledStudents(
    courseId: string,
    userId: string,
    userRole: AppRole,
    cursor?: string,
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) throw new NotFoundError("Course");

    if (userRole === "INSTRUCTOR" && course.instructorId !== userId) {
      throw new ForbiddenError(
        "You can only view students for your own courses",
      );
    }

    return courseRepository.getEnrolledStudents(courseId, cursor);
  },
};
