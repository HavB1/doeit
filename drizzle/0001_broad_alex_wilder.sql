CREATE TABLE "preset_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"preset_day_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sets" integer NOT NULL,
	"reps" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preset_workout_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"preset_plan_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"focus" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preset_workout_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "activity_level" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "weekly_gym_goal" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "daily_calories" numeric;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "daily_protein" numeric;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD COLUMN "goal_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "preset_exercises" ADD CONSTRAINT "preset_exercises_preset_day_id_preset_workout_days_id_fk" FOREIGN KEY ("preset_day_id") REFERENCES "public"."preset_workout_days"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preset_workout_days" ADD CONSTRAINT "preset_workout_days_preset_plan_id_preset_workout_plans_id_fk" FOREIGN KEY ("preset_plan_id") REFERENCES "public"."preset_workout_plans"("id") ON DELETE no action ON UPDATE no action;