import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Checks if a user has completed their onboarding by looking for a profile in the database.
 * @param userId The ID of the user to check
 * @returns A boolean indicating whether the user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const userProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    return !!userProfile;
  } catch (error) {
    console.error("Error checking if user has completed onboarding:", error);
    return false;
  }
}
