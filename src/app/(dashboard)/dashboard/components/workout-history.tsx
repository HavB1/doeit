"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function WorkoutHistory() {
  const trpc = useTRPC();
  const router = useRouter();

  const { data: workouts, isLoading } = useQuery(
    trpc.workout.getRecentWorkouts.queryOptions()
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!workouts?.length) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Dumbbell className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No workouts logged yet</p>
        <Button onClick={() => router.push("/workouts")}>
          Log Your First Workout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center space-x-4">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{workout.type}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(workout.date), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/workouts/${workout.id}`)}
          >
            View Details
          </Button>
        </div>
      ))}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => router.push("/workouts")}>
          View All Workouts
        </Button>
      </div>
    </div>
  );
}
