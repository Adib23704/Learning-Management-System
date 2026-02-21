"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

export default function SuperAdminDashboard() {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-800">
        Platform Overview
      </h1>
      <p className="mt-1 text-neutral-500">
        Welcome, {user?.firstName}. Full platform control at your fingertips.
      </p>
    </div>
  );
}
