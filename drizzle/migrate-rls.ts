import { db } from "../src/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function applyRLSPolicies() {
  try {
    console.log("Applying RLS policies...");

    // Read the SQL file
    const sqlFile = path.join(__dirname, "0003_rls_policies.sql");
    const sqlContent = fs.readFileSync(sqlFile, "utf8");

    // Split the content into individual statements
    const statements = sqlContent
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Execute each statement separately
    for (const statement of statements) {
      await db.execute(sql.raw(statement));
    }

    console.log("RLS policies applied successfully!");
  } catch (error) {
    console.error("Failed to apply RLS policies:", error);
    process.exit(1);
  }
}

applyRLSPolicies();
