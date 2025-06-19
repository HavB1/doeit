"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";

import { WorkoutHistory } from "@/app/(dashboard)/dashboard/components/workout-history";
import { useQuery } from "@tanstack/react-query";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { useUser } from "@clerk/nextjs";

export function DashboardView() {
  const trpc = useTRPC();
  const { user, isLoaded: isUserLoaded } = useUser();

  const { isLoading: weightLoading } = useQuery(
    trpc.weight.getWeightHistory.queryOptions()
  );
  const { isLoading: workoutsLoading } = useQuery(
    trpc.workout.getRecentWorkouts.queryOptions()
  );

  if (!isUserLoaded || weightLoading || workoutsLoading) {
 
    return <DashboardSkeleton />;
  }


  const userName = user?.firstName || user?.fullName || "User";

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h2>

        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome back, {userName}!
        </p>
      </div>

      {/* Recent Workouts - takes full width */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-7">
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutHistory />
        </CardContent>
      </Card>
    </div>
  );
}
