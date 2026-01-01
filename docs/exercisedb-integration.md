# ExerciseDB API Integration

This document describes the ExerciseDB API integration and how to use it in development.

## MCP Server Setup

The ExerciseDB MCP server is configured in [.mcp.json](.mcp.json) for development use.

### Configuration

```json
{
  "mcpServers": {
    "exercisedb": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.rapidapi.com",
        "--header",
        "x-api-host: exercisedb.p.rapidapi.com",
        "--header",
        "x-api-key: YOUR_API_KEY"
      ]
    }
  }
}
```

### Using the MCP Server in Development

The MCP server is available when running Claude Code in development mode. It provides direct access to the ExerciseDB API through the MCP protocol.

## API Client

The production code uses direct fetch requests to the ExerciseDB API through the `ExerciseDBClient` class defined in [src/trpc/routers/exercise-catalog.ts](../src/trpc/routers/exercise-catalog.ts).

### Environment Variable

Set `EXERCISEDB_API_KEY` in your `.env` file:

```bash
EXERCISEDB_API_KEY=your_rapidapi_key_here
```

## Type Definitions

All ExerciseDB types are defined in [src/types/exercisedb.ts](../src/types/exercisedb.ts).

### Main Types

- `ExerciseDBBodyPart` - Body part categories (back, cardio, chest, etc.)
- `ExerciseDBTarget` - Target muscle groups (abs, biceps, quads, etc.)
- `ExerciseDBEquipment` - Equipment types (barbell, dumbbell, body weight, etc.)
- `ExerciseDBDifficulty` - Difficulty levels (beginner, intermediate, advanced)
- `ExerciseDBExercise` - Main exercise object

### Exercise Object Structure

```typescript
interface ExerciseDBExercise {
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
```

## Available API Endpoints

All endpoints are available through tRPC procedures in the `exerciseCatalogRouter`.

### 1. Get Exercises by Body Part

```typescript
trpc.exerciseCatalog.exerciseDBByBodyPart.useQuery({
  bodyPart: "chest",
  limit: 10,
  offset: 0
});
```

**Body Parts:**
- back
- cardio
- chest
- lower arms
- lower legs
- neck
- shoulders
- upper arms
- upper legs
- waist

### 2. Get Exercises by Target Muscle

```typescript
trpc.exerciseCatalog.exerciseDBByTarget.useQuery({
  target: "abs",
  limit: 10,
  offset: 0
});
```

**Target Muscles:**
- abductors, abs, adductors
- biceps, triceps
- calves, quads, hamstrings, glutes
- cardiovascular system
- delts, traps
- forearms
- lats, upper back
- levator scapulae
- pectorals
- serratus anterior
- spine

### 3. Get Exercises by Equipment

```typescript
trpc.exerciseCatalog.exerciseDBByEquipment.useQuery({
  equipment: "dumbbell",
  limit: 10,
  offset: 0
});
```

**Equipment Types:**
- assisted, band, barbell, body weight
- bosu ball, cable, dumbbell
- elliptical machine, ez barbell
- hammer, kettlebell
- leverage machine, medicine ball
- olympic barbell, resistance band
- roller, rope
- skierg machine, sled machine, smith machine
- stability ball, stationary bike, stepmill machine
- tire, trap bar
- upper body ergometer, weighted, wheel roller

### 4. Get All Exercises (Paginated)

```typescript
trpc.exerciseCatalog.exerciseDBGetAll.useQuery({
  limit: 10,
  offset: 0
});
```

### 5. Get Exercise by Name

```typescript
trpc.exerciseCatalog.exerciseDBByName.useQuery({
  name: "3/4 sit-up"
});
```

### 6. Get Exercise by ID

```typescript
trpc.exerciseCatalog.exerciseDBById.useQuery({
  id: "0001"
});
```

### 7. Get Lists of Available Options

```typescript
// Get all body parts
trpc.exerciseCatalog.exerciseDBBodyPartList.useQuery();

// Get all target muscles
trpc.exerciseCatalog.exerciseDBTargetList.useQuery();

// Get all equipment types
trpc.exerciseCatalog.exerciseDBEquipmentList.useQuery();
```

## Example Usage in React Component

```tsx
import { useTRPC } from "@/trpc/client";

export function ExerciseList() {
  const trpc = useTRPC();

  const { data: exercises, isLoading } = trpc.exerciseCatalog.exerciseDBByBodyPart.useQuery({
    bodyPart: "chest",
    limit: 20
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {exercises?.map(exercise => (
        <div key={exercise.id}>
          <h3>{exercise.name}</h3>
          <p>{exercise.description}</p>
          <ul>
            {exercise.instructions.map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## Mapping to Internal Categories

The helper function `mapExerciseDBBodyPartToCategory` converts ExerciseDB body parts to our internal category system:

```typescript
import { mapExerciseDBBodyPartToCategory } from "@/types/exercisedb";

const internalCategory = mapExerciseDBBodyPartToCategory("chest");
// Returns: "upper_body"
```

**Mapping:**
- back, chest, lower arms, neck, shoulders, upper arms → `upper_body`
- lower legs, upper legs → `lower_body`
- waist → `core`
- cardio → `cardio`

## Converting ExerciseDB to Internal Format

Use the `mapExerciseDBToInternal` helper to convert ExerciseDB exercises to your internal format:

```typescript
import { mapExerciseDBToInternal } from "@/types/exercisedb";

const internalExercise = mapExerciseDBToInternal(exerciseDBExercise);
// Returns: ExerciseCatalogEntry with metadata
```

## Testing with MCP Server

When developing with Claude Code, you can use the MCP server to:
1. Explore available exercises
2. Test API responses
3. Verify data structures
4. Build queries interactively

The MCP server provides the same endpoints as the production API client but through the MCP protocol for easier development.
