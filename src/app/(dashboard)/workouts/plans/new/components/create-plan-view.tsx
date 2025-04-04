"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
};

export function CreatePlanView() {
  const router = useRouter();
  const trpc = useTRPC();
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [goalType, setGoalType] = useState<
    "lose_weight" | "gain_muscle" | "maintain"
  >("maintain");
  const [focus, setFocus] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [customSets, setCustomSets] = useState<Record<string, number>>({});
  const [customReps, setCustomReps] = useState<Record<string, string>>({});

  // Fetch preset exercises
  const { data: presetExercises = [], isLoading } = useQuery(
    trpc.workoutPlans.getPresetExercises.queryOptions()
  );

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      if (prev.some((e) => e.id === exercise.id)) {
        return prev.filter((e) => e.id !== exercise.id);
      }
      return [...prev, exercise];
    });
  };

  const createPlanMutation = useMutation({
    ...trpc.workoutPlans.createPlan.mutationOptions(),
    onSuccess: (plan) => {
      router.push(`/workouts/plans/${plan.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create plan");
      console.error("Failed to create plan:", error);
    },
  });

  const handleCreatePlan = async () => {
    createPlanMutation.mutate({
      name: planName,
      description: planDescription,
      goalType,
      focus,
      exercises: selectedExercises.map((exercise) => ({
        ...exercise,
        sets: customSets[exercise.id] || exercise.sets,
        reps: customReps[exercise.id] || exercise.reps,
      })),
    });
  };

  if (isLoading) {
    return <div>Loading exercises...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="planName">Plan Name</Label>
          <Input
            id="planName"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter plan name"
          />
        </div>
        <div>
          <Label htmlFor="planDescription">Description</Label>
          <Textarea
            id="planDescription"
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            placeholder="Enter plan description"
          />
        </div>
        <div>
          <Label htmlFor="goalType">Goal Type</Label>
          <Select
            value={goalType}
            onValueChange={(
              value: "lose_weight" | "gain_muscle" | "maintain"
            ) => setGoalType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select goal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose_weight">Lose Weight</SelectItem>
              <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
              <SelectItem value="maintain">Maintain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="focus">Focus</Label>
          <Input
            id="focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Enter workout focus (e.g., Upper Body, Cardio)"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {presetExercises.map((exercise) => (
            <div key={exercise.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={exercise.id}
                  checked={selectedExercises.some((e) => e.id === exercise.id)}
                  onCheckedChange={() => handleExerciseSelect(exercise)}
                />
                <Label htmlFor={exercise.id}>{exercise.name}</Label>
              </div>
              {selectedExercises.some((e) => e.id === exercise.id) && (
                <div className="flex gap-4 ml-6">
                  <div>
                    <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
                    <Input
                      id={`sets-${exercise.id}`}
                      type="number"
                      value={customSets[exercise.id] || exercise.sets}
                      onChange={(e) =>
                        setCustomSets((prev) => ({
                          ...prev,
                          [exercise.id]: parseInt(e.target.value),
                        }))
                      }
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                    <Input
                      id={`reps-${exercise.id}`}
                      value={customReps[exercise.id] || exercise.reps}
                      onChange={(e) =>
                        setCustomReps((prev) => ({
                          ...prev,
                          [exercise.id]: e.target.value,
                        }))
                      }
                      placeholder="e.g., 12 or 30 sec"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleCreatePlan}
          disabled={!planName || !focus || selectedExercises.length === 0}
        >
          Create Plan
        </Button>
      </div>
    </div>
  );
}
