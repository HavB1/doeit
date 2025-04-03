import { HydrateClient, trpc } from "@/trpc/server";
import { prefetch } from "@/trpc/server";
import { Suspense } from "react";
import { PlansView } from "./plans-view";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

function PlansSkeleton() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="mt-6">
        <div className="flex space-x-2">
          {["Lose Weight", "Gain Muscle", "Maintain"].map((tab) => (
            <Skeleton key={tab} className="h-10 w-24" />
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((plan) => (
            <div key={plan} className="rounded-lg border p-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function WorkoutPlansPage() {
  // Prefetch data for all goal types
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
      <Suspense fallback={<PlansSkeleton />}>
        <PlansView />
      </Suspense>
    </HydrateClient>
  );
}
