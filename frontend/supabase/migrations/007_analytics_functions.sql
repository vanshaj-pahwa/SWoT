-- Additional Analytics Functions for SWoT Progress Tracking

-- Drop existing functions that we're updating
DROP FUNCTION IF EXISTS get_exercise_progress(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_volume_progression(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_personal_bests(UUID);
DROP FUNCTION IF EXISTS detect_plateaus(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_workout_frequency(UUID, INTEGER);

-- Function to get exercise progress with date filtering
CREATE OR REPLACE FUNCTION get_exercise_progress(
    p_user_id UUID,
    p_exercise_name TEXT,
    p_date_filter TEXT DEFAULT ''
)
RETURNS TABLE(
    date DATE,
    max_weight DECIMAL(6,2),
    total_volume DECIMAL(10,2),
    estimated_1rm DECIMAL(6,2)
) AS $$
DECLARE
    query_text TEXT;
BEGIN
    query_text := '
    SELECT 
        w.date,
        MAX(s.weight) as max_weight,
        SUM(s.reps * s.weight) as total_volume,
        MAX(calculate_one_rep_max(s.weight, s.reps)) as estimated_1rm
    FROM workouts w
    JOIN exercises e ON e.workout_id = w.id
    JOIN sets s ON s.exercise_id = e.id
    WHERE w.user_id = $1
    AND e.exercise_name = $2
    AND s.is_warmup = FALSE
    ' || p_date_filter || '
    GROUP BY w.date
    ORDER BY w.date ASC';
    
    RETURN QUERY EXECUTE query_text USING p_user_id, p_exercise_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get volume progression with date filtering
CREATE OR REPLACE FUNCTION get_volume_progression(
    p_user_id UUID,
    p_date_filter TEXT DEFAULT ''
)
RETURNS TABLE(
    date DATE,
    total_volume DECIMAL(10,2),
    exercise_count INTEGER
) AS $$
DECLARE
    query_text TEXT;
BEGIN
    query_text := '
    SELECT 
        w.date,
        w.total_volume,
        COUNT(DISTINCT e.exercise_name)::INTEGER as exercise_count
    FROM workouts w
    LEFT JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = $1
    ' || p_date_filter || '
    GROUP BY w.date, w.total_volume
    ORDER BY w.date ASC';
    
    RETURN QUERY EXECUTE query_text USING p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get personal bests for all exercises
CREATE OR REPLACE FUNCTION get_personal_bests(p_user_id UUID)
RETURNS TABLE(
    exercise_name TEXT,
    max_weight DECIMAL(6,2),
    reps_at_max INTEGER,
    date_achieved DATE,
    estimated_1rm DECIMAL(6,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH exercise_max_weights AS (
        SELECT 
            e.exercise_name,
            s.weight,
            s.reps,
            w.date,
            calculate_one_rep_max(s.weight, s.reps) as one_rep_max,
            ROW_NUMBER() OVER (
                PARTITION BY e.exercise_name 
                ORDER BY s.weight DESC, calculate_one_rep_max(s.weight, s.reps) DESC, w.date DESC
            ) as rn
        FROM workouts w
        JOIN exercises e ON e.workout_id = w.id
        JOIN sets s ON s.exercise_id = e.id
        WHERE w.user_id = p_user_id
        AND s.is_warmup = FALSE
    )
    SELECT 
        emw.exercise_name,
        emw.weight as max_weight,
        emw.reps as reps_at_max,
        emw.date as date_achieved,
        emw.one_rep_max as estimated_1rm
    FROM exercise_max_weights emw
    WHERE emw.rn = 1
    ORDER BY emw.exercise_name;
END;
$$ LANGUAGE plpgsql;

-- Function to detect plateaus across all exercises
CREATE OR REPLACE FUNCTION detect_plateaus_all(
    p_user_id UUID,
    p_days_threshold INTEGER DEFAULT 21
)
RETURNS TABLE(
    exercise_name TEXT,
    last_progress_date DATE,
    days_since_progress INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH exercise_progress AS (
        SELECT 
            e.exercise_name,
            w.date,
            MAX(s.weight) as max_weight,
            MAX(calculate_one_rep_max(s.weight, s.reps)) as max_1rm
        FROM workouts w
        JOIN exercises e ON e.workout_id = w.id
        JOIN sets s ON s.exercise_id = e.id
        WHERE w.user_id = p_user_id
        AND s.is_warmup = FALSE
        AND w.date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY e.exercise_name, w.date
    ),
    exercise_peaks AS (
        SELECT 
            exercise_name,
            MAX(max_weight) as peak_weight,
            MAX(max_1rm) as peak_1rm
        FROM exercise_progress
        GROUP BY exercise_name
    ),
    last_peak_dates AS (
        SELECT 
            ep.exercise_name,
            MAX(ep.date) as last_progress_date
        FROM exercise_progress ep
        JOIN exercise_peaks epk ON epk.exercise_name = ep.exercise_name
        WHERE ep.max_weight = epk.peak_weight OR ep.max_1rm = epk.peak_1rm
        GROUP BY ep.exercise_name
    )
    SELECT 
        lpd.exercise_name,
        lpd.last_progress_date,
        (CURRENT_DATE - lpd.last_progress_date)::INTEGER as days_since_progress
    FROM last_peak_dates lpd
    WHERE (CURRENT_DATE - lpd.last_progress_date)::INTEGER >= p_days_threshold
    ORDER BY days_since_progress DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get workout frequency with date filtering
CREATE OR REPLACE FUNCTION get_workout_frequency(
    p_user_id UUID,
    p_date_filter TEXT DEFAULT ''
)
RETURNS TABLE(
    date DATE,
    workout_count INTEGER
) AS $$
DECLARE
    query_text TEXT;
BEGIN
    query_text := '
    SELECT 
        w.date,
        COUNT(*)::INTEGER as workout_count
    FROM workouts w
    WHERE w.user_id = $1
    ' || p_date_filter || '
    GROUP BY w.date
    ORDER BY w.date ASC';
    
    RETURN QUERY EXECUTE query_text USING p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get exercise performance trends
CREATE OR REPLACE FUNCTION get_exercise_performance_trends(
    p_user_id UUID,
    p_exercise_name TEXT,
    p_date_filter TEXT DEFAULT ''
)
RETURNS TABLE(
    date DATE,
    max_weight DECIMAL(6,2),
    avg_weight DECIMAL(6,2),
    total_sets INTEGER,
    total_reps INTEGER,
    total_volume DECIMAL(10,2)
) AS $$
DECLARE
    query_text TEXT;
BEGIN
    query_text := '
    SELECT 
        w.date,
        MAX(s.weight) as max_weight,
        AVG(s.weight)::DECIMAL(6,2) as avg_weight,
        COUNT(s.id)::INTEGER as total_sets,
        SUM(s.reps)::INTEGER as total_reps,
        SUM(s.reps * s.weight) as total_volume
    FROM workouts w
    JOIN exercises e ON e.workout_id = w.id
    JOIN sets s ON s.exercise_id = e.id
    WHERE w.user_id = $1
    AND e.exercise_name = $2
    AND s.is_warmup = FALSE
    ' || p_date_filter || '
    GROUP BY w.date
    ORDER BY w.date ASC';
    
    RETURN QUERY EXECUTE query_text USING p_user_id, p_exercise_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing exercises
CREATE OR REPLACE FUNCTION get_top_performing_exercises(
    p_user_id UUID,
    p_time_range TEXT DEFAULT '30d',
    p_metric TEXT DEFAULT 'volume'
)
RETURNS TABLE(
    exercise_name TEXT,
    improvement_percentage DECIMAL(6,2),
    current_value DECIMAL(10,2),
    previous_value DECIMAL(10,2)
) AS $$
DECLARE
    days_back INTEGER;
    comparison_days INTEGER;
BEGIN
    -- Convert time range to days
    CASE p_time_range
        WHEN '7d' THEN days_back := 7; comparison_days := 14;
        WHEN '30d' THEN days_back := 30; comparison_days := 60;
        WHEN '90d' THEN days_back := 90; comparison_days := 180;
        WHEN '1y' THEN days_back := 365; comparison_days := 730;
        ELSE days_back := 30; comparison_days := 60;
    END CASE;
    
    IF p_metric = 'volume' THEN
        RETURN QUERY
        WITH current_period AS (
            SELECT 
                e.exercise_name,
                SUM(s.reps * s.weight) as total_volume
            FROM workouts w
            JOIN exercises e ON e.workout_id = w.id
            JOIN sets s ON s.exercise_id = e.id
            WHERE w.user_id = p_user_id
            AND w.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
            AND s.is_warmup = FALSE
            GROUP BY e.exercise_name
        ),
        previous_period AS (
            SELECT 
                e.exercise_name,
                SUM(s.reps * s.weight) as total_volume
            FROM workouts w
            JOIN exercises e ON e.workout_id = w.id
            JOIN sets s ON s.exercise_id = e.id
            WHERE w.user_id = p_user_id
            AND w.date >= CURRENT_DATE - INTERVAL '1 day' * comparison_days
            AND w.date < CURRENT_DATE - INTERVAL '1 day' * days_back
            AND s.is_warmup = FALSE
            GROUP BY e.exercise_name
        )
        SELECT 
            cp.exercise_name,
            CASE 
                WHEN pp.total_volume > 0 THEN 
                    ROUND(((cp.total_volume - pp.total_volume) / pp.total_volume * 100), 2)
                ELSE 100.0
            END::DECIMAL(6,2) as improvement_percentage,
            cp.total_volume as current_value,
            COALESCE(pp.total_volume, 0) as previous_value
        FROM current_period cp
        LEFT JOIN previous_period pp ON pp.exercise_name = cp.exercise_name
        WHERE cp.total_volume > 0
        ORDER BY improvement_percentage DESC NULLS LAST
        LIMIT 10;
    ELSE
        -- Strength metric (1RM improvement)
        RETURN QUERY
        WITH current_period AS (
            SELECT 
                e.exercise_name,
                MAX(calculate_one_rep_max(s.weight, s.reps)) as max_1rm
            FROM workouts w
            JOIN exercises e ON e.workout_id = w.id
            JOIN sets s ON s.exercise_id = e.id
            WHERE w.user_id = p_user_id
            AND w.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
            AND s.is_warmup = FALSE
            GROUP BY e.exercise_name
        ),
        previous_period AS (
            SELECT 
                e.exercise_name,
                MAX(calculate_one_rep_max(s.weight, s.reps)) as max_1rm
            FROM workouts w
            JOIN exercises e ON e.workout_id = w.id
            JOIN sets s ON s.exercise_id = e.id
            WHERE w.user_id = p_user_id
            AND w.date >= CURRENT_DATE - INTERVAL '1 day' * comparison_days
            AND w.date < CURRENT_DATE - INTERVAL '1 day' * days_back
            AND s.is_warmup = FALSE
            GROUP BY e.exercise_name
        )
        SELECT 
            cp.exercise_name,
            CASE 
                WHEN pp.max_1rm > 0 THEN 
                    ROUND(((cp.max_1rm - pp.max_1rm) / pp.max_1rm * 100), 2)
                ELSE 100.0
            END::DECIMAL(6,2) as improvement_percentage,
            cp.max_1rm as current_value,
            COALESCE(pp.max_1rm, 0) as previous_value
        FROM current_period cp
        LEFT JOIN previous_period pp ON pp.exercise_name = cp.exercise_name
        WHERE cp.max_1rm > 0
        ORDER BY improvement_percentage DESC NULLS LAST
        LIMIT 10;
    END IF;
END;
$$ LANGUAGE plpgsql;