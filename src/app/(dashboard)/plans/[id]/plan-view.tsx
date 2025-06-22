"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClonePlanButton } from "./clone-plan-button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dumbbell,
  Calendar,
  Target,
  Clock,
  Repeat,
  ChevronRight,
  Users,
  Trophy,
} from "lucide-react";

import { ExerciseInfoPopover } from "./exercise-info-popover";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PlanViewProps {
  planId: string;
}

export function PlanView({ planId }: PlanViewProps) {
  const trpc = useTRPC();

  const { data: plan, isLoading: planLoading } = useQuery(
    trpc.plans.getPresetPlan.queryOptions(
      { id: planId },
      {
        enabled: !!planId,
      }
    )
  );

  if (planLoading) {
    return <PlanViewSkeleton />;
  }

  if (!plan) {
    return (
      <div className="container py-4 px-4">
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold mb-2">Plan not found</h2>
          <p className="text-muted-foreground text-sm">
            The workout plan you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const totalExercises = plan.days.reduce(
    (acc, day) => acc + day.exercises.length,
    0
  );

  return (
    <div className="container py-4 px-4 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">{plan.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {plan.description}
            </p>
            <div className="flex justify-end">
              <ClonePlanButton planId={plan.id} />
            </div>
          </div>

          {/* Plan Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Days</p>
                <p className="font-semibold text-sm">{plan.days.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Dumbbell className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Exercises</p>
                <p className="font-semibold text-sm">{totalExercises}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Focus</p>
                <p className="font-semibold text-xs">Strength</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Trophy className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="font-semibold text-xs">Intermediate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Days */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold">Workout Schedule</h2>
          <Badge variant="secondary" className="text-xs">
            {plan.days.length} days
          </Badge>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {plan.days.map((day, index) => (
            <AccordionItem
              key={day.id}
              value={day.id + index.toString()}
              className="border rounded-lg overflow-hidden bg-card"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>div]:bg-muted/50 min-h-[60px]">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {day.dayNumber}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">
                        Day {day.dayNumber}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {day.focus}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {day.exercises.length}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 pt-3">
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={exercise.id}
                      className="group relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors min-h-[60px]"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                        {exerciseIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                          {exercise.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Repeat className="h-3 w-3" />
                            <span>{exercise.sets}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{exercise.reps}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <ExerciseInfoPopover exerciseId={exercise.exerciseId} />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="flex justify-end mt-8">
        <ClonePlanButton planId={plan.id} />
      </div>
    </div>
  );
}

function PlanViewSkeleton() {
  return (
    <div className="container py-4 px-4 max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
              >
                <Skeleton className="h-4 w-4 rounded" />
                <div>
                  <Skeleton className="h-3 w-8 mb-1" />
                  <Skeleton className="h-4 w-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-12" />
        </div>

        <div className="space-y-2">
          {[1, 2, 3].map((day) => (
            <div
              key={day}
              className="border rounded-lg overflow-hidden bg-card"
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 space-y-2">
                {[1, 2, 3].map((exercise) => (
                  <div
                    key={exercise}
                    className="flex items-center gap-3 p-3 rounded-lg border min-h-[60px]"
                  >
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <div className="flex gap-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <Skeleton className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
