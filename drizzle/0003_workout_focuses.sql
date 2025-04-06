-- Create workout_focuses table
CREATE TABLE workout_focuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create workout_focus_relations table
CREATE TABLE workout_focus_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  focus_id UUID NOT NULL REFERENCES workout_focuses(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(workout_id, focus_id)
);

-- Enable RLS on new tables
ALTER TABLE workout_focuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_focus_relations ENABLE ROW LEVEL SECURITY;

-- Insert default workout focuses
INSERT INTO workout_focuses (name, description) VALUES
  ('Upper Body', 'Exercises focusing on chest, back, shoulders, arms');

INSERT INTO workout_focuses (name, description) VALUES
  ('Lower Body', 'Exercises focusing on legs, glutes, and core');

INSERT INTO workout_focuses (name, description) VALUES
  ('Cardio', 'Exercises focusing on cardiovascular fitness');

INSERT INTO workout_focuses (name, description) VALUES
  ('Core', 'Exercises focusing on abdominal and lower back muscles');

INSERT INTO workout_focuses (name, description) VALUES
  ('Full Body', 'Exercises that work multiple muscle groups');

INSERT INTO workout_focuses (name, description) VALUES
  ('Strength', 'Exercises focusing on building strength');

INSERT INTO workout_focuses (name, description) VALUES
  ('Flexibility', 'Exercises focusing on improving flexibility and mobility');

INSERT INTO workout_focuses (name, description) VALUES
  ('HIIT', 'High-intensity interval training exercises');

-- Remove focus column from workout_days
ALTER TABLE workout_days DROP COLUMN focus; 