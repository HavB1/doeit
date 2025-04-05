import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// import ws from "ws";

// neonConfig.webSocketConstructor = ws;

import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL!;

if (!dbUrl) {
  throw new Error("Database URL is not set");
}

// const pool = new Pool({ connectionString: dbUrl });

export const sql = neon(dbUrl);

export const db = drizzle({
  client: sql,
  schema,
});
