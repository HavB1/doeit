"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Dumbbell,
  Trash2,
  Target,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

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

  const getGoalTypeColor = (goalType: string) => {
    switch (goalType?.toLowerCase()) {
      case "strength":
        return "bg-red-100 text-red-700 border-red-200";
      case "hypertrophy":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "endurance":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "weight loss":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          {workout.description && (
            <p className="text-muted-foreground mt-1">{workout.description}</p>
          )}
        </div>
      </div>

      {/* Plan Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal Type</p>
                <p className="font-semibold capitalize">
                  {workout.goalType || "General"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Days</p>
                <p className="font-semibold">{workout.days.length} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-semibold">{completedDays} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Plan Progress
            </CardTitle>
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
            <Progress value={progress} className="h-3" />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Workout Days</h3>
            <div className="space-y-3">
              {workout.days.map((day) => {
                const isCompleted = recentWorkouts?.some(
                  (recentWorkout) =>
                    recentWorkout.planId === workout.id &&
                    recentWorkout.dayId === day.id
                );

                const totalExercises = day.exercises.length;
                const exerciseCategories = [
                  ...new Set(
                    day.exercises
                      .map((e) => e.exercise?.category)
                      .filter(Boolean)
                  ),
                ];

                return (
                  <Card
                    key={day.id}
                    className={`transition-all duration-200 ${
                      isCompleted
                        ? "border-green-200 bg-green-50/50"
                        : "border-gray-200"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isCompleted ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            <Dumbbell
                              className={`h-4 w-4 ${
                                isCompleted ? "text-green-600" : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              Day {day.dayNumber}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {totalExercises} exercises
                              {exerciseCategories.length > 0 &&
                                ` • ${exerciseCategories.join(", ")}`}
                            </p>
                          </div>
                        </div>
                        {isCompleted ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>

                      {/* Exercise Preview */}
                      {day.exercises.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Exercises Preview
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {day.exercises.slice(0, 4).map((exercise) => (
                              <Badge
                                key={exercise.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {exercise.exercise?.name || "Unknown Exercise"}
                              </Badge>
                            ))}
                            {day.exercises.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{day.exercises.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

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
