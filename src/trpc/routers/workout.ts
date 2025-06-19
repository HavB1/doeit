import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import {
  workoutLogs,
  exercises,
  workoutPlans,
  workoutDays,
  presetWorkoutPlans,
  presetWorkoutDays,
  workoutFocuses,
  workoutFocusRelations,
  presetExercises,
  exerciseCatalog,
} from "@/db/schema";
import { desc, eq, and, gte, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const exerciseLogSchema = z.object({
  exerciseId: z.string(),
  sets: z.number(),
  reps: z.string(),
  weight: z.number().optional(),
  notes: z.string().optional(),
});

const createWorkoutSchema = z.object({
  planId: z.string(),
  dayId: z.string(),
  notes: z.string().optional(),
  exerciseLogs: z.array(exerciseLogSchema),
});

export const workoutRouter = createTRPCRouter({
  getRecentWorkouts: protectedProcedure.query(async ({ ctx }) => {
    return db.query.workoutLogs.findMany({
      where: eq(workoutLogs.userId, ctx.user.id),
      orderBy: [desc(workoutLogs.completedAt)],
    });
  }),

  getTodayWorkout: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const workout = await db.query.workoutLogs.findFirst({
      where: and(
        eq(workoutLogs.userId, ctx.user.id),
        gte(workoutLogs.completedAt, today),
        lt(workoutLogs.completedAt, tomorrow)
      ),
    });

    if (!workout) {
      return null;
    }

    const workoutExercises = await db.query.exercises.findMany({
      where: eq(exercises.dayId, workout.dayId),
    });

    return {
      ...workout,
      exercises: workoutExercises,
    };
  }),

  createWorkout: protectedProcedure
    .input(createWorkoutSchema)
    .mutation(async ({ ctx, input }) => {
      const workout = await db
        .insert(workoutLogs)
        .values({
          userId: ctx.user.id,
          planId: input.planId,
          dayId: input.dayId,
          notes: input.notes,
          completedAt: new Date(),
          exerciseLogs: input.exerciseLogs,
        })
        .returning();

      return workout[0];
    }),

  getWorkoutPlans: protectedProcedure.query(async ({ ctx }) => {
    return db.query.workoutPlans.findMany({
      where: eq(workoutPlans.userId, ctx.user.id),
    });
  }),

  getMyWorkouts: protectedProcedure.query(async ({ ctx }) => {
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

            const dayExercisesWithDetails = await Promise.all(
              dayExercises.map(async (exercise) => {
                const exerciseDetails =
                  await db.query.exerciseCatalog.findFirst({
                    where: eq(exerciseCatalog.id, exercise.exerciseId),
                  });
                return {
                  ...exercise,
                  exercise: exerciseDetails,
                };
              })
            );

            return {
              ...day,
              exercises: dayExercisesWithDetails,
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

  getWorkout: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await db.query.workoutPlans.findFirst({
        where: and(
          eq(workoutPlans.id, input.workoutId),
          eq(workoutPlans.userId, ctx.user.id)
        ),
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workout plan not found",
        });
      }

      const days = await db.query.workoutDays.findMany({
        where: eq(workoutDays.planId, plan.id),
        orderBy: (days) => days.dayNumber,
      });

      const daysWithExercises = await Promise.all(
        days.map(async (day) => {
          const dayExercises = await db.query.exercises.findMany({
            where: eq(exercises.dayId, day.id),
          });

          const dayExercisesWithDetails = await Promise.all(
            dayExercises.map(async (exercise) => {
              const exerciseDetails = await db.query.exerciseCatalog.findFirst({
                where: eq(exerciseCatalog.id, exercise.exerciseId),
              });
              return {
                ...exercise,
                exercise: exerciseDetails,
              };
            })
          );

          return {
            ...day,
            exercises: dayExercisesWithDetails,
          };
        })
      );

      // const daysWithDetailedExercises = await Promise.all(
      //   daysWithExercises.map(async(e)=>{
      //     const daysWithDetailes = await db.query.exerciseCatalog,findFirst({
      //       where: eq(exerciseCatalog.id, e.exercises.)
      //     })
      //   })
      // )

      return {
        ...plan,
        days: daysWithExercises,
      };
    }),

  getWorkoutDays: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ input }) => {
      return db.query.workoutDays.findMany({
        where: eq(workoutDays.planId, input.planId),
      });
    }),

  getWorkoutDetails: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workout = await db.query.workoutLogs.findFirst({
        where: eq(workoutLogs.id, input.workoutId),
      });

      if (!workout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workout not found",
        });
      }

      const exerciseLogs = workout.exerciseLogs || [];
      const exerciseDetails = await Promise.all(
        exerciseLogs.map(async (log) => {
          const exercise = await db.query.exercises.findFirst({
            where: eq(exercises.id, log.exerciseId),
          });
          return {
            ...log,
            exercise,
          };
        })
      );

      return {
        ...workout,
        exerciseLogs: exerciseDetails,
      };
    }),

  getWorkoutDayDetails: protectedProcedure
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Day not found",
        });
      }

      console.log({ day });

      const dayExercises = await db.query.exercises.findMany({
        where: eq(exercises.dayId, input.dayId),
      });

      console.log({ dayExercises });

      const dayExercisesWithDetails = await Promise.all(
        dayExercises.map(async (d) => {
          const exercise = await db.query.exerciseCatalog.findFirst({
            where: eq(exerciseCatalog.id, d.exerciseId),
          });
          return {
            ...d,
            exercise,
          };
        })
      );

      console.log({ dayExercisesWithDetails });

      return {
        ...day,
        exercises: dayExercisesWithDetails,
      };
    }),

  getNextIncompleteDay: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First check if the plan exists
      const plan = await db.query.workoutPlans.findFirst({
        where: eq(workoutPlans.id, input.workoutId),
      });

      if (!plan) {
        return null;
      }

      // Get all days for the plan
      const days = await db.query.workoutDays.findMany({
        where: eq(workoutDays.planId, input.workoutId),
        orderBy: (days) => days.dayNumber,
      });

      if (!days.length) {
        return null;
      }

      // Get all completed workouts for this plan
      const completedWorkouts = await db.query.workoutLogs.findMany({
        where: and(
          eq(workoutLogs.userId, ctx.user.id),
          eq(workoutLogs.planId, input.workoutId)
        ),
      });

      // Create a set of completed day IDs
      const completedDayIds = new Set(completedWorkouts.map((w) => w.dayId));

      // Find the first day that hasn't been completed
      const nextDay = days.find((day) => !completedDayIds.has(day.id));

      // If all days are completed, return the first day
      return nextDay || days[0];
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Preset plan not found",
        });
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

  deleteWorkout: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First, get all days for this plan
      const days = await db.query.workoutDays.findMany({
        where: eq(workoutDays.planId, input.workoutId),
      });

      // Delete all exercises for each day
      await Promise.all(
        days.map((day) =>
          db.delete(exercises).where(eq(exercises.dayId, day.id))
        )
      );

      // Delete all days
      await db
        .delete(workoutDays)
        .where(eq(workoutDays.planId, input.workoutId));

      // Finally, delete the plan
      await db
        .delete(workoutPlans)
        .where(
          and(
            eq(workoutPlans.id, input.workoutId),
            eq(workoutPlans.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
