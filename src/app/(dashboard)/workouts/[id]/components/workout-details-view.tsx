"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { WorkoutDetailsSkeleton } from "./workout-details-skeleton";

export function WorkoutDetailsView({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: workout, isLoading } = useQuery(
    trpc.workout.getWorkoutDetails.queryOptions({ workoutId })
  );

  if (isLoading) {
    return <WorkoutDetailsSkeleton />;
  }

  if (!workout) {
    return <div>Workout not found</div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Workout Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{workout.notes || "Untitled Workout"}</CardTitle>
            <Badge variant="outline">
              {new Date(workout.completedAt).toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Exercises</h3>
            {workout.exerciseLogs?.map((log) => (
              <div
                key={log.exerciseId}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {log.exercise?.name || "Unknown Exercise"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {log.sets} sets × {log.reps} reps
                    {log.weight ? ` @ ${log.weight}kg` : ""}
                  </p>
                </div>
                {log.notes && (
                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
