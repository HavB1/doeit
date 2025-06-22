"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, ArrowRight } from "lucide-react";

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  days: Array<unknown>;
  goalType: string;
}

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  href: string;
}

export function WorkoutPlanCard({ plan, href }: WorkoutPlanCardProps) {
  const goalTypeLabel = {
    lose_weight: "Weight Loss",
    gain_muscle: "Muscle Gain",
    maintain: "Maintenance",
  }[plan.goalType];

  return (
    <Link href={href} className="block">
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="space-y-1.5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">
                {plan.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {plan.description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-2">
              {goalTypeLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{plan.days.length} days per week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4" />
                <span>Preset Plan</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
