"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full max-w-sm text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="mb-1 text-lg font-semibold text-neutral-900">
        Something went wrong
      </h2>
      <p className="mb-6 text-sm text-neutral-500">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex flex-col gap-2">
        <Button onClick={reset} className="w-full gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </div>
  );
}
