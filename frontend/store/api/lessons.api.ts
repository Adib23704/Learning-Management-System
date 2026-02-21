import type { Lesson } from "@/types/lesson.types";
import { apiSlice } from "./base";

interface CreateLessonBody {
  title: string;
  content?: string;
  videoUrl?: string;
  isPreview?: boolean;
}

interface UpdateLessonBody {
  title?: string;
  content?: string;
  videoUrl?: string;
  isPreview?: boolean;
}

interface ReorderItem {
  id: string;
  order: number;
}

export const lessonsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLessons: builder.query<Lesson[], string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/lessons`,
        method: "GET",
      }),
      providesTags: (result, _error, courseId) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Lesson" as const,
                id,
              })),
              { type: "Lesson", id: `COURSE_${courseId}` },
            ]
          : [{ type: "Lesson", id: `COURSE_${courseId}` }],
    }),

    getLesson: builder.query<Lesson, { courseId: string; lessonId: string }>({
      query: ({ courseId, lessonId }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { lessonId }) => [
        { type: "Lesson", id: lessonId },
      ],
    }),

    createLesson: builder.mutation<
      Lesson,
      { courseId: string } & CreateLessonBody
    >({
      query: ({ courseId, ...body }) => ({
        url: `/courses/${courseId}/lessons`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Lesson", id: `COURSE_${courseId}` },
        { type: "Course", id: courseId },
      ],
    }),

    updateLesson: builder.mutation<
      Lesson,
      { courseId: string; lessonId: string } & UpdateLessonBody
    >({
      query: ({ courseId, lessonId, ...body }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { courseId, lessonId }) => [
        { type: "Lesson", id: lessonId },
        { type: "Lesson", id: `COURSE_${courseId}` },
      ],
    }),

    deleteLesson: builder.mutation<
      void,
      { courseId: string; lessonId: string }
    >({
      query: ({ courseId, lessonId }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { courseId, lessonId }) => [
        { type: "Lesson", id: lessonId },
        { type: "Lesson", id: `COURSE_${courseId}` },
        { type: "Course", id: courseId },
      ],
    }),

    reorderLessons: builder.mutation<
      void,
      { courseId: string; order: ReorderItem[] }
    >({
      query: ({ courseId, order }) => ({
        url: `/courses/${courseId}/lessons/reorder`,
        method: "PATCH",
        data: { order },
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Lesson", id: `COURSE_${courseId}` },
      ],
    }),
  }),
});

export const {
  useGetLessonsQuery,
  useGetLessonQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useReorderLessonsMutation,
} = lessonsApi;
