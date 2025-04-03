"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
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
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QuickActions() {
  const trpc = useTRPC();
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");

  const { data: profile } = useQuery(
    trpc.userProfile.getProfile.queryOptions()
  );

  const { data: todayWorkout } = useQuery(
    trpc.workout.getTodayWorkout.queryOptions()
  );

  const logWeightMutation = useMutation(
    trpc.weight.logWeight.mutationOptions({
      onSuccess: () => {
        toast.success("Weight logged successfully");
        setIsOpen(false);
        setWeight("");
        setSelectedExercise("");
      },
      onError: (error) => {
        toast.error("Failed to log weight");
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
    if (!todayWorkout) {
      toast.error("Please start a workout first");
      router.push("/workouts/new");
      return;
    }
    setIsOpen(true);
  };

  return (
    <div className="grid gap-4">
      {/* Log Weight */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogWeightClick}
          >
            <Scale className="mr-2 h-4 w-4" />
            Log Weight
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Your Weight</DialogTitle>
            <DialogDescription>
              Log your weight for today's workout.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogWeight} className=" flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise</Label>
              <Select
                value={selectedExercise}
                onValueChange={setSelectedExercise}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {todayWorkout?.exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                logWeightMutation.isPending || !selectedExercise || !weight
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
