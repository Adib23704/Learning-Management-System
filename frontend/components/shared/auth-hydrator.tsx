"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import { useRefreshMutation } from "@/store/api/auth.api";
import { clearCredentials, setCredentials } from "@/store/slices/auth.slice";

/**
 * Silently restores auth state on hard page loads for public pages.
 * Attempts a token refresh; sets credentials on success, clears on failure.
 * Does NOT redirect - public pages are accessible either way.
 */
export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isHydrating } = useAppSelector(
    (state) => state.auth,
  );
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    if (!isAuthenticated && isHydrating) {
      refresh()
        .unwrap()
        .then((data) => dispatch(setCredentials(data)))
        .catch(() => dispatch(clearCredentials()));
    }
  }, [isAuthenticated, isHydrating, refresh, dispatch]);

  return <>{children}</>;
}
