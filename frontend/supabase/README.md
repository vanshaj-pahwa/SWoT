# SWoT Database Setup

This directory contains the database migrations and setup files for the SWoT (Strength Workout Tracker) application.

## Migration Files

The migrations should be applied in order:

1. **001_initial_schema.sql** - Creates the core database schema with all tables and indexes
2. **002_rls_policies.sql** - Implements Row Level Security policies for data isolation
3. **003_seed_exercise_definitions.sql** - Seeds the database with common exercise definitions
4. **004_database_functions.sql** - Creates SQL functions for analytics and calculations
5. **005_materialized_views.sql** - Creates materialized views for performance metrics
6. **006_triggers_and_automation.sql** - Sets up triggers for automatic data management

## How to Apply Migrations

### Using Supabase CLI (Recommended)

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project (if not already done):
   ```bash
   supabase init
   ```

3. Link to your Supabase project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Apply the migrations:
   ```bash
   supabase db push
   ```

### Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each migration file content in order
4. Execute each migration one by one

## Database Schema Overview

### Core Tables

- **users** - User profiles and authentication data
- **workouts** - Individual workout sessions
- **exercises** - Exercises within workouts
- **sets** - Individual sets with reps and weight
- **routines** - Reusable workout templates
- **exercise_definitions** - Library of available exercises

### Key Features

- **Row Level Security (RLS)** - Ensures users can only access their own data
- **Automatic Volume Calculation** - Triggers automatically calculate workout volumes
- **Performance Analytics** - Functions and views for progress tracking
- **Data Validation** - Triggers ensure data integrity
- **Materialized Views** - Optimized queries for analytics dashboard

### Important Functions

- `calculate_workout_volume(workout_id)` - Calculates total volume for a workout
- `calculate_one_rep_max(weight, reps)` - Estimates 1RM using Epley formula
- `get_exercise_progress(user_id, exercise_name, days_back)` - Gets progress data
- `get_personal_bests(user_id)` - Returns personal records
- `detect_plateaus(user_id, exercise_name)` - Identifies performance plateaus
- `start_workout_session(user_id, name, routine_id)` - Creates new workout
- `finish_workout_session(workout_id)` - Completes workout with timing

### Materialized Views

- `exercise_performance_summary` - Aggregated exercise statistics
- `weekly_volume_trends` - Weekly volume progression
- `muscle_group_volume` - Volume distribution by muscle groups
- `personal_records` - Personal bests tracking

## Maintenance

### Refreshing Materialized Views

The materialized views are automatically refreshed when data changes via triggers. You can also manually refresh them:

```sql
SELECT refresh_performance_views();
```

### Data Cleanup

Run the cleanup function periodically to ensure data integrity:

```sql
SELECT cleanup_orphaned_data();
```

## Security Notes

- All tables have RLS enabled
- Users can only access their own data
- Custom exercises are isolated per user
- Public routines are read-only for non-owners
- Exercise definitions are globally readable but only custom ones are user-modifiable