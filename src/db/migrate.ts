import { sql } from "./index";
import fs from "fs";
import path from "path";

async function runMigration() {
  try {
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "0002_rls_policies.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("Running RLS policies migration...");
    // Split the SQL file into individual statements and execute them
    const statements = migrationSQL.split(";").filter((stmt) => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await sql`${statement}`;
      }
    }
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
