import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { WorkoutsView } from "@/app/(dashboard)/workouts/components/workouts-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SignIn } from "@clerk/nextjs";

// export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <SignIn />;
  }

  prefetch(trpc.workout.getRecentWorkouts.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <WorkoutsView />
      </Suspense>
    </HydrateClient>
  );
}
