"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { useQuery } from "@tanstack/react-query";
import { WorkoutsSkeleton } from "./workouts-skeleton";

type RouterOutput = inferRouterOutputs<AppRouter>;
type WorkoutPlan = RouterOutput["workoutPlans"]["getMyPlans"][number];
type WorkoutDay = WorkoutPlan["days"][number];
type WorkoutLog = RouterOutput["workout"]["getRecentWorkouts"][number];

export function WorkoutsView() {
  const router = useRouter();
  const trpc = useTRPC();
  const [activeTab, setActiveTab] = useState("plans");

  const { data: plans, isLoading: isLoadingPlans } = useQuery(
    trpc.workoutPlans.getMyPlans.queryOptions()
  );

  const { data: recentWorkouts, isLoading: isLoadingWorkouts } = useQuery(
    trpc.workout.getRecentWorkouts.queryOptions()
  );

  if (isLoadingPlans || isLoadingWorkouts) {
    return <WorkoutsSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {plans?.map((plan) => (
            <Card key={plan.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.days.length} days
                  </p>
                </div>
                <Button
                  onClick={() =>
                    router.push(
                      `/workouts/session?planId=${plan.id}&dayId=${plan.days[0].id}`
                    )
                  }
                >
                  Start Workout
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {recentWorkouts?.map((workout) => (
            <Card key={workout.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {workout.notes || "Untitled Workout"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(workout.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/workouts/${workout.id}`)}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
