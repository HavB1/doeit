import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { hasCompletedOnboarding } from "@/lib/auth";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import RequireOnboardingView from "./require-onboarding-view";

/**
 * A higher-order component that checks if the user has completed onboarding.
 * If not, it redirects to the onboarding page.
 *
 * @param Component The component to render if onboarding is completed
 * @returns A new component that checks for onboarding completion
 */
export default async function RequireOnboarding({
  children,
}: {
  children: React.ReactNode;
}) {
  prefetch(trpc.userProfile.getProfile.queryOptions());

  return (
    <HydrateClient>
      <Suspense>
        <RequireOnboardingView>{children}</RequireOnboardingView>
      </Suspense>
    </HydrateClient>
  );
}
