import { Skeleton } from "@/components/ui/skeleton";

export function WorkoutsSkeleton() {
  return (
    <div className="container py-6 px-4 md:px-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-7 w-24 sm:h-8 sm:w-32" />
          <Skeleton className="h-4 w-48 sm:w-56 mt-2" />
        </div>
        <Skeleton className="h-10 w-full sm:w-36" />
      </div>

      {/* List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center space-x-4">
              <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
              <div className="space-y-1 overflow-hidden">
                <Skeleton className="h-5 w-32 sm:w-48" />
                <Skeleton className="h-4 w-24 sm:w-32" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 flex-shrink-0 ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
