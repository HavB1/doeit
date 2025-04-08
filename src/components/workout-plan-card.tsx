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

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  days: Array<unknown>;
}

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  href: string;
}

export function WorkoutPlanCard({ plan, href }: WorkoutPlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {plan.days.length} days per week
          </p>
          <Button asChild className="w-full">
            <Link href={href}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
