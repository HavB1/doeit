import { HydrateClient, trpc } from "@/trpc/server";
import { prefetch } from "@/trpc/server";
// import { Suspense } from "react";
import { PlansView } from "./plans-view";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Suspense } from "react";

// export const dynamic = "force-dynamic";

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

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((plan) => (
            <Skeleton key={plan} className="h-[280px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkoutPlansPage() {
  // Prefetch data for all goal types
  prefetch(trpc.plans.getPresetPlans.queryOptions());

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Workout Plans
          </h1>
          <p className="text-muted-foreground">
            Choose a preset plan or create your own custom workout routine
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="/plans/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Plan
          </Link>
        </Button>
      </div>
      <HydrateClient>
        <Suspense fallback={<PlansSkeleton />}>
          <PlansView />
        </Suspense>
      </HydrateClient>
    </div>
  );
}
