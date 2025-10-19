-- Database Triggers and Automation for SWoT

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically calculate workout total volume
CREATE OR REPLACE FUNCTION update_workout_total_volume()
RETURNS TRIGGER AS $$
DECLARE
    workout_id_val UUID;
    new_total_volume DECIMAL(10,2);
BEGIN
    -- Get the workout_id from the affected exercise
    IF TG_OP = 'DELETE' THEN
        SELECT e.workout_id INTO workout_id_val
        FROM exercises e
        WHERE e.id = OLD.exercise_id;
    ELSE
        SELECT e.workout_id INTO workout_id_val
        FROM exercises e
        WHERE e.id = NEW.exercise_id;
    END IF;
    
    -- Calculate new total volume for the workout
    SELECT calculate_workout_volume(workout_id_val) INTO new_total_volume;
    
    -- Update the workout's total volume
    UPDATE workouts 
    SET total_volume = new_total_volume,
        updated_at = NOW()
    WHERE id = workout_id_val;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views when data changes
CREATE OR REPLACE FUNCTION trigger_refresh_performance_views()
RETURNS TRIGGER AS $$
BEGIN
    -- Schedule a refresh of materialized views
    -- In production, you might want to batch these or use a job queue
    PERFORM pg_notify('refresh_views', 'performance_data_changed');
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to validate set data before insert/update
CREATE OR REPLACE FUNCTION validate_set_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure reps is positive
    IF NEW.reps <= 0 THEN
        RAISE EXCEPTION 'Reps must be greater than 0';
    END IF;
    
    -- Ensure weight is non-negative
    IF NEW.weight < 0 THEN
        RAISE EXCEPTION 'Weight cannot be negative';
    END IF;
    
    -- Ensure rest_seconds is non-negative if provided
    IF NEW.rest_seconds IS NOT NULL AND NEW.rest_seconds < 0 THEN
        RAISE EXCEPTION 'Rest seconds cannot be negative';
    END IF;
    
    -- Validate reasonable limits (optional business rules)
    IF NEW.reps > 1000 THEN
        RAISE EXCEPTION 'Reps cannot exceed 1000';
    END IF;
    
    IF NEW.weight > 10000 THEN
        RAISE EXCEPTION 'Weight cannot exceed 10000';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure exercise order is maintained
CREATE OR REPLACE FUNCTION maintain_exercise_order()
RETURNS TRIGGER AS $$
BEGIN
    -- If no exercise_order is provided, set it to the next available number
    IF NEW.exercise_order IS NULL THEN
        SELECT COALESCE(MAX(exercise_order), 0) + 1
        INTO NEW.exercise_order
        FROM exercises
        WHERE workout_id = NEW.workout_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure set order is maintained
CREATE OR REPLACE FUNCTION maintain_set_order()
RETURNS TRIGGER AS $$
BEGIN
    -- If no set_order is provided, set it to the next available number
    IF NEW.set_order IS NULL THEN
        SELECT COALESCE(MAX(set_order), 0) + 1
        INTO NEW.set_order
        FROM sets
        WHERE exercise_id = NEW.exercise_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for workout volume calculation
CREATE TRIGGER update_workout_volume_on_set_insert
    AFTER INSERT ON sets
    FOR EACH ROW
    EXECUTE FUNCTION update_workout_total_volume();

CREATE TRIGGER update_workout_volume_on_set_update
    AFTER UPDATE ON sets
    FOR EACH ROW
    EXECUTE FUNCTION update_workout_total_volume();

CREATE TRIGGER update_workout_volume_on_set_delete
    AFTER DELETE ON sets
    FOR EACH ROW
    EXECUTE FUNCTION update_workout_total_volume();

-- Create triggers for data validation
CREATE TRIGGER validate_set_data_trigger
    BEFORE INSERT OR UPDATE ON sets
    FOR EACH ROW
    EXECUTE FUNCTION validate_set_data();

-- Create triggers for maintaining order
CREATE TRIGGER maintain_exercise_order_trigger
    BEFORE INSERT ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION maintain_exercise_order();

CREATE TRIGGER maintain_set_order_trigger
    BEFORE INSERT ON sets
    FOR EACH ROW
    EXECUTE FUNCTION maintain_set_order();

-- Create triggers for refreshing materialized views
-- Note: In production, you might want to batch these or use a job queue
CREATE TRIGGER refresh_views_on_workout_change
    AFTER INSERT OR UPDATE OR DELETE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_performance_views();

CREATE TRIGGER refresh_views_on_set_change
    AFTER INSERT OR UPDATE OR DELETE ON sets
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_performance_views();

-- Function to clean up orphaned data (maintenance function)
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS void AS $$
BEGIN
    -- Clean up exercises without workouts (shouldn't happen with FK constraints)
    DELETE FROM exercises 
    WHERE workout_id NOT IN (SELECT id FROM workouts);
    
    -- Clean up sets without exercises (shouldn't happen with FK constraints)
    DELETE FROM sets 
    WHERE exercise_id NOT IN (SELECT id FROM exercises);
    
    -- Update any workouts with incorrect total_volume
    UPDATE workouts 
    SET total_volume = calculate_workout_volume(id)
    WHERE total_volume != calculate_workout_volume(id);
    
    -- Refresh materialized views after cleanup
    PERFORM refresh_performance_views();
END;
$$ LANGUAGE plpgsql;

-- Create a function to initialize workout session (useful for the app)
CREATE OR REPLACE FUNCTION start_workout_session(
    user_id_param UUID,
    workout_name_param TEXT,
    routine_id_param UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_workout_id UUID;
    routine_exercise RECORD;
    new_exercise_id UUID;
BEGIN
    -- Create the workout
    INSERT INTO workouts (user_id, name, date, start_time)
    VALUES (user_id_param, workout_name_param, CURRENT_DATE, NOW())
    RETURNING id INTO new_workout_id;
    
    -- If a routine is provided, copy its exercises
    IF routine_id_param IS NOT NULL THEN
        FOR routine_exercise IN
            SELECT 
                value->>'name' as exercise_name,
                (value->>'order')::INTEGER as exercise_order,
                value->>'notes' as notes
            FROM routines r,
            jsonb_array_elements(r.exercises) as value
            WHERE r.id = routine_id_param
            AND r.user_id = user_id_param
            ORDER BY (value->>'order')::INTEGER
        LOOP
            INSERT INTO exercises (workout_id, exercise_name, exercise_order, notes)
            VALUES (new_workout_id, routine_exercise.exercise_name, routine_exercise.exercise_order, routine_exercise.notes);
        END LOOP;
    END IF;
    
    RETURN new_workout_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to finish workout session
CREATE OR REPLACE FUNCTION finish_workout_session(workout_id_param UUID)
RETURNS void AS $$
DECLARE
    start_time_val TIMESTAMP WITH TIME ZONE;
    duration_val INTEGER;
BEGIN
    -- Get the start time and calculate duration
    SELECT start_time INTO start_time_val
    FROM workouts
    WHERE id = workout_id_param;
    
    IF start_time_val IS NOT NULL THEN
        duration_val := EXTRACT(EPOCH FROM (NOW() - start_time_val)) / 60;
        
        UPDATE workouts
        SET end_time = NOW(),
            duration_minutes = duration_val,
            updated_at = NOW()
        WHERE id = workout_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql;