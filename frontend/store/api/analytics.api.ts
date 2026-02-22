import type {
  CompletionRate,
  EnrollmentGrowthItem,
  InstructorOverview,
  OverviewStats,
  PopularCourse,
  RevenueItem,
} from "@/types/analytics.types";
import { apiSlice } from "./base";

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<OverviewStats, void>({
      query: () => ({
        url: "/analytics/overview",
        method: "GET",
      }),
      providesTags: [{ type: "Analytics", id: "OVERVIEW" }],
    }),

    getEnrollmentGrowth: builder.query<EnrollmentGrowthItem[], number | void>({
      query: (days) => ({
        url: "/analytics/enrollment-growth",
        method: "GET",
        params: days ? { days } : undefined,
      }),
      providesTags: [{ type: "Analytics", id: "ENROLLMENT_GROWTH" }],
    }),

    getTopCourses: builder.query<PopularCourse[], void>({
      query: () => ({
        url: "/analytics/top-courses",
        method: "GET",
      }),
      providesTags: [{ type: "Analytics", id: "TOP_COURSES" }],
    }),

    getRevenue: builder.query<RevenueItem[], void>({
      query: () => ({
        url: "/analytics/revenue",
        method: "GET",
      }),
      providesTags: [{ type: "Analytics", id: "REVENUE" }],
    }),

    getCompletionRates: builder.query<CompletionRate[], void>({
      query: () => ({
        url: "/analytics/completion-rates",
        method: "GET",
      }),
      providesTags: [{ type: "Analytics", id: "COMPLETION_RATES" }],
    }),

    getInstructorOverview: builder.query<InstructorOverview, void>({
      query: () => ({
        url: "/analytics/instructor/overview",
        method: "GET",
      }),
      providesTags: [{ type: "Analytics", id: "INSTRUCTOR_OVERVIEW" }],
    }),

    getInstructorRevenue: builder.query<RevenueItem[], void>({
      query: () => ({
        url: "/analytics/instructor/revenue",
        method: "GET",
      }),
      providesTags: [{ type: "Analytics", id: "INSTRUCTOR_REVENUE" }],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetEnrollmentGrowthQuery,
  useGetTopCoursesQuery,
  useGetRevenueQuery,
  useGetCompletionRatesQuery,
  useGetInstructorOverviewQuery,
  useGetInstructorRevenueQuery,
} = analyticsApi;
