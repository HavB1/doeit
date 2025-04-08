import { db } from "../src/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function applyPresetRLSPolicies() {
  try {
    console.log("Applying RLS policies for preset tables...");

    // Read the SQL file
    const sqlFile = path.join(__dirname, "0004_preset_rls_policies.sql");
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

    console.log("RLS policies for preset tables applied successfully!");
  } catch (error) {
    console.error("Failed to apply RLS policies for preset tables:", error);
    process.exit(1);
  }
}

applyPresetRLSPolicies();
