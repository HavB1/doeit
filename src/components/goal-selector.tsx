"use client";

import { cn } from "@/lib/utils";
import { Flame, Dumbbell, Scale } from "lucide-react";

export type GoalType = "lose_weight" | "gain_muscle" | "maintain";

interface GoalSelectorProps {
  activeGoal: GoalType;
  onGoalChange: (goal: GoalType) => void;
}

const goals = [
  {
    value: "lose_weight" as const,
    label: "Lose Weight",
    icon: Flame,
    description: "Burn fat and get leaner",
  },
  {
    value: "gain_muscle" as const,
    label: "Gain Muscle",
    icon: Dumbbell,
    description: "Build strength and muscle mass",
  },
  {
    value: "maintain" as const,
    label: "Maintain",
    icon: Scale,
    description: "Keep your current physique",
  },
];

export function GoalSelector({ activeGoal, onGoalChange }: GoalSelectorProps) {
  return (
    <div className="flex w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="grid grid-flow-col min-w-max gap-4 px-1">
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <button
              key={goal.value}
              onClick={() => onGoalChange(goal.value)}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-lg px-6 py-4 text-sm font-medium transition-all",
                activeGoal === goal.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110",
                  activeGoal === goal.value
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                )}
              />
              <div className="flex flex-col items-center gap-0.5">
                <span>{goal.label}</span>
                <span
                  className={cn(
                    "text-xs opacity-0 transition-opacity group-hover:opacity-100",
                    activeGoal === goal.value
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {goal.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
