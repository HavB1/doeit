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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
};

type Day = {
  dayNumber: number;
  focus: string;
  exercises: Exercise[];
};

export function CreatePlanView() {
  const router = useRouter();
  const trpc = useTRPC();
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [goalType, setGoalType] = useState<
    "lose_weight" | "gain_muscle" | "maintain"
  >("maintain");
  const [days, setDays] = useState<Day[]>([
    { dayNumber: 1, focus: "", exercises: [] },
  ]);
  const [selectedExercises, setSelectedExercises] = useState<
    Record<number, Exercise[]>
  >({
    1: [],
  });
  const [customSets, setCustomSets] = useState<Record<string, number>>({});
  const [customReps, setCustomReps] = useState<Record<string, string>>({});

  // Fetch preset exercises
  const { data: presetExercises = [], isLoading } = useQuery(
    trpc.workoutPlans.getPresetExercises.queryOptions()
  );

  const handleExerciseSelect = (exercise: Exercise, dayNumber: number) => {
    setSelectedExercises((prev) => {
      const dayExercises = prev[dayNumber] || [];
      const updatedExercises = dayExercises.some((e) => e.id === exercise.id)
        ? dayExercises.filter((e) => e.id !== exercise.id)
        : [...dayExercises, exercise];
      return { ...prev, [dayNumber]: updatedExercises };
    });
  };

  const handleAddDay = () => {
    const newDayNumber = days.length + 1;
    const newDay: Day = {
      dayNumber: newDayNumber,
      focus: "",
      exercises: [],
    };
    setDays([...days, newDay]);
    setSelectedExercises((prev) => ({
      ...prev,
      [newDayNumber]: [],
    }));
  };

  const handleRemoveDay = (dayNumberToRemove: number) => {
    if (days.length === 1) {
      toast.error("You must have at least one day in your plan");
      return;
    }

    // Create a mapping of original day numbers to their exercises
    const exerciseMapping: Record<number, Exercise[]> = {};
    days.forEach((day) => {
      exerciseMapping[day.dayNumber] = selectedExercises[day.dayNumber] || [];
    });

    // Remove the selected day and get remaining days
    const remainingDays = days.filter(
      (day) => day.dayNumber !== dayNumberToRemove
    );

    // Create new days array with updated numbers
    const updatedDays = remainingDays.map((day, index) => {
      const newDayNumber = index + 1;
      return {
        ...day,
        dayNumber: newDayNumber,
      };
    });

    // Update selected exercises based on the original mapping
    const newSelectedExercises: Record<number, Exercise[]> = {};
    updatedDays.forEach((day, index) => {
      const originalDayNumber = remainingDays[index].dayNumber;
      newSelectedExercises[day.dayNumber] = exerciseMapping[originalDayNumber];
    });

    // Update the states
    setDays(updatedDays);
    setSelectedExercises(newSelectedExercises);

    // Update sets and reps
    const updateCustomValues = (
      prev: Record<string, any>,
      type: "sets" | "reps"
    ) => {
      const newValues: Record<string, any> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const [oldDayNum, exerciseId] = key.split("-");
        const oldDayNumber = parseInt(oldDayNum);

        // Find the day that had this number in the original array
        const dayWithOldNumber = remainingDays.find(
          (day) => day.dayNumber === oldDayNumber
        );

        if (dayWithOldNumber) {
          // Find its new number in updatedDays
          const newDay = updatedDays.find(
            (day) => day.focus === dayWithOldNumber.focus
          );
          if (newDay) {
            newValues[`${newDay.dayNumber}-${exerciseId}`] = value;
          }
        }
      });
      return newValues;
    };

    setCustomSets((prev) => updateCustomValues(prev, "sets"));
    setCustomReps((prev) => updateCustomValues(prev, "reps"));
  };

  const handleUpdateDayFocus = (dayNumber: number, focus: string) => {
    setDays(
      days.map((day) => (day.dayNumber === dayNumber ? { ...day, focus } : day))
    );
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
    // Validate that each day has at least one exercise
    const hasEmptyDays = days.some(
      (day) => (selectedExercises[day.dayNumber] || []).length === 0
    );
    if (hasEmptyDays) {
      toast.error("Each day must have at least one exercise");
      return;
    }

    // Validate that each day has a focus
    const hasEmptyFocus = days.some((day) => !day.focus);
    if (hasEmptyFocus) {
      toast.error("Each day must have a focus");
      return;
    }

    createPlanMutation.mutate({
      name: planName,
      description: planDescription,
      goalType,
      days: days.map((day) => ({
        dayNumber: day.dayNumber,
        focus: day.focus,
        exercises: (selectedExercises[day.dayNumber] || []).map((exercise) => ({
          ...exercise,
          sets: customSets[`${day.dayNumber}-${exercise.id}`] || exercise.sets,
          reps: customReps[`${day.dayNumber}-${exercise.id}`] || exercise.reps,
        })),
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="planName" className="text-base font-medium">
            Plan Name
          </Label>
          <Input
            id="planName"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter plan name"
            className="mt-2 h-12 text-base"
          />
        </div>
        <div>
          <Label htmlFor="planDescription" className="text-base font-medium">
            Description
          </Label>
          <Textarea
            id="planDescription"
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            placeholder="Enter plan description"
            className="mt-2 min-h-[100px] text-base"
          />
        </div>
        <div>
          <Label htmlFor="goalType" className="text-base font-medium">
            Goal Type
          </Label>
          <Select
            value={goalType}
            onValueChange={(
              value: "lose_weight" | "gain_muscle" | "maintain"
            ) => setGoalType(value)}
          >
            <SelectTrigger className="mt-2 h-12 text-base">
              <SelectValue placeholder="Select goal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose_weight" className="text-base">
                Lose Weight
              </SelectItem>
              <SelectItem value="gain_muscle" className="text-base">
                Gain Muscle
              </SelectItem>
              <SelectItem value="maintain" className="text-base">
                Maintain
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Days Section */}
      <div className="space-y-4">
        {days.map((day) => (
          <Card key={day.dayNumber} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-lg">Day {day.dayNumber}</CardTitle>
              {days.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => handleRemoveDay(day.dayNumber)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div>
                <Label
                  htmlFor={`focus-${day.dayNumber}`}
                  className="text-base font-medium"
                >
                  Focus
                </Label>
                <Input
                  id={`focus-${day.dayNumber}`}
                  value={day.focus}
                  onChange={(e) =>
                    handleUpdateDayFocus(day.dayNumber, e.target.value)
                  }
                  placeholder="Enter workout focus (e.g., Upper Body, Cardio)"
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-base font-medium">Exercises</Label>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="exercises">
                    <AccordionTrigger className="text-base bg-accent/20 p-2 rounded-md">
                      <div className="flex flex-col  ">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          <span>Select Exercises</span>
                        </div>
                        <Badge variant="secondary" className=" no-underline">
                          {(selectedExercises[day.dayNumber] || []).length}{" "}
                          selected
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {presetExercises.map((exercise) => (
                          <div key={exercise.id} className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`${day.dayNumber}-${exercise.id}`}
                                checked={(
                                  selectedExercises[day.dayNumber] || []
                                ).some((e) => e.id === exercise.id)}
                                onCheckedChange={() =>
                                  handleExerciseSelect(exercise, day.dayNumber)
                                }
                                className="h-5 w-5"
                              />
                              <Label
                                htmlFor={`${day.dayNumber}-${exercise.id}`}
                                className="text-base"
                              >
                                {exercise.name}
                              </Label>
                            </div>
                            {(selectedExercises[day.dayNumber] || []).some(
                              (e) => e.id === exercise.id
                            ) && (
                              <div className="flex gap-4 ml-8">
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`sets-${day.dayNumber}-${exercise.id}`}
                                    className="text-sm text-muted-foreground"
                                  >
                                    Sets
                                  </Label>
                                  <Input
                                    id={`sets-${day.dayNumber}-${exercise.id}`}
                                    type="number"
                                    value={
                                      customSets[
                                        `${day.dayNumber}-${exercise.id}`
                                      ] || exercise.sets
                                    }
                                    onChange={(e) =>
                                      setCustomSets((prev) => ({
                                        ...prev,
                                        [`${day.dayNumber}-${exercise.id}`]:
                                          parseInt(e.target.value),
                                      }))
                                    }
                                    min="1"
                                    className="h-10 text-base"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`reps-${day.dayNumber}-${exercise.id}`}
                                    className="text-sm text-muted-foreground"
                                  >
                                    Reps
                                  </Label>
                                  <Input
                                    id={`reps-${day.dayNumber}-${exercise.id}`}
                                    value={
                                      customReps[
                                        `${day.dayNumber}-${exercise.id}`
                                      ] || exercise.reps
                                    }
                                    onChange={(e) =>
                                      setCustomReps((prev) => ({
                                        ...prev,
                                        [`${day.dayNumber}-${exercise.id}`]:
                                          e.target.value,
                                      }))
                                    }
                                    placeholder="e.g., 12 or 30 sec"
                                    className="h-10 text-base"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-12 text-base"
          onClick={handleAddDay}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Day
        </Button>

        <Button
          onClick={handleCreatePlan}
          disabled={
            !planName ||
            days.some((day) => !day.focus) ||
            days.some(
              (day) => (selectedExercises[day.dayNumber] || []).length === 0
            )
          }
          className="w-full h-12 text-base"
        >
          Create Plan
        </Button>
      </div>
    </div>
  );
}
