'use client'

import { useState, useEffect } from 'react'
import { Play, Target, Plus, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRoutine } from '@/hooks/useRoutine'
import { useWorkout } from '@/hooks/useWorkout'
import type { Routine } from '@/types'

interface QuickStartRoutinesProps {
  onStartWorkout?: () => void
}

export function QuickStartRoutines({ onStartWorkout }: QuickStartRoutinesProps) {
  const { userRoutines, loading, loadUserRoutines } = useRoutine()
  const { startWorkout } = useWorkout()

  useEffect(() => {
    loadUserRoutines()
  }, [loadUserRoutines])

  const handleStartFromRoutine = async (routine: Routine) => {
    try {
      await startWorkout(routine)
      onStartWorkout?.()
    } catch (err) {
      console.error('Failed to start workout from routine:', err)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (userRoutines.length === 0) {
    return (
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            No routines yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Create your first routine to get structured workouts and track your progress
          </p>
          <Button 
            onClick={() => window.location.href = '/routines'}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 h-12"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Routine
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show up to 3 most recent routines
  const recentRoutines = userRoutines.slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recentRoutines.map((routine) => (
        <Card key={routine.id} className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">
                    {routine.name}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    <span>{routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {routine.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {routine.description}
                </p>
              )}
            </div>
            
            {/* Exercise Preview */}
            {routine.exercises.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50/80 rounded-xl">
                <div className="space-y-2">
                  {routine.exercises.slice(0, 2).map((exercise, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="truncate font-medium text-gray-700">{exercise.exerciseName}</span>
                      {exercise.targetSets && exercise.targetReps && (
                        <span className="ml-2 text-gray-500 bg-white px-2 py-1 rounded-md text-xs font-medium">
                          {exercise.targetSets}×{exercise.targetReps}
                        </span>
                      )}
                    </div>
                  ))}
                  {routine.exercises.length > 2 && (
                    <div className="text-gray-500 italic text-xs text-center pt-1">
                      +{routine.exercises.length - 2} more exercises
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={() => handleStartFromRoutine(routine)}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold h-11"
              disabled={routine.exercises.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}