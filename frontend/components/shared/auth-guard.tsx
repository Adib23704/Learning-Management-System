"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import { useRefreshMutation } from "@/store/api/auth.api";
import { clearCredentials, setCredentials } from "@/store/slices/auth.slice";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
        .catch(() => {
          dispatch(clearCredentials());
          router.push("/login");
        });
    }
  }, [isAuthenticated, isHydrating, refresh, dispatch, router]);

  if (isHydrating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-accent-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
