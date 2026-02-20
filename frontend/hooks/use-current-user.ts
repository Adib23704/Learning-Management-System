import { useAppSelector } from "./use-app-dispatch";

export function useCurrentUser() {
  const { user, isAuthenticated, isHydrating } = useAppSelector(
    (state) => state.auth,
  );
  return { user, isAuthenticated, isHydrating };
}
