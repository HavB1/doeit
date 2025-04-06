import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { workoutFocuses, workoutFocusRelations } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type WorkoutFocus = InferSelectModel<typeof workoutFocuses>;
type WorkoutFocusRelation = InferSelectModel<typeof workoutFocusRelations>;

export const workoutFocusesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async (): Promise<WorkoutFocus[]> => {
    return await db.query.workoutFocuses.findMany();
  }),

  getByWorkout: protectedProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(
      async ({
        input,
      }: {
        input: { workoutId: string };
      }): Promise<WorkoutFocus[]> => {
        const relations = await db.query.workoutFocusRelations.findMany({
          where: eq(workoutFocusRelations.workoutId, input.workoutId),
          with: {
            focus: true,
          },
        });

        return relations.map((relation) => relation.focus);
      }
    ),

  addFocusToWorkout: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
        focusId: z.string(),
      })
    )
    .mutation(
      async ({
        input,
      }: {
        input: { workoutId: string; focusId: string };
      }): Promise<void> => {
        await db.insert(workoutFocusRelations).values({
          workoutId: input.workoutId,
          focusId: input.focusId,
        });
      }
    ),

  removeFocusFromWorkout: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
        focusId: z.string(),
      })
    )
    .mutation(
      async ({
        input,
      }: {
        input: { workoutId: string; focusId: string };
      }): Promise<void> => {
        await db
          .delete(workoutFocusRelations)
          .where(
            eq(workoutFocusRelations.workoutId, input.workoutId) &&
              eq(workoutFocusRelations.focusId, input.focusId)
          );
      }
    ),
});
