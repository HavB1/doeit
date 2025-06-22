import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { WorkoutsView } from "@/app/(dashboard)/workouts/components/workouts-view";
import { WorkoutsSkeleton } from "@/app/(dashboard)/workouts/components/workouts-skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <SignIn />;
  }

  prefetch(trpc.workout.getMyWorkouts.queryOptions());
  prefetch(trpc.workout.getRecentWorkouts.queryOptions());

  return (
    <HydrateClient>
      {/* Hero Section - More Angular and Bold */}
      <div>
        <div className="relative flex justify-center items-center w-full overflow-hidden h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/50 to-transparent" />
          <Image
            src="/doeit-4.png"
            alt="Doeit"
            width={1000}
            height={1000}
            className="w-full h-full object-cover object-top opacity-20"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 px-8 py-6">
              <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">
                Your Workouts
              </h1>
              <p className="text-slate-300 text-lg font-semibold">
                BUILD. PUSH. CONQUER.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={<WorkoutsSkeleton />}>
        <WorkoutsView />
      </Suspense>
    </HydrateClient>
  );
}
