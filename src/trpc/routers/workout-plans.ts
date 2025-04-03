import { z } from "zod";

import {
  presetWorkoutPlans,
  presetWorkoutDays,
  presetExercises,
  workoutPlans,
  workoutDays,
  exercises,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";

export const workoutPlansRouter = createTRPCRouter({
  getPresetPlans: protectedProcedure
    .input(
      z.object({
        goalType: z.enum(["lose_weight", "gain_muscle", "maintain"]),
      })
    )
    .query(async ({ input }) => {
      const plans = await db
        .select()
        .from(presetWorkoutPlans)
        .where(eq(presetWorkoutPlans.goalType, input.goalType));

      const plansWithDays = await Promise.all(
        plans.map(async (plan) => {
          const days = await db
            .select()
            .from(presetWorkoutDays)
            .where(eq(presetWorkoutDays.presetPlanId, plan.id));

          const daysWithExercises = await Promise.all(
            days.map(async (day) => {
              const exercises = await db
                .select()
                .from(presetExercises)
                .where(eq(presetExercises.presetDayId, day.id));

              return {
                ...day,
                exercises,
              };
            })
          );

          return {
            ...plan,
            days: daysWithExercises,
          };
        })
      );

      return plansWithDays;
    }),

  clonePresetPlan: protectedProcedure
    .input(
      z.object({
        presetPlanId: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the preset plan
      const presetPlan = await db.query.presetWorkoutPlans.findFirst({
        where: eq(presetWorkoutPlans.id, input.presetPlanId),
      });

      if (!presetPlan) {
        throw new Error("Preset plan not found");
      }

      // Create the new plan
      const [newPlan] = await db
        .insert(workoutPlans)
        .values({
          userId: ctx.user.id,
          name: input.name || presetPlan.name,
          description: presetPlan.description,
          goalType: presetPlan.goalType,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Get the preset days
      const presetDays = await db
        .select()
        .from(presetWorkoutDays)
        .where(eq(presetWorkoutDays.presetPlanId, input.presetPlanId));

      // Create the new days
      const newDays = await Promise.all(
        presetDays.map(async (presetDay) => {
          const [newDay] = await db
            .insert(workoutDays)
            .values({
              planId: newPlan.id,
              dayNumber: presetDay.dayNumber,
              focus: presetDay.focus,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          // Get the preset exercises
          const dayExercises = await db
            .select()
            .from(presetExercises)
            .where(eq(presetExercises.presetDayId, presetDay.id));

          // Create the new exercises
          const newExercises = await Promise.all(
            dayExercises.map((presetExercise) =>
              db
                .insert(exercises)
                .values({
                  dayId: newDay.id,
                  name: presetExercise.name,
                  sets: presetExercise.sets,
                  reps: presetExercise.reps,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .returning()
            )
          );

          return {
            ...newDay,
            exercises: newExercises.map(([exercise]) => exercise),
          };
        })
      );

      return {
        ...newPlan,
        days: newDays,
      };
    }),
});
