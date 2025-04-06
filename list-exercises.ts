import { db } from "./src/db";
import { exerciseCatalog } from "./src/db/schema";

async function main() {
  try {
    const exercises = await db
      .select()
      .from(exerciseCatalog)
      .orderBy(exerciseCatalog.name);
    console.log(`Total unique exercises: ${exercises.length}`);
    console.log(exercises.map((e) => `${e.name} (${e.category})`).join("\n"));
  } catch (error) {
    console.error("Error fetching exercises:", error);
  }
}

main();
