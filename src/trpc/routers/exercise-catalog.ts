import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";
import { db } from "@/db";
import { exerciseCatalog } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import type {
  ExerciseDBExercise,
  ExerciseDBBodyPart,
  ExerciseDBTarget,
  ExerciseDBEquipment,
  ExerciseDBListResponse,
} from "@/types/exercisedb";

// ExerciseDB API client using direct fetch (for production)
class ExerciseDBClient {
  private apiKey: string;
  private baseURL = "https://exercisedb.p.rapidapi.com";

  constructor() {
    const apiKey = process.env.EXERCISEDB_API_KEY;
    if (!apiKey) {
      throw new Error(
        "EXERCISEDB_API_KEY is not defined in environment variables"
      );
    }
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": "exercisedb.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching from ExerciseDB API:", error);
      throw new Error("Failed to fetch from ExerciseDB API");
    }
  }

  // Get all exercises (with pagination)
  async getExercises(
    limit: number = 10,
    offset: number = 0
  ): Promise<ExerciseDBListResponse> {
    return this.fetch<ExerciseDBListResponse>(
      `/exercises?limit=${limit}&offset=${offset}`
    );
  }

  // Get exercises by body part
  async getExercisesByBodyPart(
    bodyPart: ExerciseDBBodyPart,
    limit?: number,
    offset?: number
  ): Promise<ExerciseDBListResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.fetch<ExerciseDBListResponse>(
      `/exercises/bodyPart/${bodyPart}${query}`
    );
  }

  // Get exercises by target muscle
  async getExercisesByTarget(
    target: ExerciseDBTarget,
    limit?: number,
    offset?: number
  ): Promise<ExerciseDBListResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.fetch<ExerciseDBListResponse>(
      `/exercises/target/${target}${query}`
    );
  }

  // Get exercises by equipment
  async getExercisesByEquipment(
    equipment: ExerciseDBEquipment,
    limit?: number,
    offset?: number
  ): Promise<ExerciseDBListResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.fetch<ExerciseDBListResponse>(
      `/exercises/equipment/${equipment}${query}`
    );
  }

  // Get exercise by name
  async getExerciseByName(name: string): Promise<ExerciseDBExercise> {
    return this.fetch<ExerciseDBExercise>(`/exercises/name/${name}`);
  }

  // Get exercise by ID
  async getExerciseById(id: string): Promise<ExerciseDBExercise> {
    return this.fetch<ExerciseDBExercise>(`/exercises/exercise/${id}`);
  }

  // Get list of all body parts
  async getBodyPartList(): Promise<ExerciseDBBodyPart[]> {
    return this.fetch<ExerciseDBBodyPart[]>("/exercises/bodyPartList");
  }

  // Get list of all target muscles
  async getTargetList(): Promise<ExerciseDBTarget[]> {
    return this.fetch<ExerciseDBTarget[]>("/exercises/targetList");
  }

  // Get list of all equipment
  async getEquipmentList(): Promise<ExerciseDBEquipment[]> {
    return this.fetch<ExerciseDBEquipment[]>("/exercises/equipmentList");
  }
}

// Initialize the client (singleton pattern)
let exerciseDBClient: ExerciseDBClient | null = null;

function getExerciseDBClient(): ExerciseDBClient {
  if (!exerciseDBClient) {
    exerciseDBClient = new ExerciseDBClient();
  }
  return exerciseDBClient;
}

export const exerciseCatalogRouter = createTRPCRouter({
  // Get all exercises from the catalog
  getAll: publicProcedure.query(async () => {
    return await db.query.exerciseCatalog.findMany();
  }),

  // Get a specific exercise by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.query.exerciseCatalog.findFirst({
        where: eq(exerciseCatalog.id, input.id),
      });
    }),

  // Get a specific exercise by name (exact match)
  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return await db.query.exerciseCatalog.findFirst({
        where: eq(exerciseCatalog.name, input.name),
      });
    }),

  // Get exercises by name using partial match
  searchByName: publicProcedure
    .input(z.object({ searchTerm: z.string() }))
    .query(async ({ input }) => {
      return await db.query.exerciseCatalog.findMany({
        where: ilike(exerciseCatalog.name, `%${input.searchTerm}%`),
      });
    }),

  // Get exercises by category
  getByCategory: publicProcedure
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

  // Get exercises from ExerciseDB by body part
  exerciseDBByBodyPart: publicProcedure
    .input(
      z.object({
        bodyPart: z.enum([
          "back",
          "cardio",
          "chest",
          "lower arms",
          "lower legs",
          "neck",
          "shoulders",
          "upper arms",
          "upper legs",
          "waist",
        ]),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const client = getExerciseDBClient();
      return await client.getExercisesByBodyPart(
        input.bodyPart,
        input.limit,
        input.offset
      );
    }),

  // Get exercises by target muscle
  exerciseDBByTarget: publicProcedure
    .input(
      z.object({
        target: z.string(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const client = getExerciseDBClient();
      return await client.getExercisesByTarget(
        input.target as ExerciseDBTarget,
        input.limit,
        input.offset
      );
    }),

  // Get exercises by equipment
  exerciseDBByEquipment: publicProcedure
    .input(
      z.object({
        equipment: z.string(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const client = getExerciseDBClient();
      return await client.getExercisesByEquipment(
        input.equipment as ExerciseDBEquipment,
        input.limit,
        input.offset
      );
    }),

  // Get all exercises from ExerciseDB (paginated)
  exerciseDBGetAll: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const client = getExerciseDBClient();
      return await client.getExercises(input.limit, input.offset);
    }),

  // Get exercise by name from ExerciseDB
  exerciseDBByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const client = getExerciseDBClient();
      return await client.getExerciseByName(input.name);
    }),

  // Get exercise by ID from ExerciseDB
  exerciseDBById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const client = getExerciseDBClient();
      return await client.getExerciseById(input.id);
    }),

  // Get list of available body parts from ExerciseDB
  exerciseDBBodyPartList: publicProcedure.query(async () => {
    const client = getExerciseDBClient();
    return await client.getBodyPartList();
  }),

  // Get list of available target muscles from ExerciseDB
  exerciseDBTargetList: publicProcedure.query(async () => {
    const client = getExerciseDBClient();
    return await client.getTargetList();
  }),

  // Get list of available equipment from ExerciseDB
  exerciseDBEquipmentList: publicProcedure.query(async () => {
    const client = getExerciseDBClient();
    return await client.getEquipmentList();
  }),
});
