"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/user.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrating: true,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isHydrating = false;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isHydrating = false;
    },
    setHydrating: (state, action: PayloadAction<boolean>) => {
      state.isHydrating = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setHydrating } =
  authSlice.actions;
