"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WorkoutDetailsSkeleton() {
  return (
    <div className="container py-4 px-4 max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
            >
              <Skeleton className="h-4 w-4 rounded" />
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Info Skeleton */}
      <Card className="mb-4">
        <CardHeader className="pb-3 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        </CardHeader>
      </Card>

      {/* Exercises Section Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex gap-3 mb-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
