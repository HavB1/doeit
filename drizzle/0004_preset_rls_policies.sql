-- Enable RLS on preset tables
ALTER TABLE preset_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_exercises ENABLE ROW LEVEL SECURITY;

-- Create public read policies for preset tables
CREATE POLICY "Preset plans are public" ON preset_workout_plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Preset days are public" ON preset_workout_days
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Preset exercises are public" ON preset_exercises
  FOR SELECT TO authenticated USING (true); 