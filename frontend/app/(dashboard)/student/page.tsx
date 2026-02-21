"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

export default function StudentDashboard() {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-800">
        Welcome back, {user?.firstName}
      </h1>
      <p className="mt-1 text-neutral-500">
        Here&apos;s an overview of your learning progress.
      </p>
    </div>
  );
}
