// Routine store for state management
import { create } from 'zustand'
import type { Routine, RoutineExercise } from '@/types'

interface RoutineState {
  // Current routine being edited
  currentRoutine: Routine | null
  
  // User's routines
  userRoutines: Routine[]
  
  // Public routines for discovery
  publicRoutines: Routine[]
  
  // Loading states
  loading: boolean
  saving: boolean
  
  // Error state
  error: string | null
  
  // Actions
  setCurrentRoutine: (routine: Routine | null) => void
  setUserRoutines: (routines: Routine[]) => void
  setPublicRoutines: (routines: Routine[]) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setError: (error: string | null) => void
  
  // Routine editing actions
  updateRoutineName: (name: string) => void
  updateRoutineDescription: (description: string) => void
  addExerciseToRoutine: (exercise: RoutineExercise) => void
  removeExerciseFromRoutine: (index: number) => void
  reorderExercises: (fromIndex: number, toIndex: number) => void
  updateExerciseInRoutine: (index: number, exercise: RoutineExercise) => void
  
  // Reset actions
  resetCurrentRoutine: () => void
  clearError: () => void
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  // Initial state
  currentRoutine: null,
  userRoutines: [],
  publicRoutines: [],
  loading: false,
  saving: false,
  error: null,
  
  // Basic setters
  setCurrentRoutine: (routine) => set({ currentRoutine: routine }),
  setUserRoutines: (routines) => set({ userRoutines: routines }),
  setPublicRoutines: (routines) => set({ publicRoutines: routines }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setError: (error) => set({ error }),
  
  // Routine editing actions
  updateRoutineName: (name) => {
    const { currentRoutine } = get()
    if (currentRoutine) {
      set({ currentRoutine: { ...currentRoutine, name } })
    }
  },
  
  updateRoutineDescription: (description) => {
    const { currentRoutine } = get()
    if (currentRoutine) {
      set({ currentRoutine: { ...currentRoutine, description } })
    }
  },
  
  addExerciseToRoutine: (exercise) => {
    const { currentRoutine } = get()
    if (currentRoutine) {
      const exercises = [...currentRoutine.exercises, exercise]
      set({ currentRoutine: { ...currentRoutine, exercises } })
    }
  },
  
  removeExerciseFromRoutine: (index) => {
    const { currentRoutine } = get()
    if (currentRoutine) {
      const exercises = currentRoutine.exercises.filter((_, i) => i !== index)
      set({ currentRoutine: { ...currentRoutine, exercises } })
    }
  },
  
  reorderExercises: (fromIndex, toIndex) => {
    const { currentRoutine } = get()
    if (currentRoutine) {
      const exercises = [...currentRoutine.exercises]
      const [movedExercise] = exercises.splice(fromIndex, 1)
      exercises.splice(toIndex, 0, movedExercise)
      
      // Update order numbers
      const reorderedExercises = exercises.map((exercise, index) => ({
        ...exercise,
        order: index + 1
      }))
      
      set({ currentRoutine: { ...currentRoutine, exercises: reorderedExercises } })
    }
  },
  
  updateExerciseInRoutine: (index, exercise) => {
    const { currentRoutine } = get()
    if (currentRoutine) {
      const exercises = [...currentRoutine.exercises]
      exercises[index] = exercise
      set({ currentRoutine: { ...currentRoutine, exercises } })
    }
  },
  
  // Reset actions
  resetCurrentRoutine: () => set({ currentRoutine: null, error: null }),
  clearError: () => set({ error: null })
}))