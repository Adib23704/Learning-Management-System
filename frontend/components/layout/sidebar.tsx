"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import { useCurrentUser } from "@/hooks/use-current-user";
import { navConfig } from "@/lib/constants/nav-config";
import { cn } from "@/lib/utils/cn";
import { setSidebarOpen } from "@/store/slices/ui.slice";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  if (!user) return null;

  const items = navConfig[user.role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
          <Link href="/" className="text-lg font-bold text-neutral-900">
            LMS
          </Link>
          <button
            className="text-neutral-400 hover:text-neutral-600 lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${user.role.toLowerCase().replace("_", "-")}` &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => dispatch(setSidebarOpen(false))}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent-50 text-accent-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
