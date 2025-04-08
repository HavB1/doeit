"use client";

import { cn } from "@/lib/utils";

export type GoalType = "lose_weight" | "gain_muscle" | "maintain";

interface GoalSelectorProps {
  activeGoal: GoalType;
  onGoalChange: (goal: GoalType) => void;
}

const goals = [
  { value: "lose_weight" as const, label: "Lose Weight" },
  { value: "gain_muscle" as const, label: "Gain Muscle" },
  { value: "maintain" as const, label: "Maintain" },
];

export function GoalSelector({ activeGoal, onGoalChange }: GoalSelectorProps) {
  return (
    <div className="flex w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="grid grid-cols-2  min-w-max gap-4 px-1">
        {goals.map((goal) => (
          <button
            key={goal.value}
            onClick={() => onGoalChange(goal.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeGoal === goal.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {goal.label}
          </button>
        ))}
      </div>
    </div>
  );
}
