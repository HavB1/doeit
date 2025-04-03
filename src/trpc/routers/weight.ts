import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const weightRouter = createTRPCRouter({
  getWeightHistory: protectedProcedure.query(async ({ ctx }) => {
    const workouts = await db.query.workoutLogs.findMany({
      where: eq(workoutLogs.userId, ctx.user.id),
      orderBy: [desc(workoutLogs.completedAt)],
    });

    // Extract weight data from exercise logs
    return workouts
      .flatMap((workout) =>
        (workout.exerciseLogs || [])
          .filter((log) => log.weight)
          .map((log) => ({
            weight: log.weight,
            date: workout.completedAt,
            exerciseId: log.exerciseId,
          }))
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }),

  logWeight: protectedProcedure
    .input(
      z.object({
        weight: z.number(),
        exerciseId: z.string(),
        workoutId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workout = await db.query.workoutLogs.findFirst({
        where: eq(workoutLogs.id, input.workoutId),
      });

      if (!workout) {
        throw new Error("Workout not found");
      }

      const exerciseLogs = workout.exerciseLogs || [];
      const updatedLogs = exerciseLogs.map((log) =>
        log.exerciseId === input.exerciseId
          ? { ...log, weight: input.weight }
          : log
      );

      return db
        .update(workoutLogs)
        .set({ exerciseLogs: updatedLogs })
        .where(eq(workoutLogs.id, input.workoutId));
    }),
});
