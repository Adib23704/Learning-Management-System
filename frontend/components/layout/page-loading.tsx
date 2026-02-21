"use client";

import { Spinner } from "@/components/ui/spinner";

export function PageLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Spinner size="lg" className="text-accent-600" />
    </div>
  );
}
