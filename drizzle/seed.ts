import { db } from "../src/db";
import {
  presetWorkoutPlans,
  presetWorkoutDays,
  presetExercises,
  exerciseCatalog,
} from "../src/db/schema";
import { eq } from "drizzle-orm";
// import { sql } from "drizzle-orm";

// Function to normalize exercise names (standardize similar naming)
function normalizeExerciseName(name: string): string {
  // Standardize names (make sure to use singular form consistently)
  const normalizations: Record<string, string> = {
    "Bodyweight Squats": "Bodyweight Squat",
    "Barbell Squats": "Barbell Squat",
    "Calf Raises": "Calf Raise",
    "Step-ups": "Step-Up",
    "Step-Ups": "Step-Up",
    "Triceps Pushdowns": "Triceps Pushdown",
    "Bent-Over Row": "Bent Over Row",
    "Bent Over Rows": "Bent Over Row",
    "Lat Pulldown Machine": "Lat Pulldown",
    "Seated Row Machine": "Seated Row",
    "Incline DB Press": "Incline Dumbbell Press",
    "Incline Bench": "Incline Bench Press",
    "Wall Push-Ups": "Wall Push-Up",
    "Push-Ups": "Push-Up",
    "Push-Ups (Knee)": "Knee Push-Up",
    "Pull-Ups": "Pull-Up",
    "Weighted Pull-Ups": "Weighted Pull-Up",
    "Box Jumps": "Box Jump",
    "Jump Squats": "Jump Squat",
    "Hanging Leg Raises": "Hanging Leg Raise",
    "Standing Calf Raises": "Standing Calf Raise",
    "Standing Side Crunches": "Standing Side Crunch",
    "Seated Russian Twists": "Seated Russian Twist",
    "Walking Lunges": "Walking Lunge",
    "Bulgarian Split Squats": "Bulgarian Split Squat",
    "Face Pulls": "Face Pull",
  };

  return normalizations[name] || name;
}

async function ensureExerciseInCatalog(name: string): Promise<string> {
  // Normalize the exercise name first
  const normalizedName = normalizeExerciseName(name);

  // Check if exercise already exists in catalog
  const existingExercise = await db
    .select({ id: exerciseCatalog.id })
    .from(exerciseCatalog)
    .where(eq(exerciseCatalog.name, normalizedName))
    .limit(1);

  if (existingExercise.length > 0) {
    return existingExercise[0].id;
  }

  // Insert new exercise into catalog
  const [newExercise] = await db
    .insert(exerciseCatalog)
    .values({
      name: normalizedName,
      // Categorize based on name keywords
      category: categorizeExercise(normalizedName),
    })
    .returning({ id: exerciseCatalog.id });

  return newExercise.id;
}

// Helper function to categorize exercises based on name
function categorizeExercise(
  name: string
): "upper_body" | "lower_body" | "core" | "cardio" | "full_body" | "other" {
  const lowerName = name.toLowerCase();

  // Upper body exercises
  if (
    lowerName.includes("bench") ||
    (lowerName.includes("press") && !lowerName.includes("leg press")) ||
    lowerName.includes("curl") ||
    lowerName.includes("row") ||
    lowerName.includes("pull") ||
    lowerName.includes("push") ||
    lowerName.includes("fly") ||
    (lowerName.includes("raise") && !lowerName.includes("leg raise")) ||
    lowerName.includes("dip") ||
    lowerName.includes("skull") ||
    lowerName.includes("tricep") ||
    lowerName.includes("bicep") ||
    lowerName.includes("shoulder") ||
    lowerName.includes("chest") ||
    lowerName.includes("back")
  ) {
    return "upper_body";
  }

  // Lower body exercises
  if (
    lowerName.includes("squat") ||
    lowerName.includes("leg") ||
    lowerName.includes("lunge") ||
    lowerName.includes("deadlift") ||
    lowerName.includes("calf") ||
    lowerName.includes("glute") ||
    lowerName.includes("hip") ||
    lowerName.includes("hamstring") ||
    lowerName.includes("quad") ||
    lowerName.includes("leg press") ||
    lowerName === "leg press" ||
    lowerName === "leg press machine" ||
    lowerName === "seated leg press"
  ) {
    return "lower_body";
  }

  // Core exercises
  if (
    lowerName.includes("plank") ||
    lowerName.includes("crunch") ||
    lowerName.includes("ab") ||
    lowerName.includes("twist") ||
    lowerName.includes("sit-up") ||
    lowerName.includes("situp") ||
    lowerName.includes("dragon flag") ||
    lowerName.includes("leg raise") ||
    lowerName.includes("hanging leg raise")
  ) {
    return "core";
  }

  // Cardio exercises
  if (
    lowerName.includes("jump") ||
    lowerName.includes("run") ||
    lowerName.includes("jog") ||
    lowerName.includes("sprint") ||
    lowerName.includes("burpee") ||
    (lowerName.includes("rope") && !lowerName.includes("battle rope")) ||
    lowerName.includes("bike") ||
    lowerName.includes("cycling") ||
    lowerName.includes("walking") ||
    lowerName.includes("cardio") ||
    lowerName.includes("hiit")
  ) {
    return "cardio";
  }

  // Full body exercises
  if (
    lowerName.includes("clean") ||
    lowerName.includes("snatch") ||
    lowerName.includes("swing") ||
    lowerName.includes("thruster") ||
    lowerName.includes("burpee") ||
    lowerName.includes("full body") ||
    lowerName.includes("kettlebell swing") ||
    lowerName.includes("turkish get up")
  ) {
    return "full_body";
  }

  // Special cases that need manual categorization
  const specialCases: Record<
    string,
    "upper_body" | "lower_body" | "core" | "cardio" | "full_body" | "other"
  > = {
    "Cable Crossover": "upper_body",
    "Calf Raise": "lower_body",
    "Calf Raise Machine": "lower_body",
    "Seated Leg Press": "lower_body",
    "Leg Press": "lower_body",
    "Leg Press Machine": "lower_body",
    "Battle Ropes": "upper_body",
    "Chin-Ups": "upper_body",
  };

  if (specialCases[name]) {
    return specialCases[name];
  }

  // Default to other
  return "other";
}

export async function seed() {
  console.log("🌱 Seeding expanded preset workout plans...");

  // Extract all unique exercises first to populate the catalog
  const allExercises = new Set<string>();

  const plans = [
    // Lose Weight Plans
    {
      goalType: "lose_weight",
      name: "Fat Burner Beginner",
      description: "Light cardio-focused plan with bodyweight strength work.",
      days: [
        {
          dayNumber: 1,
          focus: "Full Body Burn",
          exercises: [
            { name: "Bodyweight Squats", sets: 3, reps: "15" },
            { name: "Push-Ups (Knee)", sets: 3, reps: "10" },
            { name: "Jumping Jacks", sets: 3, reps: "30 sec" },
            { name: "Wall Sit", sets: 3, reps: "30 sec" },
            { name: "Standing Calf Raises", sets: 3, reps: "15" },
            { name: "Seated Knee Extensions", sets: 3, reps: "12" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Core + Cardio",
          exercises: [
            { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
            { name: "Plank", sets: 3, reps: "30 sec" },
            { name: "High Knees", sets: 3, reps: "30 sec" },
            { name: "Standing Side Crunches", sets: 3, reps: "12 each side" },
            { name: "Seated Russian Twists", sets: 3, reps: "12" },
            { name: "Marching in Place", sets: 3, reps: "1 min" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Upper Body + Mobility",
          exercises: [
            { name: "Wall Push-Ups", sets: 3, reps: "12" },
            { name: "Seated Row Machine", sets: 3, reps: "12" },
            { name: "Shoulder Press Machine", sets: 3, reps: "10" },
            { name: "Chest Press Machine", sets: 3, reps: "12" },
            { name: "Lat Pulldown Machine", sets: 3, reps: "12" },
            { name: "Standing Toe Touch", sets: 3, reps: "20 sec" },
          ],
        },
      ],
    },
    {
      goalType: "lose_weight",
      name: "Fat Burner Intermediate",
      description: "HIIT and compound movements to accelerate fat loss.",
      days: [
        {
          dayNumber: 1,
          focus: "Upper Body + HIIT",
          exercises: [
            { name: "Burpees", sets: 3, reps: "12" },
            { name: "Push-Ups", sets: 3, reps: "12" },
            { name: "Jump Rope", sets: 3, reps: "1 min" },
            { name: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
            { name: "TRX Rows", sets: 3, reps: "12" },
            { name: "Battle Ropes", sets: 3, reps: "30 sec" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Lower Body Strength",
          exercises: [
            { name: "Walking Lunges", sets: 3, reps: "12 each leg" },
            { name: "Bodyweight Squats", sets: 3, reps: "20" },
            { name: "Step-Ups", sets: 3, reps: "15 each leg" },
            { name: "Box Jumps", sets: 3, reps: "10" },
            { name: "Kettlebell Swings", sets: 3, reps: "15" },
            { name: "Side Lunges", sets: 3, reps: "10 each side" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Core + Cardio",
          exercises: [
            { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
            { name: "Plank", sets: 3, reps: "45 sec" },
            { name: "Russian Twists", sets: 3, reps: "20" },
            { name: "Bicycle Crunches", sets: 3, reps: "20" },
            { name: "Jump Rope", sets: 3, reps: "1 min" },
            { name: "High Knees", sets: 3, reps: "30 sec" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Full Body Circuit",
          exercises: [
            { name: "Burpees", sets: 3, reps: "10" },
            { name: "Squat Jumps", sets: 3, reps: "15" },
            { name: "Push-Ups", sets: 3, reps: "12" },
            { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
            { name: "Plank", sets: 3, reps: "45 sec" },
            { name: "Jump Rope", sets: 3, reps: "1 min" },
          ],
        },
      ],
    },
    {
      goalType: "lose_weight",
      name: "Fat Burner Advanced",
      description: "High-intensity, multi-day split with advanced movements.",
      days: [
        {
          dayNumber: 1,
          focus: "HIIT Full Body",
          exercises: [
            { name: "Burpee to Pull-Up", sets: 4, reps: "10" },
            { name: "Kettlebell Swings", sets: 4, reps: "20" },
            { name: "Jump Squats", sets: 4, reps: "15" },
            { name: "Box Jump Burpees", sets: 4, reps: "8" },
            { name: "Medicine Ball Slams", sets: 4, reps: "12" },
            { name: "Rope Climbs", sets: 3, reps: "3" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Strength + Core",
          exercises: [
            { name: "Deadlifts", sets: 4, reps: "6" },
            { name: "Plank to Push-Up", sets: 4, reps: "12" },
            { name: "Russian Twists", sets: 4, reps: "20" },
            { name: "Hanging Leg Raises", sets: 4, reps: "12" },
            { name: "Dragon Flags", sets: 3, reps: "8" },
            { name: "Weighted Plank", sets: 3, reps: "1 min" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Upper Body Power",
          exercises: [
            { name: "Weighted Pull-Ups", sets: 4, reps: "8" },
            { name: "Dips", sets: 4, reps: "10" },
            { name: "Push Press", sets: 4, reps: "6" },
            { name: "Battle Ropes", sets: 4, reps: "30 sec" },
            { name: "Medicine Ball Slams", sets: 4, reps: "12" },
            { name: "Rope Climbs", sets: 3, reps: "3" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Lower Body Power",
          exercises: [
            { name: "Box Jumps", sets: 4, reps: "10" },
            { name: "Kettlebell Swings", sets: 4, reps: "20" },
            { name: "Jump Squats", sets: 4, reps: "15" },
            { name: "Bulgarian Split Squats", sets: 3, reps: "10 each leg" },
            { name: "Romanian Deadlifts", sets: 4, reps: "8" },
            { name: "Calf Raises", sets: 4, reps: "15" },
          ],
        },
        {
          dayNumber: 5,
          focus: "Core + Endurance",
          exercises: [
            { name: "Dragon Flags", sets: 3, reps: "8" },
            { name: "Hanging Leg Raises", sets: 4, reps: "12" },
            { name: "Weighted Plank", sets: 3, reps: "1 min" },
            { name: "Russian Twists", sets: 4, reps: "20" },
            { name: "Battle Ropes", sets: 4, reps: "30 sec" },
            { name: "Rope Climbs", sets: 3, reps: "3" },
          ],
        },
      ],
    },
    {
      goalType: "lose_weight",
      name: "Fat Burner Pro",
      description:
        "Advanced HIIT and strength combination for maximum fat loss.",
      days: [
        {
          dayNumber: 1,
          focus: "HIIT Circuit",
          exercises: [
            { name: "Box Jump Burpees", sets: 4, reps: "8" },
            { name: "Kettlebell Swings", sets: 4, reps: "20" },
            { name: "Battle Ropes", sets: 4, reps: "30 sec" },
            { name: "Medicine Ball Slams", sets: 4, reps: "12" },
            { name: "Jump Rope", sets: 4, reps: "1 min" },
            { name: "Mountain Climbers", sets: 4, reps: "30 sec" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Strength Focus",
          exercises: [
            { name: "Deadlifts", sets: 4, reps: "6" },
            { name: "Weighted Pull-Ups", sets: 4, reps: "8" },
            { name: "Push Press", sets: 4, reps: "6" },
            { name: "Bulgarian Split Squats", sets: 3, reps: "10 each leg" },
            { name: "Dips", sets: 4, reps: "10" },
            { name: "Romanian Deadlifts", sets: 4, reps: "8" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Core + Power",
          exercises: [
            { name: "Dragon Flags", sets: 3, reps: "8" },
            { name: "Hanging Leg Raises", sets: 4, reps: "12" },
            { name: "Rope Climbs", sets: 3, reps: "3" },
            { name: "Weighted Plank", sets: 3, reps: "1 min" },
            { name: "Russian Twists", sets: 4, reps: "20" },
            { name: "Battle Ropes", sets: 4, reps: "30 sec" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Endurance Circuit",
          exercises: [
            { name: "Burpee to Pull-Up", sets: 4, reps: "10" },
            { name: "Box Jumps", sets: 4, reps: "10" },
            { name: "Kettlebell Swings", sets: 4, reps: "20" },
            { name: "Jump Squats", sets: 4, reps: "15" },
            { name: "Medicine Ball Slams", sets: 4, reps: "12" },
            { name: "Rope Climbs", sets: 3, reps: "3" },
          ],
        },
      ],
    },
    // Gain Muscle Plans
    {
      goalType: "gain_muscle",
      name: "Muscle Builder Beginner",
      description:
        "Foundational hypertrophy plan with machines and bodyweight.",
      days: [
        {
          dayNumber: 1,
          focus: "Push (Chest + Shoulders)",
          exercises: [
            { name: "Chest Press Machine", sets: 3, reps: "12" },
            { name: "Shoulder Press", sets: 3, reps: "10" },
            { name: "Triceps Pushdowns", sets: 3, reps: "12" },
            { name: "Pec Deck Machine", sets: 3, reps: "12" },
            { name: "Lateral Raise Machine", sets: 3, reps: "12" },
            { name: "Cable Fly", sets: 3, reps: "12" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Pull (Back + Biceps)",
          exercises: [
            { name: "Lat Pulldown", sets: 3, reps: "10" },
            { name: "Seated Row", sets: 3, reps: "10" },
            { name: "Dumbbell Curls", sets: 3, reps: "12" },
            { name: "Reverse Fly Machine", sets: 3, reps: "12" },
            { name: "Bicep Curl Machine", sets: 3, reps: "12" },
            { name: "Face Pulls", sets: 3, reps: "15" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Legs",
          exercises: [
            { name: "Leg Press Machine", sets: 3, reps: "12" },
            { name: "Leg Extension Machine", sets: 3, reps: "12" },
            { name: "Leg Curl Machine", sets: 3, reps: "12" },
            { name: "Calf Raise Machine", sets: 3, reps: "15" },
            { name: "Hip Abduction Machine", sets: 3, reps: "12" },
            { name: "Hip Adduction Machine", sets: 3, reps: "12" },
          ],
        },
      ],
    },
    {
      goalType: "gain_muscle",
      name: "Muscle Builder Intermediate",
      description: "Traditional 3-day split with progressive overload.",
      days: [
        {
          dayNumber: 1,
          focus: "Chest + Triceps",
          exercises: [
            { name: "Barbell Bench Press", sets: 4, reps: "8" },
            { name: "Incline DB Press", sets: 4, reps: "10" },
            { name: "Dips", sets: 3, reps: "12" },
            { name: "Cable Crossover", sets: 3, reps: "12" },
            { name: "Skull Crushers", sets: 3, reps: "10" },
            { name: "Close-Grip Bench Press", sets: 3, reps: "8" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Back + Biceps",
          exercises: [
            { name: "Deadlifts", sets: 4, reps: "6" },
            { name: "Pull-Ups", sets: 3, reps: "8" },
            { name: "Barbell Curls", sets: 3, reps: "10" },
            { name: "Bent Over Rows", sets: 3, reps: "10" },
            { name: "Hammer Curls", sets: 3, reps: "12" },
            { name: "Face Pulls", sets: 3, reps: "15" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Legs",
          exercises: [
            { name: "Barbell Squat", sets: 4, reps: "8" },
            { name: "Romanian Deadlifts", sets: 4, reps: "10" },
            { name: "Leg Press", sets: 4, reps: "12" },
            { name: "Bulgarian Split Squats", sets: 3, reps: "10 each leg" },
            { name: "Calf Raises", sets: 4, reps: "15" },
            { name: "Leg Extensions", sets: 3, reps: "12" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Shoulders + Arms",
          exercises: [
            { name: "Overhead Press", sets: 4, reps: "8" },
            { name: "Lateral Raises", sets: 4, reps: "12" },
            { name: "Face Pulls", sets: 4, reps: "15" },
            { name: "Barbell Curls", sets: 3, reps: "10" },
            { name: "Triceps Pushdown", sets: 3, reps: "12" },
            { name: "Hammer Curls", sets: 3, reps: "12" },
          ],
        },
      ],
    },
    {
      goalType: "gain_muscle",
      name: "Muscle Builder Advanced",
      description: "5-day push/pull/legs split with high volume.",
      days: [
        {
          dayNumber: 1,
          focus: "Push",
          exercises: [
            { name: "Incline Bench", sets: 5, reps: "8" },
            { name: "Overhead Press", sets: 5, reps: "8" },
            { name: "Skull Crushers", sets: 4, reps: "12" },
            { name: "Weighted Dips", sets: 4, reps: "8" },
            { name: "Lateral Raises", sets: 4, reps: "12" },
            { name: "Cable Fly", sets: 4, reps: "12" },
            { name: "Triceps Pushdown", sets: 4, reps: "12" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Pull",
          exercises: [
            { name: "Bent-Over Row", sets: 5, reps: "10" },
            { name: "Weighted Pull-Ups", sets: 4, reps: "8" },
            { name: "Hammer Curls", sets: 4, reps: "12" },
            { name: "T-Bar Rows", sets: 4, reps: "10" },
            { name: "Face Pulls", sets: 4, reps: "15" },
            { name: "Preacher Curls", sets: 4, reps: "10" },
            { name: "Reverse Fly", sets: 4, reps: "12" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Legs",
          exercises: [
            { name: "Barbell Squat", sets: 5, reps: "8" },
            { name: "Romanian Deadlifts", sets: 4, reps: "8" },
            { name: "Bulgarian Split Squats", sets: 4, reps: "10 each leg" },
            { name: "Leg Press", sets: 4, reps: "12" },
            { name: "Calf Raises", sets: 4, reps: "15" },
            { name: "Leg Extensions", sets: 4, reps: "12" },
            { name: "Leg Curls", sets: 4, reps: "12" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Chest + Arms",
          exercises: [
            { name: "Flat Bench Press", sets: 5, reps: "8" },
            { name: "Incline DB Press", sets: 4, reps: "10" },
            { name: "Dips", sets: 4, reps: "10" },
            { name: "Barbell Curls", sets: 4, reps: "10" },
            { name: "Skull Crushers", sets: 4, reps: "12" },
            { name: "Hammer Curls", sets: 4, reps: "12" },
            { name: "Triceps Pushdown", sets: 4, reps: "12" },
          ],
        },
        {
          dayNumber: 5,
          focus: "Back + Shoulders",
          exercises: [
            { name: "Deadlifts", sets: 5, reps: "6" },
            { name: "Pull-Ups", sets: 4, reps: "8" },
            { name: "Overhead Press", sets: 4, reps: "8" },
            { name: "Bent Over Rows", sets: 4, reps: "10" },
            { name: "Lateral Raises", sets: 4, reps: "12" },
            { name: "Face Pulls", sets: 4, reps: "15" },
            { name: "Reverse Fly", sets: 4, reps: "12" },
          ],
        },
      ],
    },
    {
      goalType: "gain_muscle",
      name: "Muscle Builder Pro",
      description: "Advanced 5-day split with emphasis on strength and size.",
      days: [
        {
          dayNumber: 1,
          focus: "Chest + Triceps",
          exercises: [
            { name: "Flat Bench Press", sets: 5, reps: "8" },
            { name: "Incline DB Press", sets: 4, reps: "10" },
            { name: "Weighted Dips", sets: 4, reps: "8" },
            { name: "Cable Fly", sets: 4, reps: "12" },
            { name: "Skull Crushers", sets: 4, reps: "12" },
            { name: "Triceps Pushdown", sets: 4, reps: "12" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Back + Biceps",
          exercises: [
            { name: "Deadlifts", sets: 5, reps: "6" },
            { name: "Weighted Pull-Ups", sets: 4, reps: "8" },
            { name: "Bent Over Rows", sets: 4, reps: "10" },
            { name: "Barbell Curls", sets: 4, reps: "10" },
            { name: "Hammer Curls", sets: 4, reps: "12" },
            { name: "Face Pulls", sets: 4, reps: "15" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Legs",
          exercises: [
            { name: "Barbell Squat", sets: 5, reps: "8" },
            { name: "Romanian Deadlifts", sets: 4, reps: "8" },
            { name: "Bulgarian Split Squats", sets: 4, reps: "10 each leg" },
            { name: "Leg Press", sets: 4, reps: "12" },
            { name: "Calf Raises", sets: 4, reps: "15" },
            { name: "Leg Extensions", sets: 4, reps: "12" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Shoulders + Arms",
          exercises: [
            { name: "Overhead Press", sets: 5, reps: "8" },
            { name: "Lateral Raises", sets: 4, reps: "12" },
            { name: "Face Pulls", sets: 4, reps: "15" },
            { name: "Barbell Curls", sets: 4, reps: "10" },
            { name: "Skull Crushers", sets: 4, reps: "12" },
            { name: "Hammer Curls", sets: 4, reps: "12" },
          ],
        },
      ],
    },
    // Maintain Plans
    {
      goalType: "maintain",
      name: "Full Body Maintenance Beginner",
      description: "Gentle all-around conditioning for habit building.",
      days: [
        {
          dayNumber: 1,
          focus: "Light Strength",
          exercises: [
            { name: "Bodyweight Squat", sets: 2, reps: "15" },
            { name: "Wall Push-Ups", sets: 2, reps: "10" },
            { name: "Step-ups", sets: 2, reps: "10 each leg" },
            { name: "Seated Leg Press", sets: 2, reps: "12" },
            { name: "Chest Press Machine", sets: 2, reps: "12" },
            { name: "Lat Pulldown Machine", sets: 2, reps: "12" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Core + Mobility",
          exercises: [
            { name: "Bird Dog", sets: 2, reps: "10" },
            { name: "Glute Bridge", sets: 2, reps: "15" },
            { name: "Standing Toe Touch", sets: 2, reps: "20 sec" },
            { name: "Seated Knee Extensions", sets: 2, reps: "12" },
            { name: "Standing Calf Raises", sets: 2, reps: "15" },
            { name: "Seated Row Machine", sets: 2, reps: "12" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Cardio + Core",
          exercises: [
            { name: "Walking", sets: 1, reps: "20 min" },
            { name: "Plank", sets: 3, reps: "30 sec" },
            { name: "Russian Twists", sets: 3, reps: "12" },
            { name: "Bicycle Crunches", sets: 3, reps: "12" },
            { name: "Standing Side Crunches", sets: 3, reps: "12 each side" },
            { name: "Seated Russian Twists", sets: 3, reps: "12" },
          ],
        },
      ],
    },
    {
      goalType: "maintain",
      name: "Full Body Maintenance Intermediate",
      description: "3x weekly circuit-based approach for overall health.",
      days: [
        {
          dayNumber: 1,
          focus: "Strength Circuit",
          exercises: [
            { name: "Goblet Squat", sets: 3, reps: "12" },
            { name: "Push-Ups", sets: 3, reps: "12" },
            { name: "Plank", sets: 3, reps: "45 sec" },
            { name: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
            { name: "Bent Over Rows", sets: 3, reps: "10" },
            { name: "Russian Twists", sets: 3, reps: "20" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Cardio + Core",
          exercises: [
            { name: "Cycling", sets: 1, reps: "15 min" },
            { name: "Sit-Ups", sets: 3, reps: "20" },
            { name: "Russian Twists", sets: 3, reps: "20" },
            { name: "Jump Rope", sets: 3, reps: "1 min" },
            { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
            { name: "Burpees", sets: 3, reps: "10" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Full Body Strength",
          exercises: [
            { name: "Dumbbell Squat", sets: 3, reps: "12" },
            { name: "Dumbbell Bench Press", sets: 3, reps: "12" },
            { name: "Dumbbell Rows", sets: 3, reps: "12" },
            { name: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
            { name: "Dumbbell Curls", sets: 3, reps: "12" },
            { name: "Triceps Extensions", sets: 3, reps: "12" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Core + Cardio",
          exercises: [
            { name: "Plank", sets: 3, reps: "45 sec" },
            { name: "Russian Twists", sets: 3, reps: "20" },
            { name: "Bicycle Crunches", sets: 3, reps: "20" },
            { name: "Jump Rope", sets: 3, reps: "1 min" },
            { name: "Mountain Climbers", sets: 3, reps: "30 sec" },
            { name: "Burpees", sets: 3, reps: "10" },
          ],
        },
      ],
    },
    {
      goalType: "maintain",
      name: "Full Body Maintenance Advanced",
      description: "Balanced strength and conditioning split.",
      days: [
        {
          dayNumber: 1,
          focus: "Upper Body Strength",
          exercises: [
            { name: "Push Press", sets: 4, reps: "6" },
            { name: "Chin-Ups", sets: 4, reps: "10" },
            { name: "Lateral Raises", sets: 4, reps: "15" },
            { name: "Barbell Rows", sets: 4, reps: "8" },
            { name: "Dips", sets: 4, reps: "10" },
            { name: "Face Pulls", sets: 4, reps: "15" },
            { name: "Hanging Leg Raises", sets: 4, reps: "12" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Lower Body Strength",
          exercises: [
            { name: "Front Squat", sets: 4, reps: "6" },
            { name: "Glute Ham Raise", sets: 3, reps: "10" },
            { name: "Calf Raise", sets: 4, reps: "20" },
            { name: "Bulgarian Split Squats", sets: 3, reps: "10 each leg" },
            { name: "Romanian Deadlifts", sets: 4, reps: "8" },
            { name: "Box Jumps", sets: 3, reps: "10" },
            { name: "Weighted Plank", sets: 3, reps: "1 min" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Core + Cardio",
          exercises: [
            { name: "Dragon Flags", sets: 3, reps: "8" },
            { name: "Hanging Leg Raises", sets: 4, reps: "12" },
            { name: "Russian Twists", sets: 4, reps: "20" },
            { name: "Battle Ropes", sets: 4, reps: "30 sec" },
            { name: "Jump Rope", sets: 4, reps: "1 min" },
            { name: "Burpees", sets: 4, reps: "10" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Full Body Power",
          exercises: [
            { name: "Clean and Press", sets: 4, reps: "6" },
            { name: "Box Jumps", sets: 4, reps: "10" },
            { name: "Kettlebell Swings", sets: 4, reps: "20" },
            { name: "Medicine Ball Slams", sets: 4, reps: "12" },
            { name: "Battle Ropes", sets: 4, reps: "30 sec" },
            { name: "Burpees", sets: 4, reps: "10" },
          ],
        },
        {
          dayNumber: 5,
          focus: "Strength + Mobility",
          exercises: [
            { name: "Overhead Press", sets: 4, reps: "8" },
            { name: "Pull-Ups", sets: 4, reps: "10" },
            { name: "Front Squat", sets: 4, reps: "8" },
            { name: "Romanian Deadlifts", sets: 4, reps: "8" },
            { name: "Face Pulls", sets: 4, reps: "15" },
            { name: "Weighted Plank", sets: 3, reps: "1 min" },
          ],
        },
      ],
    },
    {
      goalType: "maintain",
      name: "Full Body Maintenance Pro",
      description:
        "Advanced maintenance program with emphasis on strength and mobility.",
      days: [
        {
          dayNumber: 1,
          focus: "Upper Body Power",
          exercises: [
            { name: "Push Press", sets: 4, reps: "6" },
            { name: "Weighted Pull-Ups", sets: 4, reps: "8" },
            { name: "Dips", sets: 4, reps: "10" },
            { name: "Barbell Rows", sets: 4, reps: "8" },
            { name: "Lateral Raises", sets: 4, reps: "12" },
            { name: "Face Pulls", sets: 4, reps: "15" },
          ],
        },
        {
          dayNumber: 2,
          focus: "Lower Body Power",
          exercises: [
            { name: "Front Squat", sets: 4, reps: "6" },
            { name: "Romanian Deadlifts", sets: 4, reps: "8" },
            { name: "Bulgarian Split Squats", sets: 3, reps: "10 each leg" },
            { name: "Box Jumps", sets: 4, reps: "10" },
            { name: "Calf Raises", sets: 4, reps: "15" },
            { name: "Weighted Plank", sets: 3, reps: "1 min" },
          ],
        },
        {
          dayNumber: 3,
          focus: "Core + Cardio",
          exercises: [
            { name: "Dragon Flags", sets: 3, reps: "8" },
            { name: "Hanging Leg Raises", sets: 4, reps: "12" },
            { name: "Russian Twists", sets: 4, reps: "20" },
            { name: "Battle Ropes", sets: 4, reps: "30 sec" },
            { name: "Jump Rope", sets: 4, reps: "1 min" },
            { name: "Burpees", sets: 4, reps: "10" },
          ],
        },
        {
          dayNumber: 4,
          focus: "Full Body Strength",
          exercises: [
            { name: "Clean and Press", sets: 4, reps: "6" },
            { name: "Front Squat", sets: 4, reps: "8" },
            { name: "Weighted Pull-Ups", sets: 4, reps: "8" },
            { name: "Dips", sets: 4, reps: "10" },
            { name: "Romanian Deadlifts", sets: 4, reps: "8" },
            { name: "Face Pulls", sets: 4, reps: "15" },
          ],
        },
      ],
    },
  ];

  // Extract all unique exercise names
  plans.forEach((plan) => {
    plan.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        allExercises.add(normalizeExerciseName(exercise.name));
      });
    });
  });

  console.log(
    `Found ${allExercises.size} unique exercises. Adding to catalog...`
  );

  // Add all exercises to the catalog
  const exerciseIdMap = new Map<string, string>();
  const nameToIdMap = new Map<string, string>();
  for (const exerciseName of allExercises) {
    const id = await ensureExerciseInCatalog(exerciseName);
    nameToIdMap.set(exerciseName, id);
  }

  console.log(
    `✅ Exercise catalog populated with ${allExercises.size} exercises.`
  );

  // Now create the workout plans with references to the exercise catalog
  for (const plan of plans) {
    const [insertedPlan] = await db
      .insert(presetWorkoutPlans)
      .values({
        name: plan.name,
        description: plan.description,
        goalType: plan.goalType as "lose_weight" | "gain_muscle" | "maintain",
      })
      .returning({ id: presetWorkoutPlans.id });

    for (const day of plan.days) {
      const [insertedDay] = await db
        .insert(presetWorkoutDays)
        .values({
          presetPlanId: insertedPlan.id,
          dayNumber: day.dayNumber,
          focus: day.focus,
        })
        .returning({ id: presetWorkoutDays.id });

      await db.insert(presetExercises).values(
        day.exercises.map((ex) => ({
          presetDayId: insertedDay.id,
          exerciseId: nameToIdMap.get(normalizeExerciseName(ex.name))!, // Get ID from the catalog using normalized name
          sets: ex.sets,
          reps: ex.reps,
        }))
      );
    }
  }

  console.log("✅ Expanded preset plans seeded.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
