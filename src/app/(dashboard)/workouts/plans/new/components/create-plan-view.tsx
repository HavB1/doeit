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

// Change the Exercise type to be more flexible
type Exercise = any;

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
  const [categoryFilters, setCategoryFilters] = useState<
    Record<number, string>
  >({
    1: "all",
  });

  // Fetch preset exercises
  const { data: presetExercises = [], isLoading } = useQuery(
    trpc.exerciseCatalog.getAll.queryOptions()
  );

  // Helper function to filter exercises by category
  const filterExercisesByCategory = (exercises: any[], dayNumber: number) => {
    const selectedCategory = categoryFilters[dayNumber] || "all";
    if (selectedCategory === "all") return exercises;

    return exercises.filter(
      (exercise) => exercise.category === selectedCategory
    );
  };

  // Add helper function to transform catalog exercises to plan exercises
  const getExerciseDefaults = (exercise: any): Exercise => {
    return {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      sets: 3, // Default to 3 sets
      reps: "12", // Default to 12 reps
    };
  };

  const handleExerciseSelect = (catalogExercise: any, dayNumber: number) => {
    // Transform catalog exercise to plan exercise with defaults
    const exercise = getExerciseDefaults(catalogExercise);

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
    setCategoryFilters((prev) => ({
      ...prev,
      [newDayNumber]: "all",
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
    const newCategoryFilters: Record<number, string> = {};

    updatedDays.forEach((day, index) => {
      const originalDayNumber = remainingDays[index].dayNumber;
      newSelectedExercises[day.dayNumber] = exerciseMapping[originalDayNumber];
      newCategoryFilters[day.dayNumber] =
        categoryFilters[originalDayNumber] || "all";
    });

    // Update the states
    setDays(updatedDays);
    setSelectedExercises(newSelectedExercises);
    setCategoryFilters(newCategoryFilters);

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
                        <div className="mb-4">
                          <Label
                            htmlFor={`category-filter-${day.dayNumber}`}
                            className="text-sm mb-2 block"
                          >
                            Filter by Category
                          </Label>
                          <Select
                            value={categoryFilters[day.dayNumber] || "all"}
                            onValueChange={(value) =>
                              setCategoryFilters((prev) => ({
                                ...prev,
                                [day.dayNumber]: value,
                              }))
                            }
                          >
                            <SelectTrigger
                              id={`category-filter-${day.dayNumber}`}
                              className="w-full"
                            >
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Categories
                              </SelectItem>
                              <SelectItem value="upper_body">
                                Upper Body
                              </SelectItem>
                              <SelectItem value="lower_body">
                                Lower Body
                              </SelectItem>
                              <SelectItem value="core">Core</SelectItem>
                              <SelectItem value="cardio">Cardio</SelectItem>
                              <SelectItem value="full_body">
                                Full Body
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {filterExercisesByCategory(
                          presetExercises,
                          day.dayNumber
                        ).map((catalogExercise) => (
                          <div key={catalogExercise.id} className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`${day.dayNumber}-${catalogExercise.id}`}
                                checked={(
                                  selectedExercises[day.dayNumber] || []
                                ).some((e) => e.id === catalogExercise.id)}
                                onCheckedChange={() =>
                                  handleExerciseSelect(
                                    catalogExercise,
                                    day.dayNumber
                                  )
                                }
                                className="h-5 w-5"
                              />
                              <Label
                                htmlFor={`${day.dayNumber}-${catalogExercise.id}`}
                                className="text-base"
                              >
                                {catalogExercise.name}
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({catalogExercise.category?.replace("_", " ")}
                                  )
                                </span>
                              </Label>
                            </div>
                            {(selectedExercises[day.dayNumber] || []).some(
                              (e) => e.id === catalogExercise.id
                            ) && (
                              <div className="flex gap-4 ml-8">
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`sets-${day.dayNumber}-${catalogExercise.id}`}
                                    className="text-sm text-muted-foreground"
                                  >
                                    Sets
                                  </Label>
                                  <Input
                                    id={`sets-${day.dayNumber}-${catalogExercise.id}`}
                                    type="number"
                                    value={
                                      customSets[
                                        `${day.dayNumber}-${catalogExercise.id}`
                                      ] || 3
                                    }
                                    onChange={(e) =>
                                      setCustomSets((prev) => ({
                                        ...prev,
                                        [`${day.dayNumber}-${catalogExercise.id}`]:
                                          parseInt(e.target.value),
                                      }))
                                    }
                                    min="1"
                                    className="h-10 text-base"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`reps-${day.dayNumber}-${catalogExercise.id}`}
                                    className="text-sm text-muted-foreground"
                                  >
                                    Reps
                                  </Label>
                                  <Input
                                    id={`reps-${day.dayNumber}-${catalogExercise.id}`}
                                    value={
                                      customReps[
                                        `${day.dayNumber}-${catalogExercise.id}`
                                      ] || "10"
                                    }
                                    onChange={(e) =>
                                      setCustomReps((prev) => ({
                                        ...prev,
                                        [`${day.dayNumber}-${catalogExercise.id}`]:
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

                        {filterExercisesByCategory(
                          presetExercises,
                          day.dayNumber
                        ).length === 0 && (
                          <p className="text-muted-foreground py-4 text-center">
                            No exercises match the selected category.
                          </p>
                        )}
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
