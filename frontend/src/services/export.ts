// Data export service for workout history and analytics
import { supabase } from '@/lib/supabase'
import type { Workout } from '@/types'

export interface ExportOptions {
    includeWorkouts?: boolean
    includeAnalytics?: boolean
    includeRoutines?: boolean
    dateFrom?: Date
    dateTo?: Date
}

export interface ProgressSnapshot {
    generatedAt: string
    totalWorkouts: number
    totalVolume: number
    personalRecords: number
    topExercises: { name: string; volume: number }[]
    recentProgress: { date: string; volume: number }[]
}

export class ExportService {
    /**
     * Export workout history to CSV
     */
    static async exportWorkoutsToCSV(userId: string, options: ExportOptions = {}): Promise<string> {
        const { dateFrom, dateTo } = options

        let query = supabase
            .from('workouts')
            .select(`
        id,
        name,
        date,
        start_time,
        end_time,
        total_volume,
        notes,
        exercises (
          exercise_name,
          sets (
            set_number,
            reps,
            weight,
            rpe,
            is_warmup
          )
        )
      `)
            .eq('user_id', userId)
            .order('date', { ascending: false })

        if (dateFrom) {
            query = query.gte('date', dateFrom.toISOString().split('T')[0])
        }
        if (dateTo) {
            query = query.lte('date', dateTo.toISOString().split('T')[0])
        }

        const { data, error } = await query

        if (error) throw error

        const workouts = data as any[]

        // Create CSV header
        let csv = 'Date,Workout Name,Exercise,Set Number,Reps,Weight (lbs),RPE,Warmup,Total Volume,Notes\n'

        // Add workout data
        workouts?.forEach((workout) => {
            const workoutDate = workout.date
            const workoutName = workout.name || 'Untitled'
            const workoutNotes = (workout.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')

            if (workout.exercises && workout.exercises.length > 0) {
                workout.exercises.forEach((exercise: any) => {
                    const exerciseName = exercise.exercise_name

                    if (exercise.sets && exercise.sets.length > 0) {
                        exercise.sets.forEach((set: any) => {
                            csv += `${workoutDate},${workoutName},${exerciseName},${set.set_number},${set.reps},${set.weight},${set.rpe || ''},${set.is_warmup ? 'Yes' : 'No'},${workout.total_volume || 0},${workoutNotes}\n`
                        })
                    } else {
                        csv += `${workoutDate},${workoutName},${exerciseName},,,,,,,${workoutNotes}\n`
                    }
                })
            } else {
                csv += `${workoutDate},${workoutName},,,,,,,,${workoutNotes}\n`
            }
        })

        return csv
    }

    /**
     * Export analytics data to CSV
     */
    static async exportAnalyticsToCSV(userId: string, options: ExportOptions = {}): Promise<string> {
        const { dateFrom, dateTo } = options

        // Get volume progression
        let query = supabase
            .from('workouts')
            .select('date, total_volume')
            .eq('user_id', userId)
            .order('date', { ascending: true })

        if (dateFrom) {
            query = query.gte('date', dateFrom.toISOString().split('T')[0])
        }
        if (dateTo) {
            query = query.lte('date', dateTo.toISOString().split('T')[0])
        }

        const { data, error } = await query

        if (error) throw error

        // Create CSV
        let csv = 'Date,Total Volume (lbs),Workout Count\n'

        const volumeByDate = new Map<string, { volume: number; count: number }>()

        data?.forEach((workout: any) => {
            const date = workout.date
            const existing = volumeByDate.get(date) || { volume: 0, count: 0 }
            volumeByDate.set(date, {
                volume: existing.volume + (workout.total_volume || 0),
                count: existing.count + 1
            })
        })

        volumeByDate.forEach((value, date) => {
            csv += `${date},${value.volume},${value.count}\n`
        })

        return csv
    }

    /**
     * Export routines to CSV
     */
    static async exportRoutinesToCSV(userId: string): Promise<string> {
        const { data, error } = await supabase
            .from('routines')
            .select(`
        name,
        description,
        is_public,
        exercises:routine_exercises (
          exercise_name,
          order_index,
          target_sets,
          target_reps,
          target_weight,
          notes
        )
      `)
            .eq('user_id', userId)
            .order('name', { ascending: true })

        if (error) throw error

        const routines = data as any[]

        // Create CSV
        let csv = 'Routine Name,Description,Public,Exercise,Order,Target Sets,Target Reps,Target Weight,Notes\n'

        routines?.forEach((routine) => {
            const routineName = routine.name
            const description = (routine.description || '').replace(/,/g, ';').replace(/\n/g, ' ')
            const isPublic = routine.is_public ? 'Yes' : 'No'

            if (routine.exercises && routine.exercises.length > 0) {
                routine.exercises.forEach((exercise: any) => {
                    const notes = (exercise.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
                    csv += `${routineName},${description},${isPublic},${exercise.exercise_name},${exercise.order_index},${exercise.target_sets || ''},${exercise.target_reps || ''},${exercise.target_weight || ''},${notes}\n`
                })
            } else {
                csv += `${routineName},${description},${isPublic},,,,,,\n`
            }
        })

        return csv
    }

    /**
     * Generate progress snapshot with key metrics
     */
    static async generateProgressSnapshot(userId: string, days: number = 30): Promise<ProgressSnapshot> {
        const dateFrom = new Date()
        dateFrom.setDate(dateFrom.getDate() - days)

        // Get workouts in date range
        const { data: workouts, error: workoutsError } = await supabase
            .from('workouts')
            .select(`
        date,
        total_volume,
        exercises (
          exercise_name,
          sets (
            reps,
            weight
          )
        )
      `)
            .eq('user_id', userId)
            .gte('date', dateFrom.toISOString().split('T')[0])
            .order('date', { ascending: true })

        if (workoutsError) throw workoutsError

        const workoutData = workouts as any[]

        // Calculate metrics
        const totalWorkouts = workoutData?.length || 0
        const totalVolume = workoutData?.reduce((sum, w) => sum + (w.total_volume || 0), 0) || 0

        // Get exercise volumes
        const exerciseVolumes = new Map<string, number>()
        workoutData?.forEach((workout) => {
            workout.exercises?.forEach((exercise: any) => {
                const volume = exercise.sets?.reduce((sum: number, set: any) =>
                    sum + (set.reps * set.weight), 0) || 0
                const current = exerciseVolumes.get(exercise.exercise_name) || 0
                exerciseVolumes.set(exercise.exercise_name, current + volume)
            })
        })

        const topExercises = Array.from(exerciseVolumes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, volume]) => ({ name, volume }))

        // Get recent progress
        const recentProgress = workoutData?.map((w) => ({
            date: w.date,
            volume: w.total_volume || 0
        })) || []

        // Get PR count (simplified - unique exercises with max weights)
        const personalRecords = exerciseVolumes.size

        return {
            generatedAt: new Date().toISOString(),
            totalWorkouts,
            totalVolume,
            personalRecords,
            topExercises,
            recentProgress
        }
    }

    /**
     * Download CSV file
     */
    static downloadCSV(csv: string, filename: string) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    /**
     * Download JSON file
     */
    static downloadJSON(data: any, filename: string) {
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    /**
     * Export all data (workouts, analytics, routines)
     */
    static async exportAllData(userId: string, options: ExportOptions = {}) {
        const timestamp = new Date().toISOString().split('T')[0]

        if (options.includeWorkouts !== false) {
            const workoutsCSV = await this.exportWorkoutsToCSV(userId, options)
            this.downloadCSV(workoutsCSV, `swot-workouts-${timestamp}.csv`)
        }

        if (options.includeAnalytics !== false) {
            const analyticsCSV = await this.exportAnalyticsToCSV(userId, options)
            this.downloadCSV(analyticsCSV, `swot-analytics-${timestamp}.csv`)
        }

        if (options.includeRoutines !== false) {
            const routinesCSV = await this.exportRoutinesToCSV(userId)
            this.downloadCSV(routinesCSV, `swot-routines-${timestamp}.csv`)
        }
    }

    /**
     * Generate and download progress snapshot
     */
    static async downloadProgressSnapshot(userId: string, days: number = 30) {
        const snapshot = await this.generateProgressSnapshot(userId, days)
        const timestamp = new Date().toISOString().split('T')[0]
        this.downloadJSON(snapshot, `swot-progress-snapshot-${timestamp}.json`)
    }
}
