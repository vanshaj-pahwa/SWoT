// Analytics service implementation for progress tracking and calculations
import { supabase } from '@/lib/supabase'
import type {
  ProgressData,
  PersonalBest,
  PlateauAlert,
  VolumeData,
  TimeRange,
  Workout,
  Set as WorkoutSet
} from '@/types'

export class AnalyticsService {
  /**
   * Calculate One Rep Max using the Epley formula: weight * (1 + reps/30)
   */
  static calculateOneRepMax(sets: WorkoutSet[]): number {
    if (!sets.length) return 0

    // Filter out warmup sets and find the best set for 1RM calculation
    const workingSets = sets.filter(set => !set.isWarmup && set.reps > 0 && set.weight > 0)
    if (!workingSets.length) return 0

    // Calculate 1RM for each set and return the highest
    const oneRepMaxes = workingSets.map(set => {
      if (set.reps === 1) return set.weight
      return set.weight * (1 + set.reps / 30)
    })

    return Math.max(...oneRepMaxes)
  }

  /**
   * Calculate total volume for an exercise (sum of sets * reps * weight)
   */
  static calculateExerciseVolume(sets: WorkoutSet[]): number {
    return sets
      .filter(set => !set.isWarmup)
      .reduce((total, set) => total + (set.reps * set.weight), 0)
  }

  /**
   * Calculate total volume for a workout
   */
  static calculateWorkoutVolume(workout: Workout): number {
    return workout.exercises.reduce((total, exercise) => {
      return total + this.calculateExerciseVolume(exercise.sets)
    }, 0)
  }

  /**
   * Get progress data for a specific exercise over time
   */
  static async getProgressData(userId: string, exerciseName: string, timeRange: TimeRange = 'all'): Promise<ProgressData[]> {
    let dateFilter = ''
    const now = new Date()

    switch (timeRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
    }

    let query = (supabase as any)
      .from('workouts')
      .select(`
        date,
        exercises!inner (
          exercise_name,
          sets!inner (
            reps,
            weight,
            is_warmup
          )
        )
      `)
      .eq('user_id', userId)
      .eq('exercises.exercise_name', exerciseName)
      .eq('exercises.sets.is_warmup', false)
      .order('date', { ascending: true })

    if (dateFilter && timeRange !== 'all') {
      query = query.gte('date', dateFilter)
    }

    const { data, error } = await query

    if (error) throw error

    // Process the data to calculate progress metrics
    const progressMap = new Map<string, {
      date: Date
      weights: number[]
      volumes: number[]
      oneRepMaxes: number[]
    }>()

    data?.forEach((workout: any) => {
      const dateKey = workout.date
      if (!progressMap.has(dateKey)) {
        progressMap.set(dateKey, {
          date: new Date(dateKey),
          weights: [],
          volumes: [],
          oneRepMaxes: []
        })
      }

      const dayData = progressMap.get(dateKey)!

      workout.exercises.forEach((exercise: any) => {
        exercise.sets.forEach((set: any) => {
          dayData.weights.push(set.weight)
          dayData.volumes.push(set.reps * set.weight)
          dayData.oneRepMaxes.push(this.calculateOneRepMax([set]))
        })
      })
    })

    return Array.from(progressMap.values()).map(dayData => ({
      date: dayData.date,
      weight: Math.max(...dayData.weights, 0),
      volume: dayData.volumes.reduce((sum, vol) => sum + vol, 0),
      oneRepMax: Math.max(...dayData.oneRepMaxes, 0)
    }))
  }

  /**
   * Get volume progression data across all workouts
   */
  static async getVolumeProgression(userId: string, timeRange: TimeRange = '30d'): Promise<VolumeData[]> {
    let dateFilter = ''
    const now = new Date()

    switch (timeRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
    }

    let query = (supabase as any)
      .from('workouts')
      .select(`
        date,
        total_volume,
        exercises!inner (
          exercise_name
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (dateFilter && timeRange !== 'all') {
      query = query.gte('date', dateFilter)
    }

    const { data, error } = await query

    if (error) throw error

    // Group by date and calculate metrics
    const volumeMap = new Map<string, { volume: number; exercises: Set<string> }>()

    data?.forEach((workout: any) => {
      const dateKey = workout.date
      if (!volumeMap.has(dateKey)) {
        volumeMap.set(dateKey, { volume: 0, exercises: new Set() })
      }

      const dayData = volumeMap.get(dateKey)!
      dayData.volume += workout.total_volume || 0

      workout.exercises.forEach((exercise: any) => {
        dayData.exercises.add(exercise.exercise_name)
      })
    })

    return Array.from(volumeMap.entries()).map(([dateStr, data]) => ({
      date: new Date(dateStr),
      volume: data.volume,
      exerciseCount: data.exercises.size
    }))
  }

  /**
   * Generate personal bests for all exercises
   */
  static async generatePersonalBests(userId: string): Promise<PersonalBest[]> {
    const { data, error } = await (supabase as any)
      .from('workouts')
      .select(`
        date,
        exercises!inner (
          exercise_name,
          sets!inner (
            reps,
            weight,
            is_warmup
          )
        )
      `)
      .eq('user_id', userId)
      .eq('exercises.sets.is_warmup', false)

    if (error) throw error

    // Process data to find personal bests
    const exerciseBests = new Map<string, PersonalBest>()

    data?.forEach((workout: any) => {
      workout.exercises.forEach((exercise: any) => {
        exercise.sets.forEach((set: any) => {
          const oneRepMax = this.calculateOneRepMax([set])
          const existing = exerciseBests.get(exercise.exercise_name)

          if (!existing || oneRepMax > existing.oneRepMax ||
            (oneRepMax === existing.oneRepMax && set.weight > existing.weight)) {
            exerciseBests.set(exercise.exercise_name, {
              exerciseName: exercise.exercise_name,
              weight: set.weight,
              reps: set.reps,
              date: new Date(workout.date),
              oneRepMax
            })
          }
        })
      })
    })

    return Array.from(exerciseBests.values())
  }

  /**
   * Detect plateaus in exercise progress
   */
  static async detectPlateaus(userId: string, daysSinceProgressThreshold: number = 21): Promise<PlateauAlert[]> {
    // For now, use a simplified approach without the database function
    // since we're working with the existing database structure
    const { data, error } = await (supabase as any)
      .from('workouts')
      .select(`
        date,
        exercises!inner (
          exercise_name,
          sets!inner (
            reps,
            weight,
            is_warmup
          )
        )
      `)
      .eq('user_id', userId)
      .eq('exercises.sets.is_warmup', false)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    // Process data to detect plateaus
    const exerciseProgress = new Map<string, { maxWeight: number; maxOneRM: number; lastProgressDate: Date }>()
    const plateaus: PlateauAlert[] = []

    data?.forEach((workout: any) => {
      workout.exercises.forEach((exercise: any) => {
        const exerciseName = exercise.exercise_name
        const workoutDate = new Date(workout.date)

        let maxWeight = 0
        let maxOneRM = 0

        exercise.sets.forEach((set: any) => {
          maxWeight = Math.max(maxWeight, set.weight)
          maxOneRM = Math.max(maxOneRM, this.calculateOneRepMax([set]))
        })

        const existing = exerciseProgress.get(exerciseName)
        if (!existing || maxWeight > existing.maxWeight || maxOneRM > existing.maxOneRM) {
          exerciseProgress.set(exerciseName, {
            maxWeight,
            maxOneRM,
            lastProgressDate: workoutDate
          })
        }
      })
    })

    const now = new Date()
    exerciseProgress.forEach((progress, exerciseName) => {
      const daysSinceProgress = Math.floor((now.getTime() - progress.lastProgressDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceProgress >= daysSinceProgressThreshold) {
        plateaus.push({
          exerciseName,
          lastProgressDate: progress.lastProgressDate,
          daysSinceProgress,
          suggestion: this.generatePlateauSuggestion(exerciseName, daysSinceProgress)
        })
      }
    })

    return plateaus.sort((a, b) => b.daysSinceProgress - a.daysSinceProgress)
  }

  /**
   * Generate suggestions for breaking plateaus
   */
  private static generatePlateauSuggestion(exerciseName: string, daysSinceProgress: number): string {
    const suggestions = [
      'Try increasing the weight by 2.5-5lbs',
      'Add an extra set to increase volume',
      'Focus on slower, controlled reps',
      'Try a different rep range (if doing 8-10, try 5-6)',
      'Add pause reps or tempo variations',
      'Consider deload week with 70% weight',
      'Try a different exercise variation'
    ]

    // More specific suggestions based on time since progress
    if (daysSinceProgress > 42) {
      return 'Consider a deload week or switching to a different exercise variation'
    } else if (daysSinceProgress > 28) {
      return 'Try changing your rep range or adding volume'
    } else {
      return suggestions[Math.floor(Math.random() * suggestions.length)]
    }
  }

  /**
   * Get workout frequency data
   */
  static async getWorkoutFrequency(userId: string, timeRange: TimeRange = '30d'): Promise<{ date: Date; workoutCount: number }[]> {
    let dateFilter = ''
    const now = new Date()

    switch (timeRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
    }

    let query = (supabase as any)
      .from('workouts')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (dateFilter && timeRange !== 'all') {
      query = query.gte('date', dateFilter)
    }

    const { data, error } = await query

    if (error) throw error

    // Count workouts per date
    const frequencyMap = new Map<string, number>()

    data?.forEach((workout: any) => {
      const dateKey = workout.date
      frequencyMap.set(dateKey, (frequencyMap.get(dateKey) || 0) + 1)
    })

    return Array.from(frequencyMap.entries()).map(([dateStr, count]) => ({
      date: new Date(dateStr),
      workoutCount: count
    }))
  }

  /**
   * Get exercise performance trends (weight progression over time)
   */
  static async getExercisePerformanceTrends(userId: string, exerciseName: string, timeRange: TimeRange = '90d'): Promise<{
    date: Date
    maxWeight: number
    avgWeight: number
    totalSets: number
    totalReps: number
    volume: number
  }[]> {
    // For now, return the same data as getProgressData but with additional metrics
    const progressData = await this.getProgressData(userId, exerciseName, timeRange)

    return progressData.map(item => ({
      date: item.date,
      maxWeight: item.weight,
      avgWeight: item.weight, // Simplified - would need more complex query for true average
      totalSets: 1, // Simplified
      totalReps: 1, // Simplified
      volume: item.volume
    }))
  }

  /**
   * Calculate consistency score (percentage of planned workout days completed)
   */
  static calculateConsistencyScore(workoutDates: Date[], targetDaysPerWeek: number = 3): number {
    if (!workoutDates.length) return 0

    const sortedDates = workoutDates.sort((a, b) => a.getTime() - b.getTime())
    const firstDate = sortedDates[0]
    const lastDate = sortedDates[sortedDates.length - 1]

    const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.ceil(totalDays / 7)
    const expectedWorkouts = totalWeeks * targetDaysPerWeek

    return Math.min(100, (workoutDates.length / expectedWorkouts) * 100)
  }

  /**
   * Get top performing exercises by volume or 1RM improvement
   */
  static async getTopPerformingExercises(userId: string, timeRange: TimeRange = '30d', metric: 'volume' | 'strength' = 'volume'): Promise<{
    exerciseName: string
    improvement: number
    currentValue: number
    previousValue: number
  }[]> {
    // Simplified implementation - would need more complex logic for true comparison
    const personalBests = await this.generatePersonalBests(userId)

    return personalBests.slice(0, 5).map(best => ({
      exerciseName: best.exerciseName,
      improvement: 10, // Placeholder
      currentValue: metric === 'volume' ? best.weight * best.reps : best.oneRepMax,
      previousValue: (metric === 'volume' ? best.weight * best.reps : best.oneRepMax) * 0.9 // Placeholder
    }))
  }
}