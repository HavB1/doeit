import { createTRPCRouter, publicProcedure } from "../init";
import { z } from "zod";
import { userProfileRouter } from "./userProfile";
import { weightRouter } from "./weight";
import { workoutRouter } from "./workout";
import { workoutPlansRouter } from "./workout-plans";

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),

  // Public health check endpoint
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),

  // Include all the domain routers
  userProfile: userProfileRouter,
  weight: weightRouter,
  workout: workoutRouter,
  workoutPlans: workoutPlansRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
