import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { exerciseCatalog } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

export const exerciseCatalogRouter = createTRPCRouter({
  // Get all exercises from the catalog
  getAll: protectedProcedure.query(async () => {
    return await db.query.exerciseCatalog.findMany();
  }),

  // Get a specific exercise by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.query.exerciseCatalog.findFirst({
        where: eq(exerciseCatalog.id, input.id),
      });
    }),

  // Get a specific exercise by name (exact match)
  getByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return await db.query.exerciseCatalog.findFirst({
        where: eq(exerciseCatalog.name, input.name),
      });
    }),

  // Get exercises by name using partial match
  searchByName: protectedProcedure
    .input(z.object({ searchTerm: z.string() }))
    .query(async ({ input }) => {
      return await db.query.exerciseCatalog.findMany({
        where: ilike(exerciseCatalog.name, `%${input.searchTerm}%`),
      });
    }),

  // Get exercises by category
  getByCategory: protectedProcedure
    .input(
      z.object({
        category: z.enum([
          "upper_body",
          "lower_body",
          "core",
          "cardio",
          "full_body",
          "other",
        ]),
      })
    )
    .query(async ({ input }) => {
      return await db.query.exerciseCatalog.findMany({
        where: eq(exerciseCatalog.category, input.category),
      });
    }),
});
