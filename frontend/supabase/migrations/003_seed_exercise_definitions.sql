-- Seed data for exercise definitions
-- This provides a comprehensive library of common exercises

INSERT INTO exercise_definitions (name, category, muscle_groups, equipment, instructions, is_custom, created_by) VALUES
-- Chest exercises
('Bench Press', 'Chest', ARRAY['Chest', 'Triceps', 'Shoulders'], 'Barbell', 'Lie on bench, lower bar to chest, press up explosively', FALSE, NULL),
('Incline Bench Press', 'Chest', ARRAY['Upper Chest', 'Triceps', 'Shoulders'], 'Barbell', 'Set bench to 30-45 degrees, press barbell from inclined position', FALSE, NULL),
('Dumbbell Bench Press', 'Chest', ARRAY['Chest', 'Triceps', 'Shoulders'], 'Dumbbells', 'Lie on bench with dumbbells, press up and together', FALSE, NULL),
('Incline Dumbbell Press', 'Chest', ARRAY['Upper Chest', 'Triceps', 'Shoulders'], 'Dumbbells', 'Inclined bench dumbbell press for upper chest development', FALSE, NULL),
('Dumbbell Flyes', 'Chest', ARRAY['Chest'], 'Dumbbells', 'Lie on bench, arc dumbbells out and together with slight bend in elbows', FALSE, NULL),
('Push-ups', 'Chest', ARRAY['Chest', 'Triceps', 'Shoulders'], 'Bodyweight', 'Standard push-up from plank position', FALSE, NULL),
('Dips', 'Chest', ARRAY['Chest', 'Triceps'], 'Dip Station', 'Lower body between parallel bars, press back up', FALSE, NULL),

-- Back exercises
('Deadlift', 'Back', ARRAY['Back', 'Glutes', 'Hamstrings', 'Traps'], 'Barbell', 'Hip hinge movement, lift bar from floor to standing', FALSE, NULL),
('Pull-ups', 'Back', ARRAY['Lats', 'Biceps', 'Rhomboids'], 'Pull-up Bar', 'Hang from bar, pull body up until chin over bar', FALSE, NULL),
('Chin-ups', 'Back', ARRAY['Lats', 'Biceps'], 'Pull-up Bar', 'Underhand grip pull-ups emphasizing biceps', FALSE, NULL),
('Bent-over Row', 'Back', ARRAY['Lats', 'Rhomboids', 'Middle Traps'], 'Barbell', 'Bend at hips, row barbell to lower chest', FALSE, NULL),
('Dumbbell Row', 'Back', ARRAY['Lats', 'Rhomboids'], 'Dumbbells', 'Single arm or both arms, row dumbbell to hip', FALSE, NULL),
('Lat Pulldown', 'Back', ARRAY['Lats', 'Biceps'], 'Cable Machine', 'Pull cable bar down to upper chest from seated position', FALSE, NULL),
('Seated Cable Row', 'Back', ARRAY['Lats', 'Rhomboids', 'Middle Traps'], 'Cable Machine', 'Seated row with cable, pull to lower chest', FALSE, NULL),
('T-Bar Row', 'Back', ARRAY['Lats', 'Rhomboids', 'Middle Traps'], 'T-Bar', 'Bent over row using T-bar apparatus', FALSE, NULL),

-- Legs exercises
('Squat', 'Legs', ARRAY['Quadriceps', 'Glutes', 'Hamstrings'], 'Barbell', 'Descend into squat position, drive through heels to stand', FALSE, NULL),
('Front Squat', 'Legs', ARRAY['Quadriceps', 'Core'], 'Barbell', 'Squat with bar held in front rack position', FALSE, NULL),
('Romanian Deadlift', 'Legs', ARRAY['Hamstrings', 'Glutes'], 'Barbell', 'Hip hinge with slight knee bend, focus on hamstring stretch', FALSE, NULL),
('Bulgarian Split Squat', 'Legs', ARRAY['Quadriceps', 'Glutes'], 'Dumbbells', 'Single leg squat with rear foot elevated', FALSE, NULL),
('Leg Press', 'Legs', ARRAY['Quadriceps', 'Glutes'], 'Leg Press Machine', 'Press weight with legs from seated position', FALSE, NULL),
('Leg Curl', 'Legs', ARRAY['Hamstrings'], 'Leg Curl Machine', 'Curl heels toward glutes against resistance', FALSE, NULL),
('Leg Extension', 'Legs', ARRAY['Quadriceps'], 'Leg Extension Machine', 'Extend legs against resistance from seated position', FALSE, NULL),
('Calf Raise', 'Legs', ARRAY['Calves'], 'Calf Raise Machine', 'Rise up on toes, lower slowly for calf development', FALSE, NULL),
('Walking Lunges', 'Legs', ARRAY['Quadriceps', 'Glutes'], 'Dumbbells', 'Step forward into lunge, alternate legs walking forward', FALSE, NULL),

-- Shoulders exercises
('Overhead Press', 'Shoulders', ARRAY['Shoulders', 'Triceps'], 'Barbell', 'Press barbell overhead from shoulder height', FALSE, NULL),
('Dumbbell Shoulder Press', 'Shoulders', ARRAY['Shoulders', 'Triceps'], 'Dumbbells', 'Press dumbbells overhead from seated or standing position', FALSE, NULL),
('Lateral Raise', 'Shoulders', ARRAY['Side Delts'], 'Dumbbells', 'Raise dumbbells out to sides to shoulder height', FALSE, NULL),
('Front Raise', 'Shoulders', ARRAY['Front Delts'], 'Dumbbells', 'Raise dumbbells forward to shoulder height', FALSE, NULL),
('Rear Delt Fly', 'Shoulders', ARRAY['Rear Delts'], 'Dumbbells', 'Bend forward, fly dumbbells out to sides', FALSE, NULL),
('Upright Row', 'Shoulders', ARRAY['Shoulders', 'Traps'], 'Barbell', 'Pull barbell up along body to chest height', FALSE, NULL),
('Shrugs', 'Shoulders', ARRAY['Traps'], 'Dumbbells', 'Shrug shoulders up toward ears', FALSE, NULL),

-- Arms exercises
('Barbell Curl', 'Arms', ARRAY['Biceps'], 'Barbell', 'Curl barbell up using biceps, control the descent', FALSE, NULL),
('Dumbbell Curl', 'Arms', ARRAY['Biceps'], 'Dumbbells', 'Curl dumbbells alternating or together', FALSE, NULL),
('Hammer Curl', 'Arms', ARRAY['Biceps', 'Forearms'], 'Dumbbells', 'Curl with neutral grip, thumbs up position', FALSE, NULL),
('Tricep Dips', 'Arms', ARRAY['Triceps'], 'Bench', 'Dip between benches or chairs using triceps', FALSE, NULL),
('Close-Grip Bench Press', 'Arms', ARRAY['Triceps', 'Chest'], 'Barbell', 'Bench press with hands closer together', FALSE, NULL),
('Tricep Pushdown', 'Arms', ARRAY['Triceps'], 'Cable Machine', 'Push cable down using triceps from high position', FALSE, NULL),
('Overhead Tricep Extension', 'Arms', ARRAY['Triceps'], 'Dumbbells', 'Extend dumbbell overhead, lower behind head', FALSE, NULL),

-- Core exercises
('Plank', 'Core', ARRAY['Core', 'Shoulders'], 'Bodyweight', 'Hold plank position maintaining straight line', FALSE, NULL),
('Crunches', 'Core', ARRAY['Abs'], 'Bodyweight', 'Crunch up bringing shoulders toward knees', FALSE, NULL),
('Russian Twists', 'Core', ARRAY['Obliques'], 'Bodyweight', 'Seated twist side to side, feet off ground', FALSE, NULL),
('Dead Bug', 'Core', ARRAY['Core'], 'Bodyweight', 'Lie on back, extend opposite arm and leg', FALSE, NULL),
('Mountain Climbers', 'Core', ARRAY['Core', 'Cardio'], 'Bodyweight', 'Plank position, alternate bringing knees to chest', FALSE, NULL),
('Bicycle Crunches', 'Core', ARRAY['Abs', 'Obliques'], 'Bodyweight', 'Crunch bringing opposite elbow to knee', FALSE, NULL),

-- Cardio exercises
('Treadmill', 'Cardio', ARRAY['Cardio'], 'Treadmill', 'Running or walking on treadmill', FALSE, NULL),
('Rowing Machine', 'Cardio', ARRAY['Cardio', 'Back'], 'Rowing Machine', 'Full body rowing motion for cardio', FALSE, NULL),
('Stationary Bike', 'Cardio', ARRAY['Cardio', 'Legs'], 'Stationary Bike', 'Cycling for cardiovascular fitness', FALSE, NULL),
('Elliptical', 'Cardio', ARRAY['Cardio'], 'Elliptical Machine', 'Low impact cardio using elliptical motion', FALSE, NULL),
('Burpees', 'Cardio', ARRAY['Cardio', 'Full Body'], 'Bodyweight', 'Squat, jump back to plank, push-up, jump up', FALSE, NULL),
('Jumping Jacks', 'Cardio', ARRAY['Cardio'], 'Bodyweight', 'Jump feet apart while raising arms overhead', FALSE, NULL);