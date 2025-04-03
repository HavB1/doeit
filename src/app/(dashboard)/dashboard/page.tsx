import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DashboardView } from "@/app/(dashboard)/dashboard/components/dashboard-view";
import { DashboardSkeleton } from "./components/dashboard-skeleton";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Prefetch data on the server
  // prefetch(trpc.userProfile.getProfile.queryOptions()); // Removed as profile data is fetched via useUser on client
  prefetch(trpc.weight.getWeightHistory.queryOptions());
  prefetch(trpc.workout.getRecentWorkouts.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardView />
      </Suspense>
    </HydrateClient>
  );
}
