import { Suspense } from "react";

import { SessionView } from "./components/session-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

interface SessionPageProps {
  searchParams: {
    planId?: string;
    dayId?: string;
  };
}

export default async function SessionPage({ searchParams }: SessionPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { planId, dayId } = searchParams;

  if (!planId || !dayId) {
    redirect("/workouts");
  }

  // Prefetch the day details
  prefetch(trpc.workoutPlans.getPlanDayDetails.queryOptions({ dayId }));

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <SessionView planId={planId} dayId={dayId} />
      </Suspense>
    </HydrateClient>
  );
}
