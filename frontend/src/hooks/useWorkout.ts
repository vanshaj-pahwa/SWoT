// Workout hook implementation
import { useState, useCallback } from 'react'
import { useWorkoutStore } from '@/stores/workoutStore'
import { WorkoutService } from '@/services/workout'
import type { Workout, Routine } from '@/types'

export function useWorkout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    currentWorkout,
    isActive,
    startTime,
    elapsedSeconds,
    isSaving,
    lastSaved,
    startWorkout: storeStartWorkout,
    endWorkout: storeEndWorkout,
    saveWorkout: storeSaveWorkout,
    addExercise,
    updateExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateWorkoutDetails,
    startTimer,
    stopTimer,
    resetTimer
  } = useWorkoutStore()

  const startWorkout = useCallback(async (routine?: Routine, customName?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('useWorkout: Starting workout with:', { routine: routine?.name, customName })
      const workout = await WorkoutService.createWorkout(routine, customName)
      console.log('useWorkout: Workout created successfully:', workout.id)
      storeStartWorkout(workout)
      console.log('useWorkout: Workout stored in state')
    } catch (err) {
      console.error('useWorkout: Error in startWorkout:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to start workout'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [storeStartWorkout])

  const saveWorkout = useCallback(async () => {
    if (!currentWorkout) return
    
    setError(null)
    try {
      await storeSaveWorkout()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save workout'
      setError(errorMessage)
      throw err
    }
  }, [currentWorkout, storeSaveWorkout])

  const endWorkout = useCallback(async () => {
    setError(null)
    try {
      await storeEndWorkout()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end workout'
      setError(errorMessage)
      throw err
    }
  }, [storeEndWorkout])

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    // State
    currentWorkout,
    isActive,
    startTime,
    elapsedSeconds,
    elapsedTimeFormatted: formatElapsedTime(elapsedSeconds),
    isSaving,
    lastSaved,
    loading,
    error,
    
    // Actions
    startWorkout,
    endWorkout,
    saveWorkout,
    addExercise,
    updateExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateWorkoutDetails,
    
    // Timer controls
    startTimer,
    stopTimer,
    resetTimer,
    
    // Utility
    clearError: () => setError(null)
  }
}