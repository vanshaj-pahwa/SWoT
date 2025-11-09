'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, Dumbbell, NotebookPen, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkoutService } from '@/services/workout'
import { useAuth } from '@/hooks/useAuth'
import { usePreferences } from '@/contexts/PreferencesContext'
import type { Workout } from '@/types'

interface WorkoutDetailProps {
  workoutId: string
  onBack?: () => void
  onEdit?: (workout: Workout) => void
}

export function WorkoutDetail({ workoutId, onBack, onEdit }: WorkoutDetailProps) {
  const { user } = useAuth()
  const { formatWeight, preferences } = usePreferences()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && workoutId) {
      loadWorkout()
    }
  }, [user, workoutId])

  const loadWorkout = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await WorkoutService.getWorkoutById(workoutId, user.id)
      setWorkout(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workout')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatTime = (date?: Date) => {
    if (!date) return 'N/A'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const calculateExerciseVolume = (exercise: any) => {
    return exercise.sets.reduce((total: number, set: any) => {
      return total + (set.reps * set.weight)
    }, 0)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !workout) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error || 'Workout not found'}</p>
            <div className="flex gap-2 justify-center mt-4">
              {onBack && (
                <Button onClick={onBack} variant="outline">
                  Go Back
                </Button>
              )}
              <Button onClick={loadWorkout}>
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle className="text-xl">{workout.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{workout.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(workout.durationMinutes)}</span>
                  </div>
                  {workout.startTime && (
                    <span>Started: {formatTime(workout.startTime)}</span>
                  )}
                  {workout.endTime && (
                    <span>Ended: {formatTime(workout.endTime)}</span>
                  )}
                </div>
              </div>
            </div>
            {onEdit && (
              <Button onClick={() => onEdit(workout)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Workout Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {workout.exercises.length}
              </div>
              <div className="text-sm text-gray-600">Exercise{workout.exercises.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Sets</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatWeight(workout.totalVolume, false)}
              </div>
              <div className="text-sm text-gray-600">Total Volume ({preferences.weightUnit})</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {workout.exercises.reduce((total, ex) => 
                  total + ex.sets.reduce((setTotal, set) => setTotal + set.reps, 0), 0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Reps</div>
            </div>
          </div>

          {/* Workout Notes */}
          {workout.notes && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <NotebookPen className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Workout Notes</span>
              </div>
              <p className="text-blue-700">{workout.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        {workout.exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-gray-600">
                    {exerciseIndex + 1}.
                  </span>
                  <span>{exercise.exerciseName}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatWeight(calculateExerciseVolume(exercise))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Sets */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 pb-2 border-b">
                  <span>Set</span>
                  <span>Reps</span>
                  <span>Weight</span>
                  <span>Type</span>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="grid grid-cols-4 gap-4 text-sm py-2">
                    <span className="font-medium">{setIndex + 1}</span>
                    <span>{set.reps}</span>
                    <span>{formatWeight(set.weight)}</span>
                    <div className="flex gap-1">
                      {set.isWarmup && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Warmup
                        </span>
                      )}
                      {set.isDropset && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Drop
                        </span>
                      )}
                      {!set.isWarmup && !set.isDropset && (
                        <span className="text-xs text-gray-500">Working</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Exercise Notes */}
              {exercise.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <NotebookPen className="h-3 w-3 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Notes</span>
                  </div>
                  <p className="text-sm text-gray-600">{exercise.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {workout.exercises.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Dumbbell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No exercises recorded for this workout</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}