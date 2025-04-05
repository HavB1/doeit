import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { CreatePlanView } from "./components/create-plan-view";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

const CreatePlanSkeleton = () => {
  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-10 w-10" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
};
export default function CreatePlanPage() {
  prefetch(trpc.workoutPlans.getPresetExercises.queryOptions());

  return (
    <HydrateClient>
      <div className="container py-6 px-4 md:px-6">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Create Workout Plan
              </h1>
              <p className="text-muted-foreground mt-2">
                Design your perfect workout routine by selecting exercises and
                customizing sets and reps.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Or clone a preset one?</span>
            <Button variant="link" className="p-0 h-auto font-medium" asChild>
              <Link href="/workouts/plans">Browse templates</Link>
            </Button>
          </div>
        </div>
        <HydrateClient>
          <Suspense fallback={<CreatePlanSkeleton />}>
            <CreatePlanView />
          </Suspense>
        </HydrateClient>
      </div>
    </HydrateClient>
  );
}
