import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export async function up(db: any) {
  // Enable RLS on all tables
  await db.execute(sql`
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
    ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
    ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
    ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  `);

  // Create policies for each table
  await db.execute(sql`
    -- Users table policy
    CREATE POLICY "Users can only view their own data" ON users
      FOR ALL USING (auth.uid() = clerk_id);

    -- Workout Plans table policy
    CREATE POLICY "Users can only access their own workout plans" ON workout_plans
      FOR ALL USING (auth.uid() = (SELECT clerk_id FROM users WHERE id = user_id));

    -- Workout Days table policy
    CREATE POLICY "Users can only access workout days from their plans" ON workout_days
      FOR ALL USING (
        auth.uid() = (
          SELECT u.clerk_id 
          FROM users u 
          JOIN workout_plans wp ON wp.user_id = u.id 
          WHERE wp.id = plan_id
        )
      );

    -- Exercises table policy
    CREATE POLICY "Users can only access exercises from their plans" ON exercises
      FOR ALL USING (
        auth.uid() = (
          SELECT u.clerk_id 
          FROM users u 
          JOIN workout_plans wp ON wp.user_id = u.id 
          JOIN workout_days wd ON wd.plan_id = wp.id 
          WHERE wd.id = day_id
        )
      );

    -- Workout Logs table policy
    CREATE POLICY "Users can only access their own workout logs" ON workout_logs
      FOR ALL USING (auth.uid() = (SELECT clerk_id FROM users WHERE id = user_id));

    -- User Profiles table policy
    CREATE POLICY "Users can only access their own profile" ON user_profiles
      FOR ALL USING (auth.uid() = (SELECT clerk_id FROM users WHERE id = user_id));
  `);
}

export async function down(db: any) {
  // Drop all policies
  await db.execute(sql`
    DROP POLICY IF EXISTS "Users can only view their own data" ON users;
    DROP POLICY IF EXISTS "Users can only access their own workout plans" ON workout_plans;
    DROP POLICY IF EXISTS "Users can only access workout days from their plans" ON workout_days;
    DROP POLICY IF EXISTS "Users can only access exercises from their plans" ON exercises;
    DROP POLICY IF EXISTS "Users can only access their own workout logs" ON workout_logs;
    DROP POLICY IF EXISTS "Users can only access their own profile" ON user_profiles;
  `);

  // Disable RLS on all tables
  await db.execute(sql`
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;
    ALTER TABLE workout_days DISABLE ROW LEVEL SECURITY;
    ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
    ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;
    ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
  `);
}
