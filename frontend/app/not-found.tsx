import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <FileQuestion className="h-8 w-8 text-neutral-400" />
        </div>
        <p className="mb-2 text-6xl font-bold text-neutral-200">404</p>
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
          Page not found
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
