"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { useQuery, useMutation } from "@tanstack/react-query";

type RouterOutput = inferRouterOutputs<AppRouter>;
type DayDetails = RouterOutput["workoutPlans"]["getPlanDayDetails"];
type Exercise = DayDetails["exercises"][number];

interface ExerciseLogState {
  [exerciseId: string]: {
    completed: boolean;
    sets?: number;
    reps?: string;
    weight?: number;
    notes?: string;
  };
}

interface SessionViewProps {
  planId: string;
  dayId: string;
}

export function SessionView({ planId, dayId }: SessionViewProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogState>({});

  const { data: dayDetails, isLoading } = useQuery(
    trpc.workoutPlans.getPlanDayDetails.queryOptions({ dayId })
  );

  useEffect(() => {
    if (dayDetails) {
      const initialLogs: ExerciseLogState = {};
      dayDetails.exercises.forEach((exercise) => {
        initialLogs[exercise.id] = {
          completed: false,
          sets: exercise.sets,
          reps: exercise.reps,
        };
      });
      setExerciseLogs(initialLogs);
    }
  }, [dayDetails]);

  const logWorkoutMutation = useMutation(
    trpc.workout.createWorkout.mutationOptions({
      onSuccess: () => {
        toast.success("Workout completed!", {
          description: "Your workout has been logged successfully.",
        });
        router.push("/workouts");
      },
      onError: () => {
        toast.error("Error", {
          description: "Failed to log workout. Please try again.",
        });
      },
    })
  );

  const handleExerciseToggle = (exerciseId: string) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completed: !prev[exerciseId]?.completed,
      },
    }));
  };

  const handleExerciseUpdate = (
    exerciseId: string,
    field: "sets" | "reps" | "weight" | "notes",
    value: string | number
  ) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
      },
    }));
  };

  const handleFinishWorkout = () => {
    const completedExercises = Object.entries(exerciseLogs)
      .filter(([_, log]) => log.completed)
      .map(([exerciseId, log]) => ({
        exerciseId,
        sets: log.sets || 0,
        reps: log.reps || "",
        weight: log.weight,
        notes: log.notes,
      }));

    if (completedExercises.length === 0) {
      toast.error("No exercises completed", {
        description: "Please complete at least one exercise before finishing.",
      });
      return;
    }

    logWorkoutMutation.mutate({
      planId,
      dayId,
      exerciseLogs: completedExercises,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!dayDetails) {
    return <div>No workout day found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{dayDetails.focus}</h1>
        <Button
          onClick={handleFinishWorkout}
          disabled={logWorkoutMutation.isPending}
        >
          {logWorkoutMutation.isPending ? "Saving..." : "Finish Workout"}
        </Button>
      </div>

      <div className="grid gap-4">
        {dayDetails.exercises.map((exercise: Exercise) => (
          <Card key={exercise.id} className="p-4">
            <div className="flex items-start space-x-4">
              <Checkbox
                checked={exerciseLogs[exercise.id]?.completed}
                onCheckedChange={() => handleExerciseToggle(exercise.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Target: {exercise.sets} sets × {exercise.reps}
                  </p>
                </div>

                {exerciseLogs[exercise.id]?.completed && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
                      <Input
                        id={`sets-${exercise.id}`}
                        type="number"
                        value={exerciseLogs[exercise.id]?.sets || ""}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            exercise.id,
                            "sets",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                      <Input
                        id={`reps-${exercise.id}`}
                        value={exerciseLogs[exercise.id]?.reps || ""}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            exercise.id,
                            "reps",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`weight-${exercise.id}`}>
                        Weight (kg)
                      </Label>
                      <Input
                        id={`weight-${exercise.id}`}
                        type="number"
                        value={exerciseLogs[exercise.id]?.weight || ""}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            exercise.id,
                            "weight",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`notes-${exercise.id}`}>Notes</Label>
                      <Input
                        id={`notes-${exercise.id}`}
                        value={exerciseLogs[exercise.id]?.notes || ""}
                        onChange={(e) =>
                          handleExerciseUpdate(
                            exercise.id,
                            "notes",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
