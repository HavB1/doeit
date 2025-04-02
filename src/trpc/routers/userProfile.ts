import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init"; // Assuming protectedProcedure handles auth
import { db } from "@/db"; // Assuming db instance is exported from @/db
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define Zod schema for input validation
const UserProfileInputSchema = z.object({
  age: z.number().int().positive().optional(),
  sex: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  height: z.number().positive().optional(),
  currentWeight: z.number().positive().optional(),
  targetWeight: z.number().positive().optional(),
  fitnessGoal: z.enum(["lose_weight", "maintain", "gain_muscle"]).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "very_active", "extra_active"])
    .optional(),
  weeklyGymGoal: z.enum(["2-3", "3-4", "4-5", "5-6", "6+"]).optional(),
  dailyCalories: z.number().int().positive().min(500).max(5000).optional(),
  dailyProtein: z.number().int().positive().min(20).max(400).optional(),
});

export const userProfileRouter = createTRPCRouter({
  /**
   * Get the profile for the currently logged-in user.
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id; // Assuming user id is available in context from protectedProcedure

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    return profile; // Returns the profile or undefined if not found
  }),

  /**
   * Create or update the profile for the currently logged-in user.
   */
  createOrUpdateProfile: protectedProcedure
    .input(UserProfileInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if profile already exists
      const existingProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId),
      });

      if (existingProfile) {
        // Update existing profile
        const [updatedProfile] = await db
          .update(userProfiles)
          .set({
            age: input.age,
            sex: input.sex,
            height: input.height?.toString(),
            currentWeight: input.currentWeight?.toString(),
            targetWeight: input.targetWeight?.toString(),
            fitnessGoal: input.fitnessGoal,
            experienceLevel: input.experienceLevel,
            activityLevel: input.activityLevel,
            weeklyGymGoal: input.weeklyGymGoal,
            dailyCalories: input.dailyCalories?.toString(),
            dailyProtein: input.dailyProtein?.toString(),
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, userId))
          .returning(); // Return the updated profile
        return updatedProfile;
      } else {
        // Create new profile
        const [newProfile] = await db
          .insert(userProfiles)
          .values({
            userId: userId,
            age: input.age,
            sex: input.sex,
            height: input.height?.toString(),
            currentWeight: input.currentWeight?.toString(),
            targetWeight: input.targetWeight?.toString(),
            fitnessGoal: input.fitnessGoal,
            experienceLevel: input.experienceLevel,
            activityLevel: input.activityLevel,
            weeklyGymGoal: input.weeklyGymGoal,
            dailyCalories: input.dailyCalories?.toString(),
            dailyProtein: input.dailyProtein?.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning(); // Return the new profile
        return newProfile;
      }
    }),
});

export type UserProfileRouter = typeof userProfileRouter; // Export type for client-side usage
