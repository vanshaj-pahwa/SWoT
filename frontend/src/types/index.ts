// Core data types for the SWoT application

export interface User {
  id: string
  email: string
  name?: string
  profileImageUrl?: string
  createdAt: Date
}

export interface Workout {
  id: string
  userId: string
  name: string
  date: Date
  startTime?: Date
  endTime?: Date
  durationMinutes?: number
  notes?: string
  totalVolume: number
  exercises: Exercise[]
}

export interface Exercise {
  id: string
  workoutId: string
  exerciseName: string
  exerciseOrder: number
  notes?: string
  sets: Set[]
}

export interface Set {
  id: string
  exerciseId: string
  setOrder: number
  reps: number
  weight: number
  isWarmup: boolean
  isDropset: boolean
  restSeconds?: number
}

export interface Routine {
  id: string
  userId: string
  name: string
  description?: string
  exercises: RoutineExercise[]
  isPublic: boolean
}

export interface RoutineExercise {
  exerciseName: string
  order: number
  targetSets?: number
  targetReps?: number
  targetWeight?: number
  notes?: string
}

export interface ExerciseDefinition {
  id: string
  name: string
  category: string
  muscleGroups: string[]
  equipment?: string
  instructions?: string
  isCustom: boolean
  createdBy?: string
}

export interface ProgressData {
  date: Date
  weight: number
  volume: number
  oneRepMax: number
}

export interface PersonalBest {
  exerciseName: string
  weight: number
  reps: number
  date: Date
  oneRepMax: number
}

export interface PlateauAlert {
  exerciseName: string
  lastProgressDate: Date
  daysSinceProgress: number
  suggestion: string
}

// API Response types
export interface AuthResult {
  user: User | null
  error: string | null
}

export interface SyncResult {
  success: boolean
  conflicts: DataConflict[]
  error?: string
}

export interface DataConflict {
  id: string
  type: 'workout' | 'exercise' | 'set'
  localData: Record<string, unknown>
  serverData: Record<string, unknown>
  timestamp: Date
}

// Utility types
export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export interface VolumeData {
  date: Date
  volume: number
  exerciseCount: number
}

export interface ErrorMetadata {
  context: string
  userId?: string
  timestamp: Date
  userAgent?: string
}