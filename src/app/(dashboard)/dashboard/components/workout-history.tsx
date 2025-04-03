"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type WorkoutHistoryOutput = RouterOutput["workout"]["getRecentWorkouts"];

export function WorkoutHistory() {
  const trpc = useTRPC();
  const router = useRouter();

  const { data: workouts, isLoading } = useQuery(
    trpc.workout.getRecentWorkouts.queryOptions()
  );

  if (isLoading) {
    // Skeleton for loading state
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center space-x-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
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

  // Limit to latest 3 workouts for the dashboard view
  const recentWorkoutsToDisplay = workouts.slice(0, 3);

  return (
    <div className="space-y-4">
      {recentWorkoutsToDisplay.map((workout) => {
        const workoutTitle = workout.notes || "Logged Workout";
        return (
          <div
            key={workout.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center space-x-4">
              <Dumbbell className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="font-medium truncate" title={workoutTitle}>
                  {workoutTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(workout.completedAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/workouts/${workout.id}`)}
              className="flex-shrink-0 ml-2"
            >
              View Details
            </Button>
          </div>
        );
      })}
      {/* Show View All button only if there are workouts */}
      {workouts.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => router.push("/workouts")}>
            View All Workouts
          </Button>
        </div>
      )}
    </div>
  );
}
