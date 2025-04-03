import { auth } from "@clerk/nextjs/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prefetch, trpc } from "@/trpc/server";
import { WeightChart } from "@/app/(dashboard)/dashboard/components/weight-chart";
import { QuickActions } from "@/app/(dashboard)/dashboard/components/quick-actions";
import { WorkoutHistory } from "@/app/(dashboard)/dashboard/components/workout-history";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Prefetch data for the client components
  prefetch(trpc.weight.getWeightHistory.queryOptions());
  prefetch(trpc.workout.getRecentWorkouts.queryOptions());
  prefetch(trpc.userProfile.getProfile.queryOptions());

  return (
    <div className="flex-1  p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Weight Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <WeightChart />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card>
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
