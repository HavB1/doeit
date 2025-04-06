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