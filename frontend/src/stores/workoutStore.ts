// Workout state management with timer functionality
import { create } from 'zustand'
import type { Workout, Exercise, Set as WorkoutSet } from '@/types'
import { WorkoutService } from '@/services/workout'

interface WorkoutState {
  currentWorkout: Workout | null
  isActive: boolean
  startTime: Date | null
  elapsedSeconds: number
  timerInterval: NodeJS.Timeout | null
  isSaving: boolean
  lastSaved: Date | null
  
  // Actions
  startWorkout: (workout: Workout) => void
  endWorkout: () => Promise<void>
  addExercise: (exercise: Exercise) => void
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void
  removeExercise: (exerciseId: string) => void
  addSet: (exerciseId: string, workoutSet: WorkoutSet) => void
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void
  removeSet: (exerciseId: string, setId: string) => void
  saveWorkout: () => Promise<void>
  updateWorkoutDetails: (updates: Partial<Pick<Workout, 'name' | 'notes'>>) => void
  startTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
    currentWorkout: null,
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    timerInterval: null,
    isSaving: false,
    lastSaved: null,

    startWorkout: (workout) => {
      console.log('WorkoutStore: Starting workout in store:', workout.id)
      const startTime = new Date()
      set({
        currentWorkout: {
          ...workout,
          startTime
        },
        isActive: true,
        startTime,
        elapsedSeconds: 0
      })
      console.log('WorkoutStore: Workout state updated, starting timer')
      get().startTimer()
    },

    endWorkout: async () => {
      const { currentWorkout, stopTimer, saveWorkout } = get()
      if (currentWorkout) {
        stopTimer()
        
        // Set end time and save
        const endTime = new Date()
        set({
          currentWorkout: {
            ...currentWorkout,
            endTime
          }
        })
        
        await saveWorkout()
        
        set({
          currentWorkout: null,
          isActive: false,
          startTime: null,
          elapsedSeconds: 0,
          lastSaved: null
        })
      }
    },

    addExercise: (exercise) => {
      const { currentWorkout } = get()
      if (currentWorkout) {
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: [...currentWorkout.exercises, exercise]
          }
        })
      }
    },

    updateExercise: (exerciseId, updates) => {
      const { currentWorkout } = get()
      if (currentWorkout) {
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(ex => 
              ex.id === exerciseId ? { ...ex, ...updates } : ex
            )
          }
        })
      }
    },

    removeExercise: (exerciseId) => {
      const { currentWorkout } = get()
      if (currentWorkout) {
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.filter(ex => ex.id !== exerciseId)
          }
        })
      }
    },

    addSet: (exerciseId, workoutSet) => {
      const { currentWorkout } = get()
      if (currentWorkout) {
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map((ex: Exercise) => 
              ex.id === exerciseId 
                ? { ...ex, sets: [...ex.sets, workoutSet] }
                : ex
            )
          }
        })
      }
    },

    updateSet: (exerciseId, setId, updates) => {
      const { currentWorkout } = get()
      if (currentWorkout) {
        const { currentWorkout } = get()
        if (currentWorkout) {
          set({
            currentWorkout: {
              ...currentWorkout,
              exercises: currentWorkout.exercises.map((ex: Exercise) => 
                ex.id === exerciseId 
                  ? {
                      ...ex,
                      sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
                    }
                  : ex
              )
            }
          })
        }
      }
    },

    removeSet: (exerciseId, setId) => {
      const { currentWorkout } = get()
      if (currentWorkout) {
        const { currentWorkout } = get()
        if (currentWorkout) {
          set({
            currentWorkout: {
              ...currentWorkout,
              exercises: currentWorkout.exercises.map((ex: Exercise) => 
                ex.id === exerciseId 
                  ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
                  : ex
              )
            }
          })
        }
      }
    },

    saveWorkout: async () => {
      const { currentWorkout } = get()
      if (!currentWorkout) return

      set({ isSaving: true })
      try {
        await WorkoutService.saveWorkout(currentWorkout)
        set({ lastSaved: new Date() })
      } catch (error) {
        console.error('Failed to save workout:', error)
        throw error
      } finally {
        set({ isSaving: false })
      }
    },

    updateWorkoutDetails: (updates) => {
      const { currentWorkout } = get()
      if (currentWorkout) {
        set({
          currentWorkout: {
            ...currentWorkout,
            ...updates
          }
        })
      }
    },

    startTimer: () => {
      const { timerInterval } = get()
      if (timerInterval) clearInterval(timerInterval)
      
      const interval = setInterval(() => {
        set((state) => ({
          elapsedSeconds: state.elapsedSeconds + 1
        }))
      }, 1000)
      
      set({ timerInterval: interval })
    },

    stopTimer: () => {
      const { timerInterval } = get()
      if (timerInterval) {
        clearInterval(timerInterval)
        set({ timerInterval: null })
      }
    },

    resetTimer: () => {
      const { stopTimer } = get()
      stopTimer()
      set({ elapsedSeconds: 0 })
    }
  }))