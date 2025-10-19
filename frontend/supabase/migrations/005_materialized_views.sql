-- Materialized Views for Performance Metrics in SWoT

-- Materialized view for exercise performance summary
CREATE MATERIALIZED VIEW exercise_performance_summary AS
SELECT 
    w.user_id,
    e.exercise_name,
    COUNT(DISTINCT w.id) as total_workouts,
    COUNT(s.id) as total_sets,
    SUM(s.reps) as total_reps,
    SUM(s.reps * s.weight) as total_volume,
    AVG(s.weight) as avg_weight,
    MAX(s.weight) as max_weight,
    AVG(s.reps) as avg_reps,
    MAX(s.reps) as max_reps,
    MAX(calculate_one_rep_max(s.weight, s.reps)) as estimated_1rm,
    MIN(w.date) as first_performed,
    MAX(w.date) as last_performed,
    COUNT(DISTINCT w.date) as days_performed
FROM workouts w
JOIN exercises e ON e.workout_id = w.id
JOIN sets s ON s.exercise_id = e.id
WHERE s.is_warmup = FALSE
GROUP BY w.user_id, e.exercise_name;

-- Create index on the materialized view
CREATE INDEX idx_exercise_performance_user_exercise 
ON exercise_performance_summary(user_id, exercise_name);

-- Materialized view for weekly volume trends
CREATE MATERIALIZED VIEW weekly_volume_trends AS
SELECT 
    w.user_id,
    DATE_TRUNC('week', w.date)::DATE as week_start,
    COUNT(w.id) as workouts_count,
    SUM(w.total_volume) as total_volume,
    AVG(w.total_volume) as avg_workout_volume,
    COUNT(DISTINCT e.exercise_name) as unique_exercises,
    SUM(CASE WHEN s.is_warmup = FALSE THEN 1 ELSE 0 END) as total_working_sets
FROM workouts w
JOIN exercises e ON e.workout_id = w.id
JOIN sets s ON s.exercise_id = e.id
GROUP BY w.user_id, DATE_TRUNC('week', w.date);

-- Create index on the materialized view
CREATE INDEX idx_weekly_volume_trends_user_week 
ON weekly_volume_trends(user_id, week_start);

-- Materialized view for muscle group volume distribution
CREATE MATERIALIZED VIEW muscle_group_volume AS
SELECT 
    w.user_id,
    DATE_TRUNC('month', w.date)::DATE as month_start,
    ed.category as exercise_category,
    UNNEST(ed.muscle_groups) as muscle_group,
    SUM(s.reps * s.weight) as total_volume,
    COUNT(DISTINCT w.id) as workouts_count,
    COUNT(s.id) as total_sets
FROM workouts w
JOIN exercises e ON e.workout_id = w.id
JOIN sets s ON s.exercise_id = e.id
JOIN exercise_definitions ed ON ed.name = e.exercise_name
WHERE s.is_warmup = FALSE
GROUP BY w.user_id, DATE_TRUNC('month', w.date), ed.category, UNNEST(ed.muscle_groups);

-- Create index on the materialized view
CREATE INDEX idx_muscle_group_volume_user_month 
ON muscle_group_volume(user_id, month_start, muscle_group);

-- Materialized view for personal records tracking
CREATE MATERIALIZED VIEW personal_records AS
WITH ranked_performances AS (
    SELECT 
        w.user_id,
        e.exercise_name,
        s.weight,
        s.reps,
        s.reps * s.weight as volume,
        calculate_one_rep_max(s.weight, s.reps) as estimated_1rm,
        w.date,
        ROW_NUMBER() OVER (
            PARTITION BY w.user_id, e.exercise_name 
            ORDER BY s.weight DESC, s.reps DESC
        ) as weight_rank,
        ROW_NUMBER() OVER (
            PARTITION BY w.user_id, e.exercise_name 
            ORDER BY (s.reps * s.weight) DESC
        ) as volume_rank,
        ROW_NUMBER() OVER (
            PARTITION BY w.user_id, e.exercise_name 
            ORDER BY calculate_one_rep_max(s.weight, s.reps) DESC
        ) as orm_rank
    FROM workouts w
    JOIN exercises e ON e.workout_id = w.id
    JOIN sets s ON s.exercise_id = e.id
    WHERE s.is_warmup = FALSE
)
SELECT 
    user_id,
    exercise_name,
    MAX(CASE WHEN weight_rank = 1 THEN weight END) as max_weight,
    MAX(CASE WHEN weight_rank = 1 THEN reps END) as max_weight_reps,
    MAX(CASE WHEN weight_rank = 1 THEN date END) as max_weight_date,
    MAX(CASE WHEN volume_rank = 1 THEN volume END) as max_volume,
    MAX(CASE WHEN volume_rank = 1 THEN weight END) as max_volume_weight,
    MAX(CASE WHEN volume_rank = 1 THEN reps END) as max_volume_reps,
    MAX(CASE WHEN volume_rank = 1 THEN date END) as max_volume_date,
    MAX(CASE WHEN orm_rank = 1 THEN estimated_1rm END) as max_estimated_1rm,
    MAX(CASE WHEN orm_rank = 1 THEN weight END) as max_1rm_weight,
    MAX(CASE WHEN orm_rank = 1 THEN reps END) as max_1rm_reps,
    MAX(CASE WHEN orm_rank = 1 THEN date END) as max_1rm_date
FROM ranked_performances
GROUP BY user_id, exercise_name;

-- Create index on the materialized view
CREATE INDEX idx_personal_records_user_exercise 
ON personal_records(user_id, exercise_name);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_performance_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY exercise_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_volume_trends;
    REFRESH MATERIALIZED VIEW CONCURRENTLY muscle_group_volume;
    REFRESH MATERIALIZED VIEW CONCURRENTLY personal_records;
END;
$$ LANGUAGE plpgsql;

-- Create a function to refresh views for a specific user (more efficient)
CREATE OR REPLACE FUNCTION refresh_user_performance_views(user_id_param UUID)
RETURNS void AS $$
BEGIN
    -- For now, refresh all views since PostgreSQL doesn't support partial refresh
    -- In a production environment, you might want to implement incremental updates
    PERFORM refresh_performance_views();
END;
$$ LANGUAGE plpgsql;