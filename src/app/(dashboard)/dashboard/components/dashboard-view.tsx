"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { WeightChart } from "@/app/(dashboard)/dashboard/components/weight-chart";
import { QuickActions } from "@/app/(dashboard)/dashboard/components/quick-actions";
import { WorkoutHistory } from "@/app/(dashboard)/dashboard/components/workout-history";
import { useQuery } from "@tanstack/react-query";
import { DashboardSkeleton } from "./dashboard-skeleton"; // Assuming skeleton is in the same directory
import { useUser } from "@clerk/nextjs"; // Import useUser

export function DashboardView() {
  const trpc = useTRPC();
  const { user, isLoaded: isUserLoaded } = useUser(); // Use the hook

  // Removed profile query
  // const { data: profile, isLoading: profileLoading } = useQuery(
  //  trpc.userProfile.getProfile.queryOptions()
  // );

  const { isLoading: weightLoading } = useQuery(
    trpc.weight.getWeightHistory.queryOptions()
  );
  const { isLoading: workoutsLoading } = useQuery(
    trpc.workout.getRecentWorkouts.queryOptions()
  );

  if (!isUserLoaded || weightLoading || workoutsLoading) {
    // Render skeleton while data or user info is loading
    return <DashboardSkeleton />;
  }

  // User data is loaded and other queries are settled (or handled by their respective components)
  const userName = user?.firstName || user?.fullName || "User";

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
        {/* Use name from useUser */}
        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome back, {userName}!
        </p>
      </div>
      {/* Grid layout adjustments for better mobile stacking */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Weight Chart - takes full width on small screens */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <WeightChart />
          </CardContent>
        </Card>

        {/* Quick Actions - takes full width on small screens */}
        {/* <Card className="col-span-1 md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card> */}
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
