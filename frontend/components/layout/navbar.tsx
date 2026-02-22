"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useLogoutMutation } from "@/store/api/auth.api";
import { clearCredentials } from "@/store/slices/auth.slice";

const NAV_LINKS = [{ label: "Courses", href: "/courses" }] as const;

export function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useCurrentUser();
  const [logout] = useLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // logout client-side even if server call fails
    }
    dispatch(clearCredentials());
    toast.success("Logged out");
    router.push("/login");
  };

  const dashboardHref = user ? (ROLE_DASHBOARD[user.role] ?? "/") : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold text-neutral-900 tracking-tight"
        >
          LMS
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-800"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-800"
              >
                Dashboard
              </Link>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-xs font-medium text-accent-700">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-neutral-500 hover:text-neutral-700 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100",
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
