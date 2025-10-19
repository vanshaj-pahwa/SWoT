'use client'

import { useState, useEffect } from 'react'
import { Play, History, Dumbbell, TrendingUp, Calendar, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WorkoutLogger, WorkoutHistory, WorkoutDetail, WorkoutStarter } from '@/components/workout'
import { QuickStartRoutines } from '@/components/dashboard'
import { useWorkout } from '@/hooks/useWorkout'
import { useAuth } from '@/hooks/useAuth'
import type { Workout } from '@/types'

type ViewMode = 'dashboard' | 'start-workout' | 'active-workout' | 'history' | 'workout-detail'

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const { currentWorkout, isActive, loading, error } = useWorkout()
  const { user, isAuthenticated } = useAuth()

  // Auto-redirect to active workout if one exists
  useEffect(() => {
    if (isActive && currentWorkout && viewMode === 'dashboard') {
      // Don't auto-redirect, let user choose
    }
  }, [isActive, currentWorkout, viewMode])

  const handleStartWorkout = () => {
    setViewMode('start-workout')
  }

  const handleWorkoutStarted = () => {
    setViewMode('active-workout')
  }

  const handleViewWorkout = (workout: Workout) => {
    setSelectedWorkout(workout)
    setViewMode('workout-detail')
  }

  const handleBackToDashboard = () => {
    setViewMode('dashboard')
    setSelectedWorkout(null)
  }

  const handleWorkoutEnd = () => {
    setViewMode('dashboard')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-4">
              You need to be signed in to access your workout dashboard.
            </p>
            <Button asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Athlete'}! 💪
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Ready to crush your next workout?
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Today</div>
              <div className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {viewMode === 'dashboard' && (
          <div className="space-y-8">
            {/* Active Workout Alert */}
            {isActive && currentWorkout && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Play className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-800">
                          Workout in Progress
                        </h3>
                        <p className="text-green-700">
                          {currentWorkout.name} • Started: {currentWorkout.startTime?.toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-green-600">
                          {currentWorkout.exercises.length} exercises added
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setViewMode('active-workout')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                      size="lg"
                    >
                      Continue Workout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleStartWorkout}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Play className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Start New Workout</h3>
                      <p className="text-gray-600 text-sm">Begin tracking your session</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => window.location.href = '/routines'}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">My Routines</h3>
                      <p className="text-gray-600 text-sm">Manage workout routines</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setViewMode('history')}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <History className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Workout History</h3>
                      <p className="text-gray-600 text-sm">View past sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => window.location.href = '/analytics'}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Analytics</h3>
                      <p className="text-gray-600 text-sm">View progress & insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Routines */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quick Start Routines</h2>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/routines'}
                  className="text-sm"
                >
                  View All Routines
                </Button>
              </div>
              <QuickStartRoutines onStartWorkout={handleWorkoutStarted} />
            </div>

            {/* Recent Workouts */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Workouts</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode('history')}
                  className="text-sm"
                >
                  View All
                </Button>
              </div>
              <WorkoutHistory
                limit={3}
                onViewWorkout={handleViewWorkout}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Workouts This Week</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Total Volume (lbs)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Dumbbell className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Personal Records</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {viewMode === 'start-workout' && (
          <div className="flex justify-center">
            <WorkoutStarter
              onStart={handleWorkoutStarted}
              onCancel={handleBackToDashboard}
            />
          </div>
        )}

        {viewMode === 'active-workout' && (
          <div>
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="mb-2"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <WorkoutLogger onClose={handleWorkoutEnd} />
          </div>
        )}

        {viewMode === 'history' && (
          <div>
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="mb-2"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <WorkoutHistory
              onViewWorkout={handleViewWorkout}
            />
          </div>
        )}

        {viewMode === 'workout-detail' && selectedWorkout && (
          <div>
            <WorkoutDetail
              workoutId={selectedWorkout.id}
              onBack={handleBackToDashboard}
            />
          </div>
        )}
      </div>
    </div>
  )
}