'use client'

import { useState } from 'react'
import { Play, X, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkout } from '@/hooks/useWorkout'

interface WorkoutStarterProps {
  onStart?: () => void
  onCancel?: () => void
}

export function WorkoutStarter({ onStart, onCancel }: WorkoutStarterProps) {
  const [workoutName, setWorkoutName] = useState('')
  const { startWorkout, loading, error } = useWorkout()

  const handleStartWorkout = async () => {
    try {
      const finalWorkoutName = workoutName.trim() || defaultName
      await startWorkout(undefined, finalWorkoutName)
      onStart?.()
    } catch (err) {
      console.error('Failed to start workout:', err)
      // The error will also be displayed in the UI via the error state from useWorkout
    }
  }

  const generateWorkoutName = () => {
    const today = new Date()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[today.getDay()]
    return `${dayName} Workout - ${today.toLocaleDateString()}`
  }

  const defaultName = generateWorkoutName()

  return (
    <Card className="w-full max-w-lg mx-auto border-0 bg-white/80 backdrop-blur-sm shadow-xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Start New Workout</h2>
          <p className="text-gray-600">Ready to crush your goals? Let's get started!</p>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="absolute top-4 right-4">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">Workout Name</label>
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder={defaultName}
              className="h-12 bg-white/60 backdrop-blur-sm border-0 text-base"
            />
            <p className="text-xs text-gray-500">
              Leave empty to use: &quot;{defaultName}&quot;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-gray-500">Today</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-gray-500">Start time</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              What you can track:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Exercise library access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Sets, reps & weight</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Rest times & notes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Auto-save progress</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel} 
                className="flex-1 h-12 bg-white/60 backdrop-blur-sm border-0 hover:bg-white/80"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleStartWorkout}
              disabled={loading}
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
            >
              {loading ? 'Starting...' : 'Start Workout'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}