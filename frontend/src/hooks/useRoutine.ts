// Custom hook for routine management
import { useCallback } from 'react'
import { useRoutineStore } from '@/stores/routineStore'
import { RoutineService } from '@/services/routine'
import type { Routine, RoutineExercise } from '@/types'

export function useRoutine() {
  const {
    currentRoutine,
    userRoutines,
    publicRoutines,
    loading,
    saving,
    error,
    setCurrentRoutine,
    setUserRoutines,
    setPublicRoutines,
    setLoading,
    setSaving,
    setError,
    updateRoutineName,
    updateRoutineDescription,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
    reorderExercises,
    updateExerciseInRoutine,
    resetCurrentRoutine,
    clearError
  } = useRoutineStore()

  // Load user routines
  const loadUserRoutines = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const routines = await RoutineService.getUserRoutines()
      setUserRoutines(routines)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routines')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setUserRoutines])

  // Load public routines
  const loadPublicRoutines = useCallback(async (limit?: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const routines = await RoutineService.getPublicRoutines(limit)
      setPublicRoutines(routines)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load public routines')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setPublicRoutines])

  // Create a new routine
  const createRoutine = useCallback(async (routineData: Omit<Routine, 'id'>) => {
    setSaving(true)
    setError(null)
    
    try {
      const newRoutine = await RoutineService.createRoutine(routineData)
      setUserRoutines([newRoutine, ...userRoutines])
      setCurrentRoutine(newRoutine)
      return newRoutine
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create routine')
      throw err
    } finally {
      setSaving(false)
    }
  }, [setSaving, setError, setUserRoutines, setCurrentRoutine, userRoutines])

  // Save current routine
  const saveCurrentRoutine = useCallback(async () => {
    if (!currentRoutine) return
    
    setSaving(true)
    setError(null)
    
    try {
      await RoutineService.updateRoutine(currentRoutine.id, currentRoutine)
      
      // Update the routine in the user routines list
      const updatedRoutines = userRoutines.map(routine => 
        routine.id === currentRoutine.id ? currentRoutine : routine
      )
      setUserRoutines(updatedRoutines)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save routine')
      throw err
    } finally {
      setSaving(false)
    }
  }, [currentRoutine, setSaving, setError, userRoutines, setUserRoutines])

  // Delete a routine
  const deleteRoutine = useCallback(async (routineId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await RoutineService.deleteRoutine(routineId)
      
      // Remove from user routines
      const updatedRoutines = userRoutines.filter(routine => routine.id !== routineId)
      setUserRoutines(updatedRoutines)
      
      // Clear current routine if it was deleted
      if (currentRoutine?.id === routineId) {
        resetCurrentRoutine()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete routine')
      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, userRoutines, setUserRoutines, currentRoutine, resetCurrentRoutine])

  // Clone a routine
  const cloneRoutine = useCallback(async (routineId: string, newName?: string) => {
    setSaving(true)
    setError(null)
    
    try {
      const clonedRoutine = await RoutineService.cloneRoutine(routineId, newName)
      setUserRoutines([clonedRoutine, ...userRoutines])
      return clonedRoutine
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone routine')
      throw err
    } finally {
      setSaving(false)
    }
  }, [setSaving, setError, setUserRoutines, userRoutines])

  // Load a specific routine
  const loadRoutine = useCallback(async (routineId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const routine = await RoutineService.getRoutineById(routineId)
      if (routine) {
        setCurrentRoutine(routine)
      } else {
        setError('Routine not found')
      }
      return routine
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routine')
      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setCurrentRoutine])

  // Search routines
  const searchRoutines = useCallback(async (query: string, includePublic: boolean = true) => {
    setLoading(true)
    setError(null)
    
    try {
      const routines = await RoutineService.searchRoutines(query, includePublic)
      return routines
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search routines')
      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  // Start a new routine
  const startNewRoutine = useCallback(() => {
    const newRoutine: Routine = {
      id: '', // Will be set when saved
      userId: '', // Will be set when saved
      name: '',
      description: '',
      exercises: [],
      isPublic: false
    }
    setCurrentRoutine(newRoutine)
  }, [setCurrentRoutine])

  return {
    // State
    currentRoutine,
    userRoutines,
    publicRoutines,
    loading,
    saving,
    error,
    
    // Actions
    loadUserRoutines,
    loadPublicRoutines,
    createRoutine,
    saveCurrentRoutine,
    deleteRoutine,
    cloneRoutine,
    loadRoutine,
    searchRoutines,
    startNewRoutine,
    
    // Routine editing
    updateRoutineName,
    updateRoutineDescription,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
    reorderExercises,
    updateExerciseInRoutine,
    
    // Utility
    setCurrentRoutine,
    resetCurrentRoutine,
    clearError
  }
}