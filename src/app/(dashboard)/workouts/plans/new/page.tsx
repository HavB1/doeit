import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { CreatePlanView } from "./components/create-plan-view";

export const dynamic = "force-dynamic";

export default function CreatePlanPage() {
  prefetch(trpc.workoutPlans.getPresetExercises.queryOptions());

  return (
    <HydrateClient>
      <div className="container py-6 px-4 md:px-6">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Create Custom Workout Plan
          </h1>
          <p className="text-muted-foreground">
            Build your own workout plan by selecting exercises and customizing
            sets and reps
          </p>
        </div>
        <HydrateClient>
          {/* <Suspense fallback={<div>Loading...</div>}> */}
          <CreatePlanView />
          {/* </Suspense> */}
        </HydrateClient>
      </div>
    </HydrateClient>
  );
}
