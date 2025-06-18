import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { WorkoutPlanDetailsView } from "./components/workout-plan-details-view";

export const dynamic = "force-dynamic";

export default async function WorkoutPlanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return <div>No id found!</div>;
  }

  prefetch(trpc.workout.getWorkout.queryOptions({ workoutId: id }));

  return (
    <HydrateClient>
      <WorkoutPlanDetailsView workoutId={id} />
    </HydrateClient>
  );
}
