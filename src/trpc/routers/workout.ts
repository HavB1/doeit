import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import {
  workoutLogs,
  exercises,
  workoutPlans,
  workoutDays,
  exerciseCatalog,
} from "@/db/schema";
import { desc, eq, and, gte, lt } from "drizzle-orm";

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
        throw new Error("Workout not found");
      }

      const exerciseLogs = workout.exerciseLogs || [];
      const exerciseDetails = await Promise.all(
        exerciseLogs.map(async (log) => {
          const catalogEntry = await db.query.exerciseCatalog.findFirst({
            where: eq(exerciseCatalog.id, log.exerciseId),
          });

          return {
            ...log,
            exercise: {
              name: catalogEntry?.name || "Unknown Exercise",
              category: catalogEntry?.category || null,
              description: catalogEntry?.description || null,
            },
          };
        })
      );

      return {
        ...workout,
        exerciseLogs: exerciseDetails,
      };
    }),
});
