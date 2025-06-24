"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutPlanCard } from "@/components/workout-plan-card";
import { GoalSelector, GoalType } from "@/components/goal-selector";

import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Dumbbell } from "lucide-react";

export function PlansView() {
  const [activeGoal, setActiveGoal] = useState("lose_weight");

  const trpc = useTRPC();

  const { data: plans, isLoading: plansLoading } = useSuspenseQuery(
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
    return (
      <EmptyState
        icon={Dumbbell}
        title="No Plans Available"
        description="We couldn't load any workout plans at the moment. Please try refreshing the page or contact support if the issue persists."
        action={{
          label: "Refresh Page",
          onClick: () => window.location.reload(),
        }}
      />
    );
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
        <EmptyState
          icon={Plus}
          title="No Plans for This Goal"
          description="There are no preset plans available for this goal type yet. Create your own custom workout plan to get started."
          action={{
            label: "Create Your Own Plan",
            href: "/plans/new",
          }}
          variant="card"
        />
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
