ALTER TABLE "exercises" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workout_days" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workout_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workout_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "view own exercises" ON "exercises" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = day_id)));--> statement-breakpoint
CREATE POLICY "create exercises" ON "exercises" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = day_id)));--> statement-breakpoint
CREATE POLICY "update own exercises" ON "exercises" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = day_id)));--> statement-breakpoint
CREATE POLICY "delete own exercises" ON "exercises" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id join workout_days wd on wd.plan_id = wp.id where wd.id = day_id)));--> statement-breakpoint
CREATE POLICY "view own profile" ON "user_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "create profile" ON "user_profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "update own profile" ON "user_profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "delete own profile" ON "user_profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "view own user" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = clerk_id));--> statement-breakpoint
CREATE POLICY "update own user" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = clerk_id));--> statement-breakpoint
CREATE POLICY "view own days" ON "workout_days" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id where wp.id = plan_id)));--> statement-breakpoint
CREATE POLICY "create days" ON "workout_days" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id where wp.id = plan_id)));--> statement-breakpoint
CREATE POLICY "update own days" ON "workout_days" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id where wp.id = plan_id)));--> statement-breakpoint
CREATE POLICY "delete own days" ON "workout_days" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = (select u.clerk_id from users u join workout_plans wp on wp.user_id = u.id where wp.id = plan_id)));--> statement-breakpoint
CREATE POLICY "view own logs" ON "workout_logs" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "create logs" ON "workout_logs" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "update own logs" ON "workout_logs" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "delete own logs" ON "workout_logs" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "view own plans" ON "workout_plans" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "create plans" ON "workout_plans" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "update own plans" ON "workout_plans" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));--> statement-breakpoint
CREATE POLICY "delete own plans" ON "workout_plans" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = (select clerk_id from users where id = user_id)));