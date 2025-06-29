import { Suspense } from "react";

import { SessionView } from "./components/session-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

interface SessionPageProps {
  searchParams: Promise<{
    workoutId?: string;
    dayId?: string;
  }>;
}

export default async function SessionPage({ searchParams }: SessionPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workoutId, dayId } = await searchParams;

  if (!workoutId || !dayId) {
    redirect("/workouts");
  }

  // Prefetch the day details
  prefetch(trpc.workout.getWorkoutDayDetails.queryOptions({ dayId }));

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <SessionView planId={workoutId} dayId={dayId} />
      </Suspense>
    </HydrateClient>
  );
}
