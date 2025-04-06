CREATE TABLE "exercise_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_catalog_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "exercise_catalog" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_focus_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"focus_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_focus_relations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_focuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_focuses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_day_id_workout_days_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_days" DROP CONSTRAINT "workout_days_plan_id_workout_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_plans" DROP CONSTRAINT "workout_plans_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "exercise_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "preset_exercises" ADD COLUMN "exercise_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_focus_relations" ADD CONSTRAINT "workout_focus_relations_workout_id_workout_days_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_focus_relations" ADD CONSTRAINT "workout_focus_relations_focus_id_workout_focuses_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."workout_focuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_exercise_id_exercise_catalog_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_day_id_workout_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preset_exercises" ADD CONSTRAINT "preset_exercises_exercise_id_exercise_catalog_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_days" ADD CONSTRAINT "workout_days_plan_id_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "preset_exercises" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "workout_days" DROP COLUMN "focus";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
CREATE POLICY "Exercise catalog is public" ON "exercise_catalog" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Users can view their own focus relations" ON "workout_focus_relations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = workout_id)));--> statement-breakpoint
CREATE POLICY "Users can create their own focus relations" ON "workout_focus_relations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = workout_id)));--> statement-breakpoint
CREATE POLICY "Users can update their own focus relations" ON "workout_focus_relations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = workout_id)));--> statement-breakpoint
CREATE POLICY "Users can delete their own focus relations" ON "workout_focus_relations" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = workout_id)));--> statement-breakpoint
CREATE POLICY "Focuses are public" ON "workout_focuses" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);