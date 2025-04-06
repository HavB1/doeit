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

-- Create policies for workout_focuses
CREATE POLICY "Focuses are public" ON workout_focuses
  FOR SELECT TO authenticated USING (true);

-- Create policies for workout_focus_relations
CREATE POLICY "Users can view their own focus relations" ON workout_focus_relations
  FOR SELECT TO authenticated USING (
    auth.uid() = (
      SELECT u.clerk_id 
      FROM users u 
      JOIN workout_plans wp ON wp.user_id = u.id 
      JOIN workout_days wd ON wd.plan_id = wp.id 
      WHERE wd.id = workout_id
    )
  );

CREATE POLICY "Users can create their own focus relations" ON workout_focus_relations
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = (
      SELECT u.clerk_id 
      FROM users u 
      JOIN workout_plans wp ON wp.user_id = u.id 
      JOIN workout_days wd ON wd.plan_id = wp.id 
      WHERE wd.id = workout_id
    )
  );

CREATE POLICY "Users can update their own focus relations" ON workout_focus_relations
  FOR UPDATE TO authenticated USING (
    auth.uid() = (
      SELECT u.clerk_id 
      FROM users u 
      JOIN workout_plans wp ON wp.user_id = u.id 
      JOIN workout_days wd ON wd.plan_id = wp.id 
      WHERE wd.id = workout_id
    )
  );

CREATE POLICY "Users can delete their own focus relations" ON workout_focus_relations
  FOR DELETE TO authenticated USING (
    auth.uid() = (
      SELECT u.clerk_id 
      FROM users u 
      JOIN workout_plans wp ON wp.user_id = u.id 
      JOIN workout_days wd ON wd.plan_id = wp.id 
      WHERE wd.id = workout_id
    )
  );

-- Insert default workout focuses
INSERT INTO workout_focuses (name, description) VALUES
  ('Upper Body', 'Exercises focusing on chest, back, shoulders, arms'),
  ('Lower Body', 'Exercises focusing on legs, glutes, and core'),
  ('Cardio', 'Exercises focusing on cardiovascular fitness'),
  ('Core', 'Exercises focusing on abdominal and lower back muscles'),
  ('Full Body', 'Exercises that work multiple muscle groups'),
  ('Strength', 'Exercises focusing on building strength'),
  ('Flexibility', 'Exercises focusing on improving flexibility and mobility'),
  ('HIIT', 'High-intensity interval training exercises');

-- Remove focus column from workout_days
ALTER TABLE workout_days DROP COLUMN focus; 