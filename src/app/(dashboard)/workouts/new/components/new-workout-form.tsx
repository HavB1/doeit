"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type DayDetails = RouterOutput["workoutPlans"]["getPlanDayDetails"];
type Exercise = DayDetails["exercises"][number];

export function NewWorkoutForm() {
  const trpc = useTRPC();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [notes, setNotes] = useState("");

  const { data: plans } = useQuery(trpc.workout.getWorkoutPlans.queryOptions());

  const { data: days } = selectedPlan
    ? useQuery(
        trpc.workout.getWorkoutDays.queryOptions({ planId: selectedPlan })
      )
    : { data: undefined };

  const { data: dayDetails } = selectedDay
    ? useQuery(
        trpc.workoutPlans.getPlanDayDetails.queryOptions({ dayId: selectedDay })
      )
    : { data: undefined };

  const createWorkoutMutation = useMutation(
    trpc.workout.createWorkout.mutationOptions({
      onSuccess: () => {
        toast.success("Workout created successfully");
        router.push("/workouts");
      },
      onError: (error) => {
        toast.error("Failed to create workout");
        console.error(error);
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !selectedDay) return;

    createWorkoutMutation.mutate({
      planId: selectedPlan,
      dayId: selectedDay,
      notes: notes || undefined,
      exerciseLogs:
        dayDetails?.exercises.map((exercise: Exercise) => ({
          exerciseId: exercise.id,
          sets: exercise.sets,
          reps: exercise.reps,
        })) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="plan">Workout Plan</Label>
        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
          <SelectTrigger>
            <SelectValue placeholder="Select a workout plan" />
          </SelectTrigger>
          <SelectContent>
            {plans?.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="day">Workout Day</Label>
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger>
            <SelectValue placeholder="Select a workout day" />
          </SelectTrigger>
          <SelectContent>
            {days?.map((day) => (
              <SelectItem key={day.id} value={day.id}>
                Day {day.dayNumber} - {day.focus}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about your workout..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={
          createWorkoutMutation.isPending || !selectedPlan || !selectedDay
        }
      >
        {createWorkoutMutation.isPending ? "Creating..." : "Create Workout"}
      </Button>
    </form>
  );
}
