"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutPlanCard } from "@/components/workout-plan-card";
import { GoalSelector, GoalType } from "@/components/goal-selector";

export function PlansView() {
  const [activeGoal, setActiveGoal] = useState("lose_weight");

  const trpc = useTRPC();

  const { data: plans, isLoading: plansLoading } = useQuery(
    trpc.workoutPlans.getPresetPlans.queryOptions()
  );

  if (plansLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!plans) {
    return <div>No plans found</div>;
  }

  const plansByGoal = plans.reduce((acc, plan) => {
    acc[plan.goalType] = acc[plan.goalType] || [];
    acc[plan.goalType].push(plan);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4 p-4">
      <div className="sticky top-0 z-10 bg-background pb-2">
        <GoalSelector
          activeGoal={activeGoal as GoalType}
          onGoalChange={setActiveGoal}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {plansByGoal[activeGoal as keyof typeof plansByGoal].length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No plans found.</p>
          </div>
        ) : (
          plansByGoal[activeGoal as keyof typeof plansByGoal].map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              href={`/plans/${plan.id}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
