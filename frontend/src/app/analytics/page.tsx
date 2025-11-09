'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AnalyticsService } from '@/services/analytics'
import { WorkoutService } from '@/services/workout'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { ProgressChart } from '@/components/analytics/ProgressChart'
import { VolumeChart } from '@/components/analytics/VolumeChart'
import { PersonalBestsDisplay } from '@/components/analytics/PersonalBestsDisplay'
import { PlateauAlerts } from '@/components/analytics/PlateauAlerts'
import { WorkoutFrequencyChart } from '@/components/analytics/WorkoutFrequencyChart'
import { ExerciseSelector } from '@/components/analytics/ExerciseSelector'
import type { 
  ProgressData, 
  PersonalBest, 
  PlateauAlert, 
  VolumeData, 
  TimeRange 
} from '@/types'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [volumeData, setVolumeData] = useState<VolumeData[]>([])
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([])
  const [plateauAlerts, setPlateauAlerts] = useState<PlateauAlert[]>([])
  const [workoutFrequency, setWorkoutFrequency] = useState<{ date: Date; workoutCount: number }[]>([])
  const [availableExercises, setAvailableExercises] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadAnalyticsData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load available exercises from workout history
        const workouts = await WorkoutService.getWorkoutHistory(user.id, 50)
        const exercises = Array.from(new Set(
          workouts.flatMap(w => w.exercises.map(e => e.exerciseName))
        )).sort()
        setAvailableExercises(exercises)

        // Set default exercise if none selected
        if (!selectedExercise && exercises.length > 0) {
          setSelectedExercise(exercises[0])
        }

        // Load analytics data
        const [
          volumeProgression,
          personalBestsData,
          plateauAlertsData,
          frequencyData
        ] = await Promise.all([
          AnalyticsService.getVolumeProgression(user.id, timeRange),
          AnalyticsService.generatePersonalBests(user.id),
          AnalyticsService.detectPlateaus(user.id),
          AnalyticsService.getWorkoutFrequency(user.id, timeRange)
        ])

        setVolumeData(volumeProgression)
        setPersonalBests(personalBestsData)
        setPlateauAlerts(plateauAlertsData)
        setWorkoutFrequency(frequencyData)

        // Load exercise-specific progress data if exercise is selected
        if (selectedExercise) {
          const exerciseProgress = await AnalyticsService.getProgressData(
            user.id, 
            selectedExercise, 
            timeRange
          )
          setProgressData(exerciseProgress)
        }

      } catch (err) {
        console.error('Failed to load analytics data:', err)
        setError('Failed to load analytics data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [user, selectedExercise, timeRange])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <p>Please sign in to view your analytics.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <p>Loading your analytics data...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <ExerciseSelector
              exercises={availableExercises}
              selectedExercise={selectedExercise}
              onExerciseChange={setSelectedExercise}
            />
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Plateau Alerts */}
        {plateauAlerts.length > 0 && (
          <PlateauAlerts alerts={plateauAlerts} />
        )}

        {/* Personal Bests */}
        <PersonalBestsDisplay personalBests={personalBests} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exercise Progress Chart */}
          {selectedExercise && progressData.length > 0 && (
            <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border-0">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {selectedExercise} Progress
              </h2>
              <ProgressChart data={progressData} />
            </div>
          )}

          {/* Volume Progression Chart */}
          {volumeData.length > 0 && (
            <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border-0">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Volume Progression</h2>
              <VolumeChart data={volumeData} />
            </div>
          )}

          {/* Workout Frequency Chart */}
          {workoutFrequency.length > 0 && (
            <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border-0 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Workout Frequency</h2>
              <WorkoutFrequencyChart data={workoutFrequency} />
            </div>
          )}
        </div>

        {/* Empty State */}
        {availableExercises.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">No Data Available</h2>
            <p className="text-gray-600 mb-4">
              Start logging workouts to see your analytics and progress tracking.
            </p>
            <a
              href="/workout"
              className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-xl transition-all"
            >
              Log Your First Workout
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}