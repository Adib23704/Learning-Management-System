"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

export default function AdminDashboard() {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-800">
        Admin Dashboard
      </h1>
      <p className="mt-1 text-neutral-500">
        Welcome, {user?.firstName}. Manage the platform from here.
      </p>
    </div>
  );
}
