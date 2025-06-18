"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutPlanCard } from "@/components/workout-plan-card";
import { GoalSelector, GoalType } from "@/components/goal-selector";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function PlansView() {
  const [activeGoal, setActiveGoal] = useState("lose_weight");

  const trpc = useTRPC();

  const { data: plans, isLoading: plansLoading } = useQuery(
    trpc.plans.getPresetPlans.queryOptions()
  );

  if (plansLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-lg" />
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

  const currentPlans =
    plansByGoal[activeGoal as keyof typeof plansByGoal] || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-2">
        <GoalSelector
          activeGoal={activeGoal as GoalType}
          onGoalChange={setActiveGoal}
        />
      </div>

      {currentPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No plans found</h3>
            <p className="text-sm text-muted-foreground">
              There are no preset plans for this goal type yet.
            </p>
          </div>
          <Button asChild>
            <Link href="/plans/new">Create Your Own Plan</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPlans.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              href={`/plans/${plan.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
