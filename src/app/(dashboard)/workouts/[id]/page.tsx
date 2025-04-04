import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { WorkoutDetailsView } from "./components/workout-details-view";

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
      <WorkoutDetailsView workoutId={id} />
    </HydrateClient>
  );
}
