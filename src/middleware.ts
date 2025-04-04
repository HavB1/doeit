import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/users/webhook(.*)",
  "/",
  "/api/trpc/(.*)",
]);

// const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // const path = req.nextUrl.pathname;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes
  await auth.protect();

  // Check onboarding status from cookie
  // const hasCompletedOnboarding =
  //   req.cookies.get("onboarding_completed")?.value === "true";

  // // Redirect to onboarding if not completed and not already on onboarding page
  // if (!hasCompletedOnboarding && !isOnboardingRoute(req)) {
  //   return NextResponse.redirect(new URL("/onboarding", req.url));
  // }

  // // Redirect to dashboard if completed onboarding and trying to access onboarding
  // if (hasCompletedOnboarding && isOnboardingRoute(req)) {
  //   return NextResponse.redirect(new URL("/dashboard", req.url));
  // }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
