'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Copy, ArrowLeft, Play, Users, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRoutine } from '@/hooks/useRoutine'
import { useWorkout } from '@/hooks/useWorkout'
import type { Routine } from '@/types'

export default function SharedRoutinePage() {
  const params = useParams()
  const router = useRouter()
  const routineId = params.id as string
  
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [cloning, setCloning] = useState(false)
  
  const { loadRoutine, cloneRoutine, loading, error } = useRoutine()
  const { startWorkout } = useWorkout()

  useEffect(() => {
    if (routineId) {
      loadRoutineData()
    }
  }, [routineId])

  const loadRoutineData = async () => {
    try {
      const routineData = await loadRoutine(routineId)
      if (routineData && routineData.isPublic) {
        setRoutine(routineData)
      } else {
        // Routine not found or not public
        setRoutine(null)
      }
    } catch (err) {
      console.error('Failed to load routine:', err)
    }
  }

  const handleClone = async () => {
    if (!routine) return
    
    setCloning(true)
    try {
      await cloneRoutine(routine.id)
      router.push('/routines')
    } catch (err) {
      console.error('Failed to clone routine:', err)
    } finally {
      setCloning(false)
    }
  }

  const handleStartWorkout = async () => {
    if (!routine) return
    
    try {
      await startWorkout(routine)
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to start workout:', err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !routine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Routine Not Available
              </h2>
              <p className="text-red-600 mb-4">
                This routine doesn't exist or is no longer public.
              </p>
              <Button onClick={() => router.push('/routines')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Other Routines
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Shared Routine</span>
          </div>
        </div>

        {/* Routine Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{routine.name}</CardTitle>
            {routine.description && (
              <p className="text-gray-600">{routine.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{routine.exercises.length} exercises</span>
              <span>Public routine</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleStartWorkout}
                className="flex-1"
                disabled={routine.exercises.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
              <Button
                variant="outline"
                onClick={handleClone}
                disabled={cloning}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                {cloning ? 'Cloning...' : 'Clone Routine'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <Card>
          <CardHeader>
            <CardTitle>Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            {routine.exercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                This routine has no exercises yet.
              </div>
            ) : (
              <div className="space-y-3">
                {routine.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {index + 1}. {exercise.exerciseName}
                      </div>
                      {exercise.notes && (
                        <div className="text-sm text-gray-600 italic">
                          "{exercise.notes}"
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 text-right">
                      {exercise.targetSets && exercise.targetReps && (
                        <div>{exercise.targetSets} × {exercise.targetReps}</div>
                      )}
                      {exercise.targetWeight && (
                        <div>{exercise.targetWeight} lbs</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clone Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Copy className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Clone this routine
                </h4>
                <p className="text-sm text-blue-700">
                  Create your own copy of this routine to customize and use in your workouts. 
                  The original routine will remain unchanged.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}