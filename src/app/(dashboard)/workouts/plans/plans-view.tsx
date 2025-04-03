"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";

export function PlansView() {
  const trpc = useTRPC();

  const { data: loseWeightPlans = [], isLoading: loseWeightPlansLoading } =
    useQuery(
      trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "lose_weight" })
    );
  const { data: gainMusclePlans = [], isLoading: gainMusclePlansLoading } =
    useQuery(
      trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "gain_muscle" })
    );
  const { data: maintainPlans = [], isLoading: maintainPlansLoading } =
    useQuery(
      trpc.workoutPlans.getPresetPlans.queryOptions({ goalType: "maintain" })
    );

  if (
    loseWeightPlansLoading ||
    gainMusclePlansLoading ||
    maintainPlansLoading
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Workout Plans</h1>
          <p className="text-muted-foreground mt-1">
            Choose a preset plan or create your own
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/workouts/plans/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="lose_weight" className="mt-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex">
            <TabsTrigger value="lose_weight">Lose Weight</TabsTrigger>
            <TabsTrigger value="gain_muscle">Gain Muscle</TabsTrigger>
            <TabsTrigger value="maintain">Maintain</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lose_weight" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loseWeightPlans.map((plan) => (
              <Card key={plan.id}>
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
                      <Link href={`/workouts/plans/${plan.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gain_muscle" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gainMusclePlans.map((plan) => (
              <Card key={plan.id}>
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
                      <Link href={`/workouts/plans/${plan.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintain" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {maintainPlans.map((plan) => (
              <Card key={plan.id}>
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
                      <Link href={`/workouts/plans/${plan.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
