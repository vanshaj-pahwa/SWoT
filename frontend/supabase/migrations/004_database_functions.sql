-- Database Functions for SWoT Analytics and Calculations

-- Function to calculate total volume for a workout
CREATE OR REPLACE FUNCTION calculate_workout_volume(workout_id_param UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_volume DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(s.reps * s.weight), 0)
    INTO total_volume
    FROM sets s
    JOIN exercises e ON e.id = s.exercise_id
    WHERE e.workout_id = workout_id_param
    AND s.is_warmup = FALSE;
    
    RETURN total_volume;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate One Rep Max using Epley formula
CREATE OR REPLACE FUNCTION calculate_one_rep_max(weight_param DECIMAL, reps_param INTEGER)
RETURNS DECIMAL(6,2) AS $$
BEGIN
    -- Epley formula: 1RM = weight * (1 + reps/30)
    -- Only calculate for reps between 1-15 for accuracy
    IF reps_param < 1 OR reps_param > 15 THEN
        RETURN weight_param;
    END IF;
    
    RETURN ROUND(weight_param * (1 + reps_param::DECIMAL / 30), 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get exercise progress data for a user
CREATE OR REPLACE FUNCTION get_exercise_progress(
    user_id_param UUID,
    exercise_name_param TEXT,
    days_back INTEGER DEFAULT 365
)
RETURNS TABLE(
    workout_date DATE,
    max_weight DECIMAL(6,2),
    total_volume DECIMAL(10,2),
    estimated_1rm DECIMAL(6,2),
    total_sets INTEGER,
    avg_reps DECIMAL(4,1)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.date as workout_date,
        MAX(s.weight) as max_weight,
        SUM(s.reps * s.weight) as total_volume,
        MAX(calculate_one_rep_max(s.weight, s.reps)) as estimated_1rm,
        COUNT(s.id)::INTEGER as total_sets,
        AVG(s.reps)::DECIMAL(4,1) as avg_reps
    FROM workouts w
    JOIN exercises e ON e.workout_id = w.id
    JOIN sets s ON s.exercise_id = e.id
    WHERE w.user_id = user_id_param
    AND e.exercise_name = exercise_name_param
    AND w.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    AND s.is_warmup = FALSE
    GROUP BY w.date
    ORDER BY w.date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to detect personal bests for a user
CREATE OR REPLACE FUNCTION get_personal_bests(user_id_param UUID)
RETURNS TABLE(
    exercise_name TEXT,
    max_weight DECIMAL(6,2),
    max_volume DECIMAL(10,2),
    max_1rm DECIMAL(6,2),
    achieved_date DATE
) AS $$
BEGIN
    RETURN QUERY
    WITH exercise_stats AS (
        SELECT 
            e.exercise_name,
            w.date,
            MAX(s.weight) as workout_max_weight,
            SUM(s.reps * s.weight) as workout_volume,
            MAX(calculate_one_rep_max(s.weight, s.reps)) as workout_max_1rm
        FROM workouts w
        JOIN exercises e ON e.workout_id = w.id
        JOIN sets s ON s.exercise_id = e.id
        WHERE w.user_id = user_id_param
        AND s.is_warmup = FALSE
        GROUP BY e.exercise_name, w.date
    ),
    personal_bests AS (
        SELECT 
            exercise_name,
            MAX(workout_max_weight) as max_weight,
            MAX(workout_volume) as max_volume,
            MAX(workout_max_1rm) as max_1rm
        FROM exercise_stats
        GROUP BY exercise_name
    )
    SELECT 
        pb.exercise_name,
        pb.max_weight,
        pb.max_volume,
        pb.max_1rm,
        (SELECT es.date FROM exercise_stats es 
         WHERE es.exercise_name = pb.exercise_name 
         AND (es.workout_max_weight = pb.max_weight 
              OR es.workout_volume = pb.max_volume 
              OR es.workout_max_1rm = pb.max_1rm)
         ORDER BY es.date DESC LIMIT 1) as achieved_date
    FROM personal_bests pb
    ORDER BY pb.exercise_name;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate volume progression over time
CREATE OR REPLACE FUNCTION get_volume_progression(
    user_id_param UUID,
    days_back INTEGER DEFAULT 90
)
RETURNS TABLE(
    week_start DATE,
    total_volume DECIMAL(12,2),
    workout_count INTEGER,
    avg_volume_per_workout DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('week', w.date)::DATE as week_start,
        SUM(w.total_volume) as total_volume,
        COUNT(w.id)::INTEGER as workout_count,
        AVG(w.total_volume)::DECIMAL(10,2) as avg_volume_per_workout
    FROM workouts w
    WHERE w.user_id = user_id_param
    AND w.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY DATE_TRUNC('week', w.date)
    ORDER BY week_start ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to detect plateaus in exercise performance
CREATE OR REPLACE FUNCTION detect_plateaus(
    user_id_param UUID,
    exercise_name_param TEXT,
    weeks_threshold INTEGER DEFAULT 4
)
RETURNS TABLE(
    is_plateau BOOLEAN,
    weeks_without_progress INTEGER,
    last_progress_date DATE,
    current_max_weight DECIMAL(6,2),
    plateau_start_date DATE
) AS $$
DECLARE
    progress_data RECORD;
    last_max DECIMAL(6,2) := 0;
    current_max DECIMAL(6,2) := 0;
    weeks_count INTEGER := 0;
    last_progress DATE;
    plateau_start DATE;
BEGIN
    -- Get the most recent max weight
    SELECT MAX(s.weight), MAX(w.date)
    INTO current_max, last_progress
    FROM workouts w
    JOIN exercises e ON e.workout_id = w.id
    JOIN sets s ON s.exercise_id = e.id
    WHERE w.user_id = user_id_param
    AND e.exercise_name = exercise_name_param
    AND s.is_warmup = FALSE;
    
    -- Check for progress in recent weeks
    FOR progress_data IN
        SELECT 
            DATE_TRUNC('week', w.date)::DATE as week_start,
            MAX(s.weight) as week_max_weight
        FROM workouts w
        JOIN exercises e ON e.workout_id = w.id
        JOIN sets s ON s.exercise_id = e.id
        WHERE w.user_id = user_id_param
        AND e.exercise_name = exercise_name_param
        AND w.date >= CURRENT_DATE - INTERVAL '1 week' * (weeks_threshold + 2)
        AND s.is_warmup = FALSE
        GROUP BY DATE_TRUNC('week', w.date)
        ORDER BY week_start DESC
    LOOP
        IF progress_data.week_max_weight > last_max THEN
            -- Found progress, reset counter
            EXIT;
        ELSE
            weeks_count := weeks_count + 1;
            IF plateau_start IS NULL THEN
                plateau_start := progress_data.week_start;
            END IF;
        END IF;
        last_max := progress_data.week_max_weight;
    END LOOP;
    
    RETURN QUERY SELECT 
        (weeks_count >= weeks_threshold) as is_plateau,
        weeks_count,
        last_progress,
        current_max,
        plateau_start;
END;
$$ LANGUAGE plpgsql;

-- Function to get workout frequency statistics
CREATE OR REPLACE FUNCTION get_workout_frequency(
    user_id_param UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    total_workouts INTEGER,
    avg_workouts_per_week DECIMAL(4,2),
    longest_streak INTEGER,
    current_streak INTEGER,
    days_since_last_workout INTEGER
) AS $$
DECLARE
    workout_dates DATE[];
    current_streak_count INTEGER := 0;
    longest_streak_count INTEGER := 0;
    temp_streak INTEGER := 0;
    last_workout_date DATE;
    i INTEGER;
BEGIN
    -- Get all workout dates in the period
    SELECT ARRAY_AGG(DISTINCT w.date ORDER BY w.date DESC)
    INTO workout_dates
    FROM workouts w
    WHERE w.user_id = user_id_param
    AND w.date >= CURRENT_DATE - INTERVAL '1 day' * days_back;
    
    -- Get last workout date
    SELECT MAX(w.date) INTO last_workout_date
    FROM workouts w
    WHERE w.user_id = user_id_param;
    
    -- Calculate streaks (consecutive days with workouts)
    IF workout_dates IS NOT NULL AND array_length(workout_dates, 1) > 0 THEN
        -- Calculate current streak from most recent workout
        FOR i IN 1..array_length(workout_dates, 1) LOOP
            IF workout_dates[i] = CURRENT_DATE - INTERVAL '1 day' * (i - 1) THEN
                current_streak_count := current_streak_count + 1;
            ELSE
                EXIT;
            END IF;
        END LOOP;
        
        -- Calculate longest streak
        temp_streak := 1;
        longest_streak_count := 1;
        
        FOR i IN 2..array_length(workout_dates, 1) LOOP
            IF workout_dates[i-1] - workout_dates[i] = 1 THEN
                temp_streak := temp_streak + 1;
                longest_streak_count := GREATEST(longest_streak_count, temp_streak);
            ELSE
                temp_streak := 1;
            END IF;
        END LOOP;
    END IF;
    
    RETURN QUERY SELECT 
        COALESCE(array_length(workout_dates, 1), 0) as total_workouts,
        CASE 
            WHEN days_back >= 7 THEN 
                ROUND((COALESCE(array_length(workout_dates, 1), 0) * 7.0 / days_back), 2)
            ELSE 0.0
        END::DECIMAL(4,2) as avg_workouts_per_week,
        longest_streak_count,
        current_streak_count,
        CASE 
            WHEN last_workout_date IS NOT NULL THEN 
                (CURRENT_DATE - last_workout_date)::INTEGER
            ELSE NULL
        END as days_since_last_workout;
END;
$$ LANGUAGE plpgsql;