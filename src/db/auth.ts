import { sql } from "./index";

/**
 * Sets the current user ID in the database session.
 * This should be called before any database operations that need RLS.
 */
export async function setCurrentUser(clerkId: string) {
  await sql`SELECT set_config('app.current_user_id', ${clerkId}, false)`;
}

/**
 * Clears the current user ID from the database session.
 * This should be called after database operations are complete.
 */
export async function clearCurrentUser() {
  await sql`SELECT set_config('app.current_user_id', '', false)`;
}
