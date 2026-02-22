import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero skeleton */}
      <div className="bg-neutral-900 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mx-auto mb-4 h-12 w-2/3 bg-neutral-700" />
          <Skeleton className="mx-auto mb-8 h-6 w-1/2 bg-neutral-700" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-11 w-32 rounded-md bg-neutral-700" />
            <Skeleton className="h-11 w-32 rounded-md bg-neutral-700" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
