// ExerciseDB API Type Definitions
// Based on https://exercisedb.p.rapidapi.com

// Body Parts available in ExerciseDB
export type ExerciseDBBodyPart =
  | "back"
  | "cardio"
  | "chest"
  | "lower arms"
  | "lower legs"
  | "neck"
  | "shoulders"
  | "upper arms"
  | "upper legs"
  | "waist";

// Target muscles available in ExerciseDB
export type ExerciseDBTarget =
  | "abductors"
  | "abs"
  | "adductors"
  | "biceps"
  | "calves"
  | "cardiovascular system"
  | "delts"
  | "forearms"
  | "glutes"
  | "hamstrings"
  | "lats"
  | "levator scapulae"
  | "pectorals"
  | "quads"
  | "serratus anterior"
  | "spine"
  | "traps"
  | "triceps"
  | "upper back";

// Equipment types available in ExerciseDB
export type ExerciseDBEquipment =
  | "assisted"
  | "band"
  | "barbell"
  | "body weight"
  | "bosu ball"
  | "cable"
  | "dumbbell"
  | "elliptical machine"
  | "ez barbell"
  | "hammer"
  | "kettlebell"
  | "leverage machine"
  | "medicine ball"
  | "olympic barbell"
  | "resistance band"
  | "roller"
  | "rope"
  | "skierg machine"
  | "sled machine"
  | "smith machine"
  | "stability ball"
  | "stationary bike"
  | "stepmill machine"
  | "tire"
  | "trap bar"
  | "upper body ergometer"
  | "weighted"
  | "wheel roller";

// Difficulty levels
export type ExerciseDBDifficulty = "beginner" | "intermediate" | "advanced";

// Category types
export type ExerciseDBCategory = "strength" | "cardio" | "flexibility" | "other";

// Main Exercise type from ExerciseDB API
export interface ExerciseDBExercise {
  id: string;
  name: string;
  bodyPart: ExerciseDBBodyPart;
  equipment: ExerciseDBEquipment;
  target: ExerciseDBTarget;
  secondaryMuscles: string[];
  instructions: string[];
  description: string;
  difficulty: ExerciseDBDifficulty;
  category: ExerciseDBCategory;
}

// API Response types for different endpoints

// GET /exercises - Get all exercises (paginated)
export interface ExerciseDBListParams {
  limit?: number;
  offset?: number;
}

// GET /exercises/bodyPart/:bodyPart - Get exercises by body part
export interface ExerciseDBBodyPartParams {
  bodyPart: ExerciseDBBodyPart;
  limit?: number;
  offset?: number;
}

// GET /exercises/target/:target - Get exercises by target muscle
export interface ExerciseDBTargetParams {
  target: ExerciseDBTarget;
  limit?: number;
  offset?: number;
}

// GET /exercises/equipment/:equipment - Get exercises by equipment
export interface ExerciseDBEquipmentParams {
  equipment: ExerciseDBEquipment;
  limit?: number;
  offset?: number;
}

// GET /exercises/name/:name - Get exercise by name
export interface ExerciseDBNameParams {
  name: string;
}

// Response type for list endpoints
export type ExerciseDBListResponse = ExerciseDBExercise[];

// Response type for body part list endpoint
export type ExerciseDBBodyPartListResponse = ExerciseDBBodyPart[];

// Response type for target list endpoint
export type ExerciseDBTargetListResponse = ExerciseDBTarget[];

// Response type for equipment list endpoint
export type ExerciseDBEquipmentListResponse = ExerciseDBEquipment[];

// Mapper to convert ExerciseDB categories to our internal categories
export const mapExerciseDBBodyPartToCategory = (
  bodyPart: ExerciseDBBodyPart
): "upper_body" | "lower_body" | "core" | "cardio" | "full_body" | "other" => {
  const mapping: Record<
    ExerciseDBBodyPart,
    "upper_body" | "lower_body" | "core" | "cardio" | "full_body" | "other"
  > = {
    back: "upper_body",
    chest: "upper_body",
    "lower arms": "upper_body",
    neck: "upper_body",
    shoulders: "upper_body",
    "upper arms": "upper_body",
    "lower legs": "lower_body",
    "upper legs": "lower_body",
    waist: "core",
    cardio: "cardio",
  };

  return mapping[bodyPart] || "other";
};

// Helper to convert ExerciseDB exercise to our internal format
export interface ExerciseCatalogEntry {
  id?: string;
  name: string;
  category: "upper_body" | "lower_body" | "core" | "cardio" | "full_body" | "other";
  description: string;
  // Additional metadata from ExerciseDB
  metadata?: {
    bodyPart: ExerciseDBBodyPart;
    equipment: ExerciseDBEquipment;
    target: ExerciseDBTarget;
    secondaryMuscles: string[];
    instructions: string[];
    difficulty: ExerciseDBDifficulty;
    exerciseDBId: string;
  };
}

export const mapExerciseDBToInternal = (
  exercise: ExerciseDBExercise
): ExerciseCatalogEntry => ({
  name: exercise.name,
  category: mapExerciseDBBodyPartToCategory(exercise.bodyPart),
  description: exercise.description,
  metadata: {
    bodyPart: exercise.bodyPart,
    equipment: exercise.equipment,
    target: exercise.target,
    secondaryMuscles: exercise.secondaryMuscles,
    instructions: exercise.instructions,
    difficulty: exercise.difficulty,
    exerciseDBId: exercise.id,
  },
});
