'use client'

import { useState } from 'react'
import { Plus, Save, X, Clock, NotebookPen, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExerciseSelector } from './ExerciseSelector'
import { SetLogger } from './SetLogger'
import { useWorkout } from '@/hooks/useWorkout'
import type { ExerciseDefinition, Exercise, Set as WorkoutSet } from '@/types'

interface WorkoutLoggerProps {
  onClose?: () => void
}

export function WorkoutLogger({ onClose }: WorkoutLoggerProps) {
  const {
    currentWorkout,
    isActive,
    elapsedTimeFormatted,
    isSaving,
    addExercise,
    updateExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateWorkoutDetails,
    saveWorkout,
    endWorkout,
    error,
    clearError
  } = useWorkout()

  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState(currentWorkout?.notes || '')

  const handleSelectExercise = (exerciseDefinition: ExerciseDefinition) => {
    if (!currentWorkout) return

    const newExercise: Exercise = {
      id: `exercise_${Date.now()}`, // Temporary ID
      workoutId: currentWorkout.id,
      exerciseName: exerciseDefinition.name,
      exerciseOrder: currentWorkout.exercises.length + 1,
      notes: '',
      sets: []
    }

    addExercise(newExercise)
    setShowExerciseSelector(false)
  }

  const handleAddSet = (exerciseId: string, setData: Omit<WorkoutSet, 'id'>) => {
    const newSet: WorkoutSet = {
      ...setData,
      id: `set_${Date.now()}`, // Temporary ID
      exerciseId
    }
    addSet(exerciseId, newSet)
  }

  const handleSaveWorkout = async () => {
    try {
      await saveWorkout()
    } catch (err) {
      console.error('Failed to save workout:', err)
    }
  }

  const handleEndWorkout = async () => {
    try {
      await endWorkout()
      onClose?.()
    } catch (err) {
      console.error('Failed to end workout:', err)
    }
  }

  const handleUpdateWorkoutNotes = () => {
    updateWorkoutDetails({ notes: workoutNotes })
  }

  if (!currentWorkout || !isActive) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No active workout session</p>
        </CardContent>
      </Card>
    )
  }

  if (showExerciseSelector) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Exercise</h2>
          <Button
            variant="ghost"
            onClick={() => setShowExerciseSelector(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ExerciseSelector
          onSelectExercise={handleSelectExercise}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h1 className="text-xl">{currentWorkout.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{elapsedTimeFormatted}</span>
                </div>
                <span>{currentWorkout.date.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveWorkout}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleEndWorkout}
                disabled={isSaving}
              >
                End Workout
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Workout Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Workout Notes
            </label>
            <div className="flex gap-2">
              <Input
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="Add notes about this workout..."
                onBlur={handleUpdateWorkoutNotes}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        {currentWorkout.exercises.map((exercise) => (
          <div key={exercise.id} className="space-y-2">
            <SetLogger
              sets={exercise.sets}
              onAddSet={(setData) => handleAddSet(exercise.id, setData)}
              onUpdateSet={(setId, updates) => updateSet(exercise.id, setId, updates)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              exerciseName={exercise.exerciseName}
            />
            
            {/* Exercise Notes */}
            <div className="px-3">
              <Input
                value={exercise.notes || ''}
                onChange={(e) => updateExercise(exercise.id, { notes: e.target.value })}
                placeholder="Exercise notes..."
                className="text-sm"
              />
            </div>
          </div>
        ))}

        {/* Add Exercise Button */}
        {currentWorkout.exercises.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Ready to start lifting?
              </h3>
              <p className="text-gray-500 mb-4">
                Add your first exercise to begin tracking your workout
              </p>
              <Button
                onClick={() => setShowExerciseSelector(true)}
                size="lg"
                className="px-8"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Exercise
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowExerciseSelector(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Exercise
          </Button>
        )}
      </div>
    </div>
  )
}