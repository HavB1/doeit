"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  Clock,
  Repeat,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { WorkoutDetailsSkeleton } from "./workout-details-skeleton";

export function WorkoutDetailsView({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: workout, isLoading } = useSuspenseQuery(
    trpc.workout.getWorkoutDetails.queryOptions({ workoutId })
  );

  if (isLoading) {
    return <WorkoutDetailsSkeleton />;
  }

  if (!workout) {
    return (
      <div className="container py-4 px-4">
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold mb-2">Workout not found</h2>
          <p className="text-muted-foreground text-sm">
            The workout you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Workout Details</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(workout.completedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Workout Summary Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Dumbbell className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Exercises</p>
              <p className="font-semibold text-sm">
                {workout.exerciseLogs?.length || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="font-semibold text-sm">
                {new Date(workout.completedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Plan Info */}
      <Card className="mb-4">
        <CardHeader className="pb-3 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {workout.plan?.name || "Workout Plan"}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">
                  Day {workout.day?.dayNumber || "Unknown"}
                </p>
                {workout.focus && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                      {workout.focus.name}
                    </p>
                  </>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {workout.plan?.isCustom ? "Custom Plan" : "Preset Plan"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Exercises Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold">Exercises Completed</h2>
          <Badge variant="secondary" className="text-xs">
            {workout.exerciseLogs?.length || 0} exercises
          </Badge>
        </div>

        {workout.exerciseLogs && workout.exerciseLogs.length > 0 ? (
          <div className="space-y-3">
            {workout.exerciseLogs.map((log, index) => (
              <Card key={log.exerciseId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-2">
                        {log.exercise?.name || "Unknown Exercise"}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          <span>{log.sets} sets</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{log.reps} reps</span>
                        </div>
                        {log.weight && (
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            <span>{log.weight}kg</span>
                          </div>
                        )}
                      </div>
                      {log.notes && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          <p className="font-medium mb-1">Notes:</p>
                          <p>{log.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Dumbbell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No exercises logged</p>
          </div>
        )}
      </div>

      {/* Workout Notes */}
      {workout.notes && (
        <Card className="mt-4">
          <CardHeader className="pb-3 px-4 py-3">
            <CardTitle className="text-base">Workout Notes</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {workout.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
