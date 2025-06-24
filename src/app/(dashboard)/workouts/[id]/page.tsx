import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { WorkoutDetailsView } from "./components/workout-details-view";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function WorkoutDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return <div>No id found!</div>;
  }

  prefetch(
    trpc.workout.getWorkoutDetails.queryOptions({
      workoutId: id,
    })
  );

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <WorkoutDetailsView workoutId={id} />
      </Suspense>
    </HydrateClient>
  );
}
