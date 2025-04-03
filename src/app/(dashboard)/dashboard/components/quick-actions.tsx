"use client";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Scale, Dumbbell, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppRouter } from "@/trpc/routers/_app";
import type { TRPCClientErrorLike } from "@trpc/client";

export function QuickActions() {
  const trpc = useTRPC();
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");

  const { data: todayWorkout, isLoading: isLoadingWorkout } = useQuery(
    trpc.workout.getTodayWorkout.queryOptions()
  );

  const logWeightMutation = useMutation(
    trpc.weight.logWeight.mutationOptions({
      onSuccess: () => {
        toast.success("Weight logged successfully");
        setIsWeightDialogOpen(false);
        setWeight("");
        setSelectedExercise("");
      },
      onError: (error) => {
        toast.error("Failed to log weight: " + error.message);
        console.error(error);
      },
    })
  );

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !selectedExercise || !todayWorkout) return;

    logWeightMutation.mutate({
      weight: parseFloat(weight),
      exerciseId: selectedExercise,
      workoutId: todayWorkout.id,
    });
  };

  const handleLogWeightClick = () => {
    if (!todayWorkout && !isLoadingWorkout) {
      toast.info("Please start or select today's workout first.", {
        action: {
          label: "Go to Workouts",
          onClick: () => router.push("/workouts"),
        },
      });
      return;
    }
    if (todayWorkout) {
      setIsWeightDialogOpen(true);
    }
  };

  return (
    <div className="grid gap-4">
      {/* Log Weight (reverted name and added handler) */}
      <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogWeightClick}
            disabled={isLoadingWorkout}
          >
            <Scale className="mr-2 h-4 w-4" />
            Log Weight
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Your Weight for Exercise</DialogTitle>
            <DialogDescription>
              Select the exercise and enter your weight.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogWeight} className=" flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise</Label>
              <Select
                value={selectedExercise}
                onValueChange={setSelectedExercise}
                required
              >
                <SelectTrigger disabled={!todayWorkout?.exercises.length}>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {todayWorkout?.exercises.map((exercise: any) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!todayWorkout?.exercises.length && (
                <p className="text-xs text-muted-foreground">
                  No exercises found for today's workout.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your weight"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                logWeightMutation.isPending || !weight || !selectedExercise
              }
            >
              {logWeightMutation.isPending ? "Logging..." : "Log Weight"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Workout */}
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => router.push("/workouts/new")}
      >
        <Dumbbell className="mr-2 h-4 w-4" />
        Log Workout
      </Button>

      {/* View Progress */}
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => router.push("/progress")}
      >
        <Plus className="mr-2 h-4 w-4" />
        View Progress
      </Button>
    </div>
  );
}
