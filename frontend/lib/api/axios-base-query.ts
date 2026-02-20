import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import type { RootState } from "@/store";
import { apiClient } from "./client";

interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
}

export function axiosBaseQuery(): BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  unknown
> {
  return async ({ url, method = "GET", data, params, headers }, api) => {
    try {
      const state = api.getState() as RootState;
      const token = state.auth.accessToken;

      const result = await apiClient({
        url,
        method,
        data,
        params,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      return { data: result.data.data ?? result.data };
    } catch (err) {
      const error = err as AxiosError;
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || error.message,
        },
      };
    }
  };
}
