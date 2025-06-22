"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type WorkoutHistoryOutput = RouterOutput["workout"]["getRecentWorkouts"];

export function WorkoutHistory() {
  const trpc = useTRPC();
  const router = useRouter();

  const { data: workouts, isLoading } = useSuspenseQuery(
    trpc.workout.getRecentWorkouts.queryOptions()
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <CardContent className="flex items-center justify-between p-0">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!workouts?.length) {
    return (
      <Card className="p-6">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
          <Dumbbell className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            No workouts logged yet
          </p>
          <Button
            onClick={() => router.push("/workouts")}
            className="rounded-full"
          >
            Log Your First Workout
          </Button>
        </CardContent>
      </Card>
    );
  }

  const recentWorkoutsToDisplay = workouts.slice(0, 3);

  return (
    <div className="space-y-4">
      {recentWorkoutsToDisplay.map((workout) => {
        const workoutTitle = workout.notes || "Logged Workout";
        const exerciseCount = workout.exerciseLogs?.length || 0;

        return (
          <Card
            key={workout.id}
            className="p-4 transition-all hover:shadow-md active:scale-[0.98]"
            onClick={() => router.push(`/workouts/${workout.id}`)}
          >
            <CardContent className="flex flex-col items-center justify-between gap-4 p-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p
                    className="font-medium truncate max-w-[200px]"
                    title={workoutTitle}
                  >
                    {workoutTitle}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(workout.completedAt), "MMM d, yyyy")}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {exerciseCount}{" "}
                      {exerciseCount === 1 ? "exercise" : "exercises"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/workouts/${workout.id}`);
                }}
              >
                View <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
      {workouts.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => router.push("/workouts")}
            className="rounded-full"
          >
            View All Workouts
          </Button>
        </div>
      )}
    </div>
  );
}
