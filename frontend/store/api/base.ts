import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/api/axios-base-query";
import type { RootState } from "../index";
import { clearCredentials, setCredentials } from "../slices/auth.slice";

const baseQuery = axiosBaseQuery();

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error &&
    typeof result.error === "object" &&
    "status" in result.error &&
    result.error.status === 401
  ) {
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as {
        user: NonNullable<RootState["auth"]["user"]>;
        accessToken: string;
      };
      api.dispatch(setCredentials(data));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Course",
    "Lesson",
    "User",
    "Enrollment",
    "Category",
    "Analytics",
    "Notification",
    "Progress",
  ],
  endpoints: () => ({}),
});
