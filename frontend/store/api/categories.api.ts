import type { PaginatedResponse } from "@/types/api.types";
import type { Category } from "@/types/category.types";
import { apiSlice } from "./base";

interface CreateCategoryBody {
  name: string;
  description?: string;
}

interface UpdateCategoryBody {
  name?: string;
  description?: string;
}

interface GetCategoriesParams {
  cursor?: string;
  limit?: number;
}

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<
      PaginatedResponse<Category>,
      GetCategoriesParams | void
    >({
      query: (params) => ({
        url: "/categories",
        method: "GET",
        params: params ?? undefined,
        rawResult: true,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Category" as const,
                id,
              })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    getCategoryList: builder.query<Category[], void>({
      query: () => ({
        url: "/categories",
        method: "GET",
        params: { limit: 100 },
      }),
      providesTags: [{ type: "Category", id: "LIST" }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryBody>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: builder.mutation<
      Category,
      { id: string } & UpdateCategoryBody
    >({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryListQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
