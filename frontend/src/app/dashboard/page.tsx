'use client'

import { useState, useEffect } from 'react'
import { Play, Dumbbell, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WorkoutLogger, WorkoutHistory, WorkoutDetail, WorkoutStarter } from '@/components/workout'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { DashboardService, type DashboardStats } from '@/services/dashboard'
import { useWorkout } from '@/hooks/useWorkout'
import { useAuth } from '@/hooks/useAuth'
import type { Workout } from '@/types'

type ViewMode = 'dashboard' | 'start-workout' | 'active-workout' | 'history' | 'workout-detail'

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const { currentWorkout, isActive, error } = useWorkout()
  const { user, isAuthenticated } = useAuth()

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Load dashboard stats
  useEffect(() => {
    if (user?.id) {
      loadDashboardStats()
    }
  }, [user?.id])

  const loadDashboardStats = async () => {
    if (!user?.id) return

    try {
      setLoadingStats(true)
      const dashboardStats = await DashboardService.getDashboardStats(user.id)
      setStats(dashboardStats)
    } catch (err) {
      console.error('Failed to load dashboard stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  // Auto-redirect to active workout if one exists
  useEffect(() => {
    if (isActive && currentWorkout && viewMode === 'dashboard') {
      // Don't auto-redirect, let user choose
    }
  }, [isActive, currentWorkout, viewMode])



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
    // Reload stats when returning to dashboard
    loadDashboardStats()
  }

  const handleWorkoutEnd = () => {
    setViewMode('dashboard')
    // Reload stats after workout ends
    loadDashboardStats()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">SW</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Please Sign In</h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to access your workout dashboard.
            </p>
            <Button asChild className="bg-gradient-to-r from-slate-500 to-blue-600 hover:from-slate-600 hover:to-blue-700 text-white">
              <a href="/auth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Greeting Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {getGreeting()} 👋
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'Athlete'}!
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-0 bg-red-50 shadow-lg">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {viewMode === 'dashboard' && (
          <div className="space-y-6">
            {/* Active Workout Alert */}
            {isActive && currentWorkout && (
              <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-green-100 rounded-2xl flex items-center justify-center">
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
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                      size="lg"
                    >
                      Continue Workout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Row - Stats and Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                <Card className="border-0 bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Workouts</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {loadingStats ? '...' : stats?.workoutsThisWeek || 0}
                      <span className="text-lg text-gray-500">this week</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-sm text-gray-600 mb-1">Volume</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {loadingStats ? '...' : Math.round(stats?.totalVolumeThisWeek || 0)}
                      <span className="text-lg text-gray-500">lbs</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-sm text-gray-600 mb-1">PRs</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {loadingStats ? '...' : stats?.personalRecordsCount || 0}
                      <span className="text-lg text-gray-500">new</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Streak Card */}
              <Card className="border-0 bg-gradient-to-br from-slate-100 to-blue-100 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm text-gray-700 mb-1">Current Streak</div>
                      <div className="text-4xl font-bold text-gray-900">
                        {loadingStats ? '...' : stats?.currentStreak || 0}
                      </div>
                      <div className="text-sm text-gray-600">days</div>
                    </div>
                    <Activity className="h-8 w-8 text-slate-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity and Progress Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
                    <span className="text-sm text-gray-600">This Week</span>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {loadingStats ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400">
                        Loading...
                      </div>
                    ) : (
                      stats?.weeklyActivity.map((day, i) => (
                        <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: `${day.percentage || 5}%`, minHeight: '8px' }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-400 to-blue-500 rounded-t-lg"></div>
                            {day.percentage >= 80 && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                                {day.percentage}%
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-600">{day.day}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Progress */}
              <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
                  <div className="flex items-center justify-center h-48">
                    {loadingStats ? (
                      <div className="text-gray-400">Loading...</div>
                    ) : (
                      <div className="relative">
                        <svg className="w-40 h-40 transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="#f3f4f6"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 70 * ((stats?.monthlyProgress || 0) / 100)} ${2 * Math.PI * 70}`}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#94a3b8" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">{stats?.monthlyProgress || 0}%</div>
                            <div className="text-xs text-gray-500">of your goal</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    You have achieved {stats?.monthlyProgress || 0}% of your goal this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity - Full Width */}
            <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button
                    onClick={() => setViewMode('history')}
                    className="text-sm text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {loadingStats ? (
                    <div className="col-span-full text-center text-gray-400 py-4">Loading...</div>
                  ) : stats?.recentGoals && stats.recentGoals.length > 0 ? (
                    stats.recentGoals.map((goal, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-slate-600" />
                          <div>
                            <div className="font-medium text-gray-900">{goal.name}</div>
                            <div className="text-xs text-gray-500">{goal.date}</div>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
                          {goal.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-4">
                      No recent workouts. Start your first workout!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
    </DashboardLayout>
  )
}