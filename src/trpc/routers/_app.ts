import { createTRPCRouter, publicProcedure } from "../init";
import { z } from "zod";
import { userProfileRouter } from "./userProfile";
import { weightRouter } from "./weight";
import { workoutRouter } from "./workout";
import { plansRouter } from "./plans";
import { workoutFocusesRouter } from "./workout-focuses";
import { exerciseCatalogRouter } from "./exercise-catalog";

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
  plans: plansRouter,
  workoutFocuses: workoutFocusesRouter,
  exerciseCatalog: exerciseCatalogRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
