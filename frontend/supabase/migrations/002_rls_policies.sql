-- Row Level Security (RLS) Policies for SWoT Database
-- These policies ensure data isolation between users

-- Users table policies
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Workouts table policies
-- Users can only access their own workouts
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Exercises table policies
-- Users can only access exercises from their own workouts
CREATE POLICY "Users can view own exercises" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercises" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises" ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercises" ON exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Sets table policies
-- Users can only access sets from their own exercises
CREATE POLICY "Users can view own sets" ON sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own sets" ON sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sets" ON sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own sets" ON sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Routines table policies
-- Users can access their own routines and public routines
CREATE POLICY "Users can view own and public routines" ON routines
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id);

-- Exercise definitions table policies
-- Users can view all exercise definitions, but only modify their custom ones
CREATE POLICY "Anyone can view exercise definitions" ON exercise_definitions
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert custom exercise definitions" ON exercise_definitions
  FOR INSERT WITH CHECK (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can update own custom exercise definitions" ON exercise_definitions
  FOR UPDATE USING (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can delete own custom exercise definitions" ON exercise_definitions
  FOR DELETE USING (auth.uid() = created_by AND is_custom = TRUE);