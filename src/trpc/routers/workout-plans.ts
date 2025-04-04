import { z } from "zod";

import {
  presetWorkoutPlans,
  presetWorkoutDays,
  presetExercises,
  workoutPlans,
  workoutDays,
  exercises,
  workoutLogs,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
        name: presetExercises.name,
        sets: presetExercises.sets,
        reps: presetExercises.reps,
      })
      .from(presetExercises)
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

  createPlan: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        goalType: z.enum(["lose_weight", "gain_muscle", "maintain"]),
        days: z.array(
          z.object({
            dayNumber: z.number(),
            focus: z.string().min(1),
            exercises: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                sets: z.number(),
                reps: z.string(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create the plan
      const [plan] = await db
        .insert(workoutPlans)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          goalType: input.goalType,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create days and exercises for each day
      const createdDays = await Promise.all(
        input.days.map(async (dayInput) => {
          // Create the day
          const [day] = await db
            .insert(workoutDays)
            .values({
              planId: plan.id,
              dayNumber: dayInput.dayNumber,
              focus: dayInput.focus,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          // Create exercises for the day
          const createdExercises = await Promise.all(
            dayInput.exercises.map((exercise) =>
              db
                .insert(exercises)
                .values({
                  dayId: day.id,
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .returning()
            )
          );

          return {
            ...day,
            exercises: createdExercises.flat(),
          };
        })
      );

      return {
        ...plan,
        days: createdDays,
      };
    }),

  getNextIncompleteDay: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get all days for the plan
      const days = await db.query.workoutDays.findMany({
        where: eq(workoutDays.planId, input.planId),
        orderBy: (days) => days.dayNumber,
      });

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
});
