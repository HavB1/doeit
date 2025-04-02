import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */

  const { userId } = await auth();
  // Return userId in context without requiring authentication
  // This allows both authenticated and unauthenticated requests
  return { userId };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Add a public procedure that doesn't require auth
export const publicProcedure = t.procedure;

const authedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx, next } = opts;

  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, ctx.userId),
  });

  if (!dbUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Something went wrong. User not found",
    });
  }

  return next({
    ctx: {
      user: dbUser,
    },
  });
});

export const protectedProcedure = authedProcedure;
