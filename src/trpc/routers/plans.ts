import { z } from "zod";

import {
  presetWorkoutPlans,
  presetWorkoutDays,
  presetExercises,
  workoutPlans,
  workoutDays,
  exercises,
  workoutLogs,
  exerciseCatalog,
  workoutFocuses,
  workoutFocusRelations,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";
import { db } from "@/db";
import { TRPCError } from "@trpc/server";

export const plansRouter = createTRPCRouter({
  getPresetPlans: publicProcedure.query(async () => {
    const plans = await db.select().from(presetWorkoutPlans);

    const plansWithDays = await Promise.all(
      plans.map(async (plan) => {
        const days = await db
          .select()
          .from(presetWorkoutDays)
          .where(eq(presetWorkoutDays.presetPlanId, plan.id));

        const daysWithExercises = await Promise.all(
          days.map(async (day) => {
            const exercises = await db
              .select({
                id: presetExercises.id,
                presetDayId: presetExercises.presetDayId,
                exerciseId: presetExercises.exerciseId,
                sets: presetExercises.sets,
                reps: presetExercises.reps,
                name: exerciseCatalog.name,
              })
              .from(presetExercises)
              .innerJoin(
                exerciseCatalog,
                eq(presetExercises.exerciseId, exerciseCatalog.id)
              )
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

  getPresetPlan: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const plan = await db.query.presetWorkoutPlans.findFirst({
        where: eq(presetWorkoutPlans.id, input.id),
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Preset plan not found",
        });
      }

      const days = await db.query.presetWorkoutDays.findMany({
        where: eq(presetWorkoutDays.presetPlanId, input.id),
      });

      const daysWithExercises = await Promise.all(
        days.map(async (day) => {
          const exercises = await db
            .select({
              id: presetExercises.id,
              presetDayId: presetExercises.presetDayId,
              exerciseId: presetExercises.exerciseId,
              sets: presetExercises.sets,
              reps: presetExercises.reps,
              name: exerciseCatalog.name,
            })
            .from(presetExercises)
            .innerJoin(
              exerciseCatalog,
              eq(presetExercises.exerciseId, exerciseCatalog.id)
            )
            .where(eq(presetExercises.presetDayId, day.id));

          return {
            ...day,
            exercises,
          };
        })
      );

      // const daysWithExercises = await Promise.all(
      //   days.map(async (day) => {
      //     const exercises = await db.query.presetExercises.findMany({
      //       where: eq(presetExercises.presetDayId, day.id),
      //     });

      //     return { ...day, exercises };
      //   })
      // );

      return {
        ...plan,
        days: daysWithExercises,
      };
    }),

  clonePresetPlan: protectedProcedure
    .input(
      z.object({
        presetPlanId: z.string(),
        // name: z.string().optional(),
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
          name: presetPlan.name,
          description: presetPlan.description,
          goalType: presetPlan.goalType,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublic: false,
          isCustom: true,
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
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          // If focus exists, create a relation in workoutFocusRelations
          if (presetDay.focus) {
            // Create a new focus or use existing
            const [focus] = await db
              .insert(workoutFocuses)
              .values({
                name: presetDay.focus,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: workoutFocuses.name,
                set: { updatedAt: new Date() },
              })
              .returning();

            // Link the focus to the day
            await db.insert(workoutFocusRelations).values({
              workoutId: newDay.id,
              focusId: focus.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

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
                  exerciseId: presetExercise.exerciseId,
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

  getMyPlans: protectedProcedure.query(async ({ ctx }) => {
    const plans = await db.query.workoutPlans.findMany({
      where: eq(workoutPlans.userId, ctx.user.id),
    });

    const plansWithDays = await Promise.all(
      plans.map(async (plan) => {
        const days = await db.query.workoutDays.findMany({
          where: eq(workoutDays.planId, plan.id),
        });

        const daysWithExercises = await Promise.all(
          days.map(async (day) => {
            const dayExercises = await db.query.exercises.findMany({
              where: eq(exercises.dayId, day.id),
            });

            return {
              ...day,
              exercises: dayExercises,
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

  getPlanDayDetails: protectedProcedure
    .input(
      z.object({
        dayId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const day = await db.query.workoutDays.findFirst({
        where: eq(workoutDays.id, input.dayId),
      });

      if (!day) {
        throw new Error("Day not found");
      }

      const dayExercises = await db.query.exercises.findMany({
        where: eq(exercises.dayId, day.id),
      });

      return {
        ...day,
        exercises: dayExercises,
      };
    }),

  getPresetExercises: protectedProcedure.query(async () => {
    const exercises = await db
      .select({
        id: presetExercises.id,
        exerciseId: presetExercises.exerciseId,
        sets: presetExercises.sets,
        reps: presetExercises.reps,
        name: exerciseCatalog.name,
        category: exerciseCatalog.category,
      })
      .from(presetExercises)
      .innerJoin(
        exerciseCatalog,
        eq(presetExercises.exerciseId, exerciseCatalog.id)
      )
      .leftJoin(
        presetWorkoutDays,
        eq(presetExercises.presetDayId, presetWorkoutDays.id)
      )
      .leftJoin(
        presetWorkoutPlans,
        eq(presetWorkoutDays.presetPlanId, presetWorkoutPlans.id)
      );

    // Deduplicate exercises by name
    const uniqueExercises = exercises.reduce((acc, curr) => {
      if (!acc.some((e) => e.name === curr.name)) {
        acc.push(curr);
      }
      return acc;
    }, [] as typeof exercises);

    return uniqueExercises;
  }),

  getNextIncompleteDay: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First check if the plan exists
      const plan = await db.query.workoutPlans.findFirst({
        where: eq(workoutPlans.id, input.planId),
      });

      if (!plan) {
        return null;
      }

      // Get all days for the plan
      const days = await db.query.workoutDays.findMany({
        where: eq(workoutDays.planId, input.planId),
        orderBy: (days) => days.dayNumber,
      });

      if (!days.length) {
        return null;
      }

      // Get all completed workouts for this plan
      const completedWorkouts = await db.query.workoutLogs.findMany({
        where: and(
          eq(workoutLogs.userId, ctx.user.id),
          eq(workoutLogs.planId, input.planId)
        ),
      });

      // Create a set of completed day IDs
      const completedDayIds = new Set(completedWorkouts.map((w) => w.dayId));

      // Find the first day that hasn't been completed
      const nextDay = days.find((day) => !completedDayIds.has(day.id));

      // If all days are completed, return the first day
      return nextDay || days[0];
    }),

  deletePlan: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First, get all days for this plan
      const days = await db.query.workoutDays.findMany({
        where: eq(workoutDays.planId, input.planId),
      });

      // Delete all exercises for each day
      await Promise.all(
        days.map((day) =>
          db.delete(exercises).where(eq(exercises.dayId, day.id))
        )
      );

      // Delete all days
      await db.delete(workoutDays).where(eq(workoutDays.planId, input.planId));

      // Finally, delete the plan
      await db
        .delete(workoutPlans)
        .where(
          and(
            eq(workoutPlans.id, input.planId),
            eq(workoutPlans.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
