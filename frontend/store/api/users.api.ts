import type { UserRole } from "@/lib/constants/roles";
import type { PaginatedResponse } from "@/types/api.types";
import type { User } from "@/types/user.types";
import { apiSlice } from "./base";

interface GetUsersParams {
  cursor?: string;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CreateUserBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      PaginatedResponse<User>,
      GetUsersParams | undefined
    >({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params: params ?? undefined,
        rawResult: true,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "User" as const,
                id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUser: builder.query<User, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<User, CreateUserBody>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<User, { id: string } & UpdateUserBody>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    suspendUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/users/${id}/suspend`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    activateUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
} = usersApi;
