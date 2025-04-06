"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClonePlanButton } from "./clone-plan-button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import Image from "next/image";
// import exerciseInfo from "@/lib/exercise-info.json";

interface PlanViewProps {
  planId: string;
}

function ExerciseInfoPopover({ exerciseId }: { exerciseId: string }) {
  const trpc = useTRPC();

  // Query the exercise from the database by ID
  const { data: catalogExercise, isLoading } = useQuery(
    trpc.exerciseCatalog.getById.queryOptions({ id: exerciseId })
  );

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Info className="h-4 w-4" />
      </Button>
    );
  }

  if (!catalogExercise) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="relative h-48 w-full bg-muted flex items-center justify-center">
            {/* Placeholder for image */}
            <div className="text-muted-foreground">Exercise Image</div>
          </div>
          <div>
            <h4 className="font-semibold">{catalogExercise.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {catalogExercise.category}
            </p>
            <p className="text-sm mt-2">
              {catalogExercise.description || "No description available"}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PlanViewSkeleton() {
  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
          <Skeleton className="h-4 w-56 sm:w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>
      <div className="space-y-6">
        {[1, 2].map((day) => (
          <div key={day} className="rounded-lg border">
            <div className="p-6">
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="border-t p-6 space-y-4">
              {[1, 2, 3].map((exercise) => (
                <div
                  key={exercise}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlanView({ planId }: PlanViewProps) {
  const trpc = useTRPC();

  const { data: loseWeightPlans = [], isLoading: loseLoading } = useQuery(
    trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "lose_weight" })
  );
  const { data: gainMusclePlans = [], isLoading: gainLoading } = useQuery(
    trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "gain_muscle" })
  );
  const { data: maintainPlans = [], isLoading: maintainLoading } = useQuery(
    trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "maintain" })
  );

  const isLoading = loseLoading || gainLoading || maintainLoading;

  if (isLoading) {
    return <PlanViewSkeleton />;
  }

  const plan = [...loseWeightPlans, ...gainMusclePlans, ...maintainPlans].find(
    (p) => p.id === planId
  );

  if (!plan) {
    return <div className="container py-6 px-4 md:px-6">Plan not found.</div>;
  }

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{plan.name}</h1>
          <p className="text-muted-foreground mt-1">{plan.description}</p>
        </div>
        <ClonePlanButton planId={plan.id} />
      </div>

      <div className="space-y-6">
        {plan.days.map((day) => (
          <Card key={day.id}>
            <CardHeader>
              <CardTitle>Day {day.dayNumber}</CardTitle>
              <CardDescription>{day.focus}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {day.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h4 className="font-medium">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                    <ExerciseInfoPopover exerciseId={exercise.exerciseId} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
