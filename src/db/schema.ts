import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
});

export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  goalType: text("goal_type")
    .$type<"lose_weight" | "gain_muscle" | "maintain">()
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workoutDays = pgTable("workout_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .references(() => workoutPlans.id)
    .notNull(),
  dayNumber: integer("day_number").notNull(),
  focus: text("focus").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayId: uuid("day_id")
    .references(() => workoutDays.id)
    .notNull(),
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(), // Can be "6" or "12 each leg" or "1 min"
  type: text("type"), // For special exercises like HIIT
  duration: text("duration"), // For timed exercises
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
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
});

export const userProfiles = pgTable("user_profiles", {
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
});

// 1. Preset Workout Plans
export const presetWorkoutPlans = pgTable("preset_workout_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalType: text("goal_type")
    .$type<"lose_weight" | "gain_muscle" | "maintain">()
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
});
