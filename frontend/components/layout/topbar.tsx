"use client";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NotificationBell } from "@/components/shared/notification-bell";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { useLogoutMutation } from "@/store/api/auth.api";
import { clearCredentials } from "@/store/slices/auth.slice";
import { toggleSidebar } from "@/store/slices/ui.slice";

export function Topbar() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // logout anyway even if server call fails
    }
    dispatch(clearCredentials());
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
      <button
        type="button"
        className="text-neutral-500 hover:text-neutral-700 lg:hidden"
        onClick={() => dispatch(toggleSidebar())}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <NotificationBell />

        {user && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-neutral-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-neutral-500">{ROLE_LABELS[user.role]}</p>
          </div>
        )}

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-sm font-medium text-accent-700">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
