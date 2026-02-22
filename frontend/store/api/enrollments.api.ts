import type {
  Enrollment,
  EnrollmentStatus,
  LessonProgress,
} from "@/types/enrollment.types";
import { apiSlice } from "./base";

interface GetMyEnrollmentsParams {
  status?: EnrollmentStatus;
  limit?: number;
  cursor?: string;
}

interface EnrollmentProgressResponse {
  enrollment: {
    id: string;
    progress: number;
    status: EnrollmentStatus;
  };
  lessons: LessonProgress[];
}

export const enrollmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyEnrollments: builder.query<
      Enrollment[],
      GetMyEnrollmentsParams | undefined
    >({
      query: (params) => ({
        url: "/enrollments/me",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Enrollment" as const,
                id,
              })),
              { type: "Enrollment", id: "MY_LIST" },
            ]
          : [{ type: "Enrollment", id: "MY_LIST" }],
    }),

    getEnrollmentDetail: builder.query<Enrollment, string>({
      query: (courseId) => ({
        url: `/enrollments/me/courses/${courseId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, courseId) => [
        { type: "Enrollment", id: `DETAIL_${courseId}` },
      ],
    }),

    enroll: builder.mutation<Enrollment, string>({
      query: (courseId) => ({
        url: `/enrollments/courses/${courseId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Enrollment", id: "MY_LIST" }],
    }),

    dropEnrollment: builder.mutation<Enrollment, string>({
      query: (courseId) => ({
        url: `/enrollments/courses/${courseId}/drop`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Enrollment", id: "MY_LIST" }],
    }),

    markLessonComplete: builder.mutation<
      Enrollment,
      { courseId: string; lessonId: string }
    >({
      query: ({ courseId, lessonId }) => ({
        url: `/enrollments/courses/${courseId}/lessons/${lessonId}/complete`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Enrollment", id: `DETAIL_${courseId}` },
        { type: "Enrollment", id: `PROGRESS_${courseId}` },
        { type: "Enrollment", id: "MY_LIST" },
      ],
    }),

    getEnrollmentProgress: builder.query<EnrollmentProgressResponse, string>({
      query: (courseId) => ({
        url: `/enrollments/courses/${courseId}/progress`,
        method: "GET",
      }),
      providesTags: (_result, _error, courseId) => [
        { type: "Enrollment", id: `PROGRESS_${courseId}` },
      ],
    }),
  }),
});

export const {
  useGetMyEnrollmentsQuery,
  useGetEnrollmentDetailQuery,
  useEnrollMutation,
  useDropEnrollmentMutation,
  useMarkLessonCompleteMutation,
  useGetEnrollmentProgressQuery,
} = enrollmentsApi;
