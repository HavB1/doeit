"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export function WorkoutPlanDetailsView({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: workout,
    isLoading,
    error,
  } = useQuery(trpc.workout.getWorkout.queryOptions({ workoutId }));

  const { data: nextDay } = useQuery(
    trpc.workout.getNextIncompleteDay.queryOptions({ workoutId })
  );

  const { data: recentWorkouts } = useQuery(
    trpc.workout.getRecentWorkouts.queryOptions()
  );

  const deletePlanMutation = useMutation(
    trpc.workout.deleteWorkout.mutationOptions()
  );

  if (!workoutId || workoutId === "undefined" || workoutId === "null") {
    return <div>Invalid workout ID</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading workout plan: {error.message}</div>;
  }

  if (!workout) {
    return <div>Plan not found</div>;
  }

  const handleDelete = () => {
    deletePlanMutation.mutate(
      { workoutId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.workout.getMyWorkouts.queryKey(),
          });
          toast.success("Workout plan deleted successfully");
          router.push("/workouts");
        },
        onError: (error) => {
          toast.error("Failed to delete workout plan");
          console.error(error);
        },
      }
    );
  };

  const handleContinue = () => {
    if (!nextDay) {
      toast.error("No more days to complete");
      return;
    }
    router.push(`/workouts/session?workoutId=${workoutId}&dayId=${nextDay.id}`);
  };

  const completedDays = workout.days.filter((day) =>
    recentWorkouts?.some(
      (recentWorkout) =>
        recentWorkout.planId === workout.id && recentWorkout.dayId === day.id
    )
  ).length;
  const progress = (completedDays / workout.days.length) * 100;

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
        <h1 className="text-2xl font-bold">{workout.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan Progress</CardTitle>
            <Badge className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              {completedDays}/{workout.days.length} days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Workout Days</h3>
            {workout.days.map((day) => {
              const isCompleted = recentWorkouts?.some(
                (recentWorkout) =>
                  recentWorkout.planId === workout.id &&
                  recentWorkout.dayId === day.id
              );

              return (
                <div
                  key={day.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    <span>Day {day.dayNumber}</span>
                  </div>
                  {isCompleted ? (
                    <Badge variant="secondary">Completed</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Plan
            </Button>
            <Button
              className="flex-1"
              onClick={handleContinue}
              disabled={!nextDay}
            >
              Continue Workout
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Workout Plan</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete this workout plan? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletePlanMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePlanMutation.isPending}
              className="w-full sm:w-auto"
            >
              {deletePlanMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
