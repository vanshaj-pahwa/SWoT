// Data validation utilities
import { z } from 'zod'

// Zod schemas for data validation
export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Workout name is required'),
  date: z.date(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  durationMinutes: z.number().min(0).optional(),
  notes: z.string().optional(),
  totalVolume: z.number().min(0),
  exercises: z.array(z.any()) // Will be defined more specifically later
})

export const SetSchema = z.object({
  id: z.string().uuid(),
  exerciseId: z.string().uuid(),
  setOrder: z.number().min(1),
  reps: z.number().min(1, 'Reps must be at least 1'),
  weight: z.number().min(0, 'Weight cannot be negative'),
  isWarmup: z.boolean(),
  isDropset: z.boolean(),
  restSeconds: z.number().min(0).optional()
})

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  workoutId: z.string().uuid(),
  exerciseName: z.string().min(1, 'Exercise name is required'),
  exerciseOrder: z.number().min(1),
  notes: z.string().optional(),
  sets: z.array(SetSchema)
})

export const RoutineSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Routine name is required'),
  description: z.string().optional(),
  exercises: z.array(z.any()), // Will be defined more specifically later
  isPublic: z.boolean()
})

// Validation helper functions
export function validateWorkout(data: unknown) {
  return WorkoutSchema.safeParse(data)
}

export function validateSet(data: unknown) {
  return SetSchema.safeParse(data)
}

export function validateExercise(data: unknown) {
  return ExerciseSchema.safeParse(data)
}

export function validateRoutine(data: unknown) {
  return RoutineSchema.safeParse(data)
}