import { db } from "../src/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function applyExerciseCatalogMigration() {
  try {
    console.log("Applying Exercise Catalog migration...");

    // Check if exercise_catalog table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'exercise_catalog'
      );
    `);

    const catalogExists = tableExists.rows[0].exists;

    if (catalogExists) {
      console.log(
        "Exercise catalog table already exists. Skipping table creation."
      );

      // Check if we need to do column migrations
      const columnsExist = await db.execute(sql`
        SELECT 
          EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'exercises' AND column_name = 'exercise_id') as exercises_col,
          EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'preset_exercises' AND column_name = 'exercise_id') as preset_col;
      `);

      const exercisesColExists = columnsExist.rows[0].exercises_col;
      const presetColExists = columnsExist.rows[0].preset_col;

      // Execute remaining migration statements that might be needed
      if (!exercisesColExists) {
        console.log("Adding exercise_id to exercises table...");
        await db.execute(sql`
          ALTER TABLE exercises ADD COLUMN exercise_id UUID REFERENCES exercise_catalog(id);
          ALTER TABLE exercises DROP COLUMN name;
        `);
      }

      if (!presetColExists) {
        console.log("Adding exercise_id to preset_exercises table...");
        await db.execute(sql`
          ALTER TABLE preset_exercises ADD COLUMN exercise_id UUID REFERENCES exercise_catalog(id);
          ALTER TABLE preset_exercises DROP COLUMN name;
        `);
      }
    } else {
      // Read the SQL file for initial creation
      const sqlFile = path.join(
        __dirname,
        "../src/db/migrations/0004_exercise_catalog.sql"
      );
      const sqlContent = fs.readFileSync(sqlFile, "utf8");

      // Split the content into individual statements
      const statements = sqlContent
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Execute each statement separately
      for (const statement of statements) {
        await db.execute(sql.raw(statement + ";"));
      }
    }

    console.log("Exercise Catalog migration applied successfully!");
  } catch (error) {
    console.error("Failed to apply Exercise Catalog migration:", error);
    process.exit(1);
  }
}

applyExerciseCatalogMigration();
