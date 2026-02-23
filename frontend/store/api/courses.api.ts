import type { PaginatedResponse } from "@/types/api.types";
import type { Course, CourseFilters, CourseStatus } from "@/types/course.types";
import type { Enrollment } from "@/types/enrollment.types";
import { apiSlice } from "./base";

interface CreateCourseBody {
  title: string;
  description?: string;
  categoryId: string;
  price: number;
  isFree: boolean;
}

interface UpdateCourseBody {
  title?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  isFree?: boolean;
}

interface GetCourseStudentsParams {
  courseId: string;
  cursor?: string;
  limit?: number;
}

export const coursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<PaginatedResponse<Course>, CourseFilters | void>({
      query: (params) => ({
        url: "/courses",
        method: "GET",
        params: params ?? undefined,
        rawResult: true,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Course" as const,
                id,
              })),
              { type: "Course", id: "LIST" },
            ]
          : [{ type: "Course", id: "LIST" }],
    }),

    getCourse: builder.query<Course, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Course", id }],
    }),

    getCourseBySlug: builder.query<Course, string>({
      query: (slug) => ({
        url: `/courses/slug/${slug}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result ? [{ type: "Course", id: result.id }] : [],
    }),

    createCourse: builder.mutation<Course, FormData | CreateCourseBody>({
      query: (body) => ({
        url: "/courses",
        method: "POST",
        data: body,
        headers:
          body instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    updateCourse: builder.mutation<
      Course,
      { id: string; body: FormData | UpdateCourseBody }
    >({
      query: ({ id, body }) => ({
        url: `/courses/${id}`,
        method: "PATCH",
        data: body,
        headers:
          body instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),

    deleteCourse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),

    updateCourseStatus: builder.mutation<
      Course,
      { id: string; status: CourseStatus }
    >({
      query: ({ id, status }) => ({
        url: `/courses/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),

    uploadThumbnail: builder.mutation<
      { thumbnailUrl: string },
      { courseId: string; file: FormData }
    >({
      query: ({ courseId, file }) => ({
        url: `/courses/${courseId}/thumbnail`,
        method: "POST",
        data: file,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    getCourseStudents: builder.query<
      PaginatedResponse<Enrollment>,
      GetCourseStudentsParams
    >({
      query: ({ courseId, ...params }) => ({
        url: `/courses/${courseId}/students`,
        method: "GET",
        params,
        rawResult: true,
      }),
      providesTags: (_result, _error, { courseId }) => [
        { type: "Enrollment", id: `COURSE_${courseId}` },
      ],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetCourseBySlugQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useUpdateCourseStatusMutation,
  useUploadThumbnailMutation,
  useGetCourseStudentsQuery,
} = coursesApi;
