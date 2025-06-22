import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  boolean,
  numeric,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    name: text("name"),
    imageUrl: text("image_url"),
  },
  (t) => ({
    // RLS policies for users table
    p1: pgPolicy("view own user", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.user_id() = clerk_id)`,
    }),
    p2: pgPolicy("update own user", {
      for: "update",
      to: "authenticated",
      using: sql`(select auth.user_id() = clerk_id)`,
    }),
  })
);

export const workoutPlans = pgTable(
  "workout_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").notNull().default(false),
    presetPlanId: uuid("preset_plan_id").references(
      () => presetWorkoutPlans.id
    ), // Optional link to preset plan
    isCustom: boolean("is_custom").notNull().default(false), // Indicates if plan is user-created
    goalType: text("goal_type")
      .$type<"lose_weight" | "gain_muscle" | "maintain">()
      .notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    // RLS policies for workout plans
    p1: pgPolicy("view own plans", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p2: pgPolicy("create plans", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p3: pgPolicy("update own plans", {
      for: "update",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p4: pgPolicy("delete own plans", {
      for: "delete",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p5: pgPolicy("view preset-derived plans", {
      for: "select",
      to: "authenticated",
      using: sql`preset_plan_id IS NOT NULL AND is_custom = false`, // Allow viewing preset-derived plans
    }),
  })
);

// Workout Focuses
export const workoutFocuses = pgTable(
  "workout_focuses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    // RLS policies for workout focuses
    p1: pgPolicy("Focuses are public", {
      for: "select",
      to: "authenticated",
      using: sql`true`,
    }),
  })
);

// Workout Focus Relations
export const workoutFocusRelations = pgTable(
  "workout_focus_relations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workoutDays.id, { onDelete: "cascade" }),
    focusId: uuid("focus_id")
      .notNull()
      .references(() => workoutFocuses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    // RLS policies for workout focus relations
    p1: pgPolicy("Users can view their own focus relations", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = workout_id))`,
    }),
    p2: pgPolicy("Users can create their own focus relations", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = workout_id))`,
    }),
    p3: pgPolicy("Users can update their own focus relations", {
      for: "update",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = workout_id))`,
    }),
    p4: pgPolicy("Users can delete their own focus relations", {
      for: "delete",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = workout_id))`,
    }),
  })
);

// Modify workout_days table to remove the focus column
export const workoutDays = pgTable(
  "workout_days",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => workoutPlans.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    // RLS policies for workout days
    p1: pgPolicy("view own days", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id where wp.id = plan_id))`,
    }),
    p2: pgPolicy("create days", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id where wp.id = plan_id))`,
    }),
    p3: pgPolicy("update own days", {
      for: "update",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id where wp.id = plan_id))`,
    }),
    p4: pgPolicy("delete own days", {
      for: "delete",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id where wp.id = plan_id))`,
    }),
  })
);

// Exercise catalog - source of truth for exercises
export const exerciseCatalog = pgTable(
  "exercise_catalog",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    category: text("category").$type<
      "upper_body" | "lower_body" | "core" | "cardio" | "full_body" | "other"
    >(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    // RLS policies for exercise catalog
    p1: pgPolicy("Exercise catalog is public", {
      for: "select",
      to: "authenticated",
      using: sql`true`,
    }),
  })
);

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dayId: uuid("day_id")
      .notNull()
      .references(() => workoutDays.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exerciseCatalog.id),
    sets: integer("sets").notNull(),
    reps: text("reps").notNull(), // Can be "6" or "12 each leg" or "1 min"
    type: text("type"), // For special exercises like HIIT
    duration: text("duration"), // For timed exercises
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    // RLS policies for exercises
    p1: pgPolicy("view own exercises", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = day_id))`,
    }),
    p2: pgPolicy("create exercises", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = day_id))`,
    }),
    p3: pgPolicy("update own exercises", {
      for: "update",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = day_id))`,
    }),
    p4: pgPolicy("delete own exercises", {
      for: "delete",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = day_id))`,
    }),
  })
);

// Add exerciseCatalog relation to exercises
export const exercisesRelations = relations(exercises, ({ one }) => ({
  day: one(workoutDays, {
    fields: [exercises.dayId],
    references: [workoutDays.id],
  }),
  catalogEntry: one(exerciseCatalog, {
    fields: [exercises.exerciseId],
    references: [exerciseCatalog.id],
  }),
}));

export const workoutLogs = pgTable(
  "workout_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    planId: uuid("plan_id")
      .references(() => workoutPlans.id)
      .notNull(),
    dayId: uuid("day_id")
      .references(() => workoutDays.id)
      .notNull(),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
    notes: text("notes"),
    exerciseLogs: jsonb("exercise_logs").$type<
      {
        exerciseId: string;
        sets: number;
        reps: string;
        weight?: number;
        notes?: string;
      }[]
    >(),
  },
  (t) => ({
    // RLS policies for workout logs
    p1: pgPolicy("view own logs", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p2: pgPolicy("create logs", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p3: pgPolicy("update own logs", {
      for: "update",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p4: pgPolicy("delete own logs", {
      for: "delete",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
  })
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    age: integer("age"),
    sex: text("sex"),
    height: numeric("height"),
    currentWeight: numeric("current_weight"),
    targetWeight: numeric("target_weight"),
    fitnessGoal: text("fitness_goal").$type<
      "lose_weight" | "gain_muscle" | "maintain"
    >(),
    experienceLevel: text("experience_level"),
    activityLevel: text("activity_level"),
    weeklyGymGoal: text("weekly_gym_goal"),
    dailyCalories: numeric("daily_calories"),
    dailyProtein: numeric("daily_protein"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    // RLS policies for user profiles
    p1: pgPolicy("view own profile", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p2: pgPolicy("create profile", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p3: pgPolicy("update own profile", {
      for: "update",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
    p4: pgPolicy("delete own profile", {
      for: "delete",
      to: "authenticated",
      using: sql`(select auth.user_id() = (select clerk_id from users where id = user_id))`,
    }),
  })
);

// 1. Preset Workout Plans
export const presetWorkoutPlans = pgTable(
  "preset_workout_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    goalType: text("goal_type")
      .$type<"lose_weight" | "gain_muscle" | "maintain">()
      .notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    // RLS policies for preset workout plans
    p1: pgPolicy("Preset plans are public", {
      for: "select",
      to: "authenticated",
      using: sql`true`,
    }),
  })
);

// 2. Preset Workout Days
export const presetWorkoutDays = pgTable("preset_workout_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  presetPlanId: uuid("preset_plan_id")
    .references(() => presetWorkoutPlans.id)
    .notNull(),
  dayNumber: integer("day_number").notNull(),
  focus: text("focus").notNull(),
});

// 3. Preset Exercises
export const presetExercises = pgTable("preset_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  presetDayId: uuid("preset_day_id")
    .references(() => presetWorkoutDays.id)
    .notNull(),
  exerciseId: uuid("exercise_id")
    .references(() => exerciseCatalog.id)
    .notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
});

// Add relation for presetExercises
export const presetExercisesRelations = relations(
  presetExercises,
  ({ one }) => ({
    presetDay: one(presetWorkoutDays, {
      fields: [presetExercises.presetDayId],
      references: [presetWorkoutDays.id],
    }),
    catalogEntry: one(exerciseCatalog, {
      fields: [presetExercises.exerciseId],
      references: [exerciseCatalog.id],
    }),
  })
);

// Add relations
export const workoutFocusesRelations = relations(
  workoutFocuses,
  ({ many }) => ({
    workoutFocusRelations: many(workoutFocusRelations),
  })
);

export const workoutFocusRelationsRelations = relations(
  workoutFocusRelations,
  ({ one }) => ({
    workout: one(workoutDays, {
      fields: [workoutFocusRelations.workoutId],
      references: [workoutDays.id],
    }),
    focus: one(workoutFocuses, {
      fields: [workoutFocusRelations.focusId],
      references: [workoutFocuses.id],
    }),
  })
);

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
  plan: one(workoutPlans, {
    fields: [workoutDays.planId],
    references: [workoutPlans.id],
  }),
  exercises: many(exercises),
  focusRelations: many(workoutFocusRelations),
}));
