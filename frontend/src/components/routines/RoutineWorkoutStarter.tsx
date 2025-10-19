'use client'

import { useState } from 'react'
import { Play, X, Calendar, Clock, Target, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkout } from '@/hooks/useWorkout'
import type { Routine, RoutineExercise } from '@/types'

interface RoutineWorkoutStarterProps {
  routine: Routine
  onStart?: () => void
  onCancel?: () => void
  onEditRoutine?: (routine: Routine) => void
}

export function RoutineWorkoutStarter({ 
  routine, 
  onStart, 
  onCancel, 
  onEditRoutine 
}: RoutineWorkoutStarterProps) {
  const [workoutName, setWorkoutName] = useState('')
  const { startWorkout, loading, error } = useWorkout()

  const handleStartWorkout = async () => {
    try {
      await startWorkout(routine)
      onStart?.()
    } catch (err) {
      console.error('Failed to start workout from routine:', err)
    }
  }

  const generateWorkoutName = () => {
    const today = new Date()
    return `${routine.name} - ${today.toLocaleDateString()}`
  }

  const defaultName = generateWorkoutName()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            <span>Start Workout from Routine</span>
          </div>
          <div className="flex gap-2">
            {onEditRoutine && (
              <Button variant="ghost" size="sm" onClick={() => onEditRoutine(routine)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Routine Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">{routine.name}</h3>
          {routine.description && (
            <p className="text-blue-700 text-sm mb-3">{routine.description}</p>
          )}
          <div className="text-sm text-blue-600">
            {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''} planned
          </div>
        </div>

        {/* Workout Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Workout Name</label>
          <Input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder={defaultName}
          />
          <p className="text-xs text-gray-500">
            Leave empty to use default name: "{defaultName}"
          </p>
        </div>

        {/* Session Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Exercise Preview */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Planned Exercises
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {routine.exercises.map((exercise, index) => (
              <ExercisePreview key={index} exercise={exercise} index={index} />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">What happens next:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your routine exercises will be pre-loaded</li>
            <li>• You can modify sets, reps, and weights as needed</li>
            <li>• Add or remove exercises during your workout</li>
            <li>• Track your progress with automatic calculations</li>
            <li>• Your workout will be saved automatically</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={handleStartWorkout}
            disabled={loading || routine.exercises.length === 0}
            className="flex-1"
          >
            {loading ? 'Starting...' : 'Start Workout'}
          </Button>
        </div>

        {routine.exercises.length === 0 && (
          <div className="text-center text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm">
              This routine has no exercises. Add some exercises before starting a workout.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ExercisePreviewProps {
  exercise: RoutineExercise
  index: number
}

function ExercisePreview({ exercise, index }: ExercisePreviewProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-sm">
          {index + 1}. {exercise.exerciseName}
        </div>
        {exercise.notes && (
          <div className="text-xs text-gray-500 mt-1 italic">
            "{exercise.notes}"
          </div>
        )}
      </div>
      <div className="text-xs text-gray-600 text-right">
        {exercise.targetSets && exercise.targetReps && (
          <div>{exercise.targetSets} × {exercise.targetReps}</div>
        )}
        {exercise.targetWeight && (
          <div>{exercise.targetWeight} lbs</div>
        )}
      </div>
    </div>
  )
}