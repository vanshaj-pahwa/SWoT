// Dashboard service for fetching real-time statistics
import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  workoutsThisWeek: number
  totalVolumeThisWeek: number
  personalRecordsCount: number
  currentStreak: number
  weeklyActivity: { day: string; percentage: number }[]
  monthlyProgress: number
  recentGoals: {
    name: string
    date: string
    type: string
    status: string
  }[]
}

export class DashboardService {
  /**
   * Get workouts count for current week
   */
  static async getWorkoutsThisWeek(userId: string): Promise<number> {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
    startOfWeek.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', startOfWeek.toISOString().split('T')[0])

    if (error) throw error
    return count || 0
  }

  /**
   * Get total volume for current week
   */
  static async getTotalVolumeThisWeek(userId: string): Promise<number> {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('workouts')
      .select('total_volume')
      .eq('user_id', userId)
      .gte('date', startOfWeek.toISOString().split('T')[0])

    if (error) throw error
    
    return (data as { total_volume: number }[])?.reduce((sum, workout) => sum + (workout.total_volume || 0), 0) || 0
  }

  /**
   * Get personal records count (last 30 days)
   * For now, we'll count unique exercises with max weights in last 30 days
   */
  static async getPersonalRecordsCount(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    try {
      // Get workouts from last 30 days with exercises
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          exercises (
            exercise_name,
            sets (
              weight
            )
          )
        `)
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

      if (error) throw error

      // Count unique exercises (simplified PR count)
      const exercises = data as any[]
      const uniqueExercises = new Set()
      
      exercises?.forEach((workout: any) => {
        workout.exercises?.forEach((exercise: any) => {
          if (exercise.sets && exercise.sets.length > 0) {
            uniqueExercises.add(exercise.exercise_name)
          }
        })
      })

      return uniqueExercises.size
    } catch (err) {
      console.error('Error fetching personal records:', err)
      return 0
    }
  }

  /**
   * Get weekly activity data for chart
   */
  static async getWeeklyActivity(userId: string): Promise<{ day: string; percentage: number }[]> {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('workouts')
      .select('date, total_volume')
      .eq('user_id', userId)
      .gte('date', startOfWeek.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const activityMap = new Map<string, number>()

    // Initialize all days with 0
    days.forEach(day => activityMap.set(day, 0))

    // Fill in actual data
    const workouts = data as { date: string; total_volume: number }[] | null
    workouts?.forEach((workout) => {
      const workoutDate = new Date(workout.date)
      const dayName = days[workoutDate.getDay()]
      activityMap.set(dayName, (activityMap.get(dayName) || 0) + (workout.total_volume || 0))
    })

    // Find max volume for percentage calculation
    const maxVolume = Math.max(...Array.from(activityMap.values()), 1)

    return days.map(day => ({
      day,
      percentage: Math.round((activityMap.get(day) || 0) / maxVolume * 100)
    }))
  }

  /**
   * Get monthly progress percentage
   */
  static async getMonthlyProgress(userId: string): Promise<number> {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const currentDay = today.getDate()

    // Get workouts this month
    const { count, error } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString().split('T')[0])

    if (error) throw error

    const workoutsThisMonth = count || 0
    
    // Assume goal is 12 workouts per month (3 per week)
    const monthlyGoal = 12
    
    // Calculate progress percentage
    const progress = Math.min(Math.round((workoutsThisMonth / monthlyGoal) * 100), 100)
    
    return progress
  }

  /**
   * Get recent workout goals/activities
   */
  static async getRecentGoals(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('id, name, date, total_volume')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(3)

    if (error) throw error

    const workouts = data as { id: string; name: string; date: string; total_volume: number }[] | null

    return workouts?.map((workout) => ({
      name: workout.name || 'Workout',
      date: new Date(workout.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      }),
      type: 'workout',
      status: workout.total_volume > 0 ? 'completed' : 'pending'
    })) || []
  }

  /**
   * Get upcoming schedule from workout_schedule table
   * Falls back to routines if no schedule exists
   */
  static async getUpcomingSchedule(userId: string): Promise<any[]> {
    // Try to get from workout_schedule table first
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('workout_schedule')
      .select(`
        day_of_week,
        time,
        is_active,
        routines (
          name
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .limit(5)

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // If we have schedule data, use it
    if (!scheduleError && scheduleData && scheduleData.length > 0) {
      return (scheduleData as any[]).map((schedule) => ({
        day: days[schedule.day_of_week],
        workout: schedule.routines?.name || 'Workout',
        time: schedule.time.substring(0, 5) // Format HH:MM from HH:MM:SS
      }))
    }

    // Fallback: Get routines and create mock schedule
    const { data: routines, error: routinesError } = await supabase
      .from('routines')
      .select('id, name, description')
      .eq('user_id', userId)
      .eq('is_public', false)
      .limit(3)

    if (routinesError) return []

    const routineList = routines as { id: string; name: string; description: string }[] | null
    
    return routineList?.slice(0, 2).map((routine, index: number) => ({
      day: days[index + 1], // Start from Monday
      workout: routine.name,
      time: '08:00'
    })) || []
  }

  /**
   * Get current workout streak
   */
  static async getCurrentStreak(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('workouts')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)

    if (error) throw error

    const workouts = data as { date: string }[] | null

    if (!workouts || workouts.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const workout of workouts) {
      const workoutDate = new Date(workout.date)
      workoutDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
        streak++
        currentDate = workoutDate
      } else if (diffDays > streak + 1) {
        break
      }
    }

    return streak
  }

  /**
   * Get all dashboard stats at once
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    const [
      workoutsThisWeek,
      totalVolumeThisWeek,
      personalRecordsCount,
      currentStreak,
      weeklyActivity,
      monthlyProgress,
      recentGoals
    ] = await Promise.all([
      this.getWorkoutsThisWeek(userId),
      this.getTotalVolumeThisWeek(userId),
      this.getPersonalRecordsCount(userId),
      this.getCurrentStreak(userId),
      this.getWeeklyActivity(userId),
      this.getMonthlyProgress(userId),
      this.getRecentGoals(userId)
    ])

    return {
      workoutsThisWeek,
      totalVolumeThisWeek,
      personalRecordsCount,
      currentStreak,
      weeklyActivity,
      monthlyProgress,
      recentGoals
    }
  }
}
