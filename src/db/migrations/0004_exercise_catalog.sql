-- Create exercise_catalog table
CREATE TABLE exercise_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enable RLS on new table
ALTER TABLE exercise_catalog ENABLE ROW LEVEL SECURITY;

-- Create public read policy for exercise catalog
CREATE POLICY "Exercise catalog is public" ON exercise_catalog
  FOR SELECT TO authenticated USING (true);

-- Modify exercises table to reference exercise_catalog
ALTER TABLE exercises DROP COLUMN name;
ALTER TABLE exercises ADD COLUMN exercise_id UUID NOT NULL REFERENCES exercise_catalog(id);

-- Modify preset_exercises table to reference exercise_catalog
ALTER TABLE preset_exercises DROP COLUMN name;
ALTER TABLE preset_exercises ADD COLUMN exercise_id UUID NOT NULL REFERENCES exercise_catalog(id);

-- Create a temporary function to ensure exercise names are consistent
CREATE OR REPLACE FUNCTION ensure_exercise_catalog_entry(ex_name TEXT)
RETURNS UUID AS $$
DECLARE
  catalog_id UUID;
BEGIN
  -- Try to find existing entry
  SELECT id INTO catalog_id FROM exercise_catalog WHERE name = ex_name;
  
  -- If not found, insert new entry
  IF catalog_id IS NULL THEN
    INSERT INTO exercise_catalog (name) VALUES (ex_name) RETURNING id INTO catalog_id;
  END IF;
  
  RETURN catalog_id;
END;
$$ LANGUAGE plpgsql;

-- Note: After this migration, the seed script will need to insert all exercise names
-- and update references in the exercises and preset_exercises tables
