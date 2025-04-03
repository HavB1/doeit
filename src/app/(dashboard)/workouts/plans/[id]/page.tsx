import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlanView } from "./plan-view";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

function PlanSkeleton() {
  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
          <Skeleton className="h-4 w-56 sm:w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>

      <div className="space-y-6">
        {[1, 2].map((day) => (
          <div key={day} className="rounded-lg border">
            <div className="p-6">
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="border-t p-6 space-y-4">
              {[1, 2, 3].map((exercise) => (
                <div
                  key={exercise}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id: planId } = await params;

  prefetch(
    trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "lose_weight" })
  );
  prefetch(
    trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "gain_muscle" })
  );
  prefetch(
    trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "maintain" })
  );

  return (
    <HydrateClient>
      <Suspense fallback={<PlanSkeleton />}>
        <PlanView planId={planId} />
      </Suspense>
    </HydrateClient>
  );
}
