// Workout service implementation
import { supabase } from '@/lib/supabase'
import type { Workout, Exercise, Routine, ExerciseDefinition } from '@/types'

export class WorkoutService {
  // Helper method to ensure user exists in our users table
  private static async ensureUserExists(authUser: any): Promise<void> {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await (supabase as any)
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if user doesn't exist
        throw checkError
      }

      if (!existingUser) {
        // User doesn't exist, create them
        console.log('WorkoutService: Creating user record for:', authUser.id)
        const { error: insertError } = await (supabase as any)
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.user_metadata?.full_name,
            profile_image_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
          })

        if (insertError) {
          console.error('WorkoutService: Failed to create user record:', insertError)
          throw insertError
        }
        console.log('WorkoutService: User record created successfully')
      }
    } catch (error) {
      console.error('WorkoutService: Error ensuring user exists:', error)
      throw error
    }
  }

  static async createWorkout(routine?: Routine, customName?: string): Promise<Workout> {
    try {
      console.log('WorkoutService: Getting user...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      console.log('WorkoutService: User authenticated:', user.id)

      // Ensure user exists in our users table
      await this.ensureUserExists(user)

      const now = new Date()
      const workoutName = customName || routine?.name || `Workout ${now.toLocaleDateString()}`
      console.log('WorkoutService: Creating workout with name:', workoutName)
      
      // Create the workout record - use auth.uid() for RLS compatibility
      const { data: workoutData, error: workoutError } = await (supabase as any)
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workoutName,
          date: now.toISOString().split('T')[0],
          start_time: now.toISOString(),
          total_volume: 0
        })
        .select()
        .single()

      if (workoutError) {
        console.error('WorkoutService: Database error creating workout:', workoutError)
        throw workoutError
      }
      console.log('WorkoutService: Workout created in database:', workoutData)

      // Create exercises from routine if provided
      const exercises: Exercise[] = []
      if (routine?.exercises?.length) {
        for (const routineExercise of routine.exercises) {
          const { data: exerciseData, error: exerciseError } = await (supabase as any)
            .from('exercises')
            .insert({
              workout_id: workoutData!.id,
              exercise_name: routineExercise.exerciseName,
              exercise_order: routineExercise.order,
              notes: routineExercise.notes || null
            })
            .select()
            .single()

          if (exerciseError) throw exerciseError

          exercises.push({
            id: exerciseData!.id,
            workoutId: exerciseData!.workout_id,
            exerciseName: exerciseData!.exercise_name,
            exerciseOrder: exerciseData!.exercise_order,
            notes: exerciseData!.notes || undefined,
            sets: []
          })
        }
      }

      return {
        id: workoutData!.id,
        userId: workoutData!.user_id,
        name: workoutData!.name,
        date: new Date(workoutData!.date),
        startTime: workoutData!.start_time ? new Date(workoutData!.start_time) : undefined,
        endTime: workoutData!.end_time ? new Date(workoutData!.end_time) : undefined,
        durationMinutes: workoutData!.duration_minutes || undefined,
        notes: workoutData!.notes || undefined,
        totalVolume: workoutData!.total_volume,
        exercises
      }
    } catch (error) {
      console.error('WorkoutService: Error in createWorkout:', error)
      throw error
    }
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Calculate total volume
    const totalVolume = workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.reps * set.weight)
      }, 0)
    }, 0)

    // Calculate duration if we have start and end times
    let durationMinutes: number | undefined
    if (workout.startTime && workout.endTime) {
      durationMinutes = Math.round((workout.endTime.getTime() - workout.startTime.getTime()) / (1000 * 60))
    }

    // Update workout record
    const { error: workoutError } = await (supabase as any)
      .from('workouts')
      .update({
        name: workout.name,
        end_time: workout.endTime?.toISOString(),
        duration_minutes: durationMinutes,
        notes: workout.notes,
        total_volume: totalVolume
      })
      .eq('id', workout.id)
      .eq('user_id', user.id)

    if (workoutError) throw workoutError

    // Save exercises and sets
    for (const exercise of workout.exercises) {
      let exerciseId = exercise.id
      
      // Check if this is a temporary ID (starts with "exercise_")
      if (exercise.id.startsWith('exercise_')) {
        // This is a new exercise, insert it
        const { data: newExercise, error: insertError } = await (supabase as any)
          .from('exercises')
          .insert({
            workout_id: workout.id,
            exercise_name: exercise.exerciseName,
            exercise_order: exercise.exerciseOrder,
            notes: exercise.notes
          })
          .select()
          .single()

        if (insertError) throw insertError
        exerciseId = newExercise.id
      } else {
        // This is an existing exercise, update it
        const { error: exerciseError } = await (supabase as any)
          .from('exercises')
          .update({
            exercise_name: exercise.exerciseName,
            exercise_order: exercise.exerciseOrder,
            notes: exercise.notes
          })
          .eq('id', exercise.id)

        if (exerciseError) throw exerciseError
      }

      // Delete existing sets and recreate them (simpler than complex update logic)
      const { error: deleteError } = await (supabase as any)
        .from('sets')
        .delete()
        .eq('exercise_id', exerciseId)

      if (deleteError) throw deleteError

      // Insert new sets
      if (exercise.sets.length > 0) {
        const setsToInsert = exercise.sets.map(set => ({
          exercise_id: exerciseId,
          set_order: set.setOrder,
          reps: set.reps,
          weight: set.weight,
          is_warmup: set.isWarmup,
          is_dropset: set.isDropset,
          rest_seconds: set.restSeconds
        }))

        const { error: setsError } = await (supabase as any)
          .from('sets')
          .insert(setsToInsert)

        if (setsError) throw setsError
      }
    }
  }

  static async getWorkoutHistory(userId: string, limit?: number): Promise<Workout[]> {
    let query = (supabase as any)
      .from('workouts')
      .select(`
        *,
        exercises (
          *,
          sets (*)
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error

    return data?.map((workout: any) => ({
      id: workout.id,
      userId: workout.user_id,
      name: workout.name,
      date: new Date(workout.date),
      startTime: workout.start_time ? new Date(workout.start_time) : undefined,
      endTime: workout.end_time ? new Date(workout.end_time) : undefined,
      durationMinutes: workout.duration_minutes || undefined,
      notes: workout.notes || undefined,
      totalVolume: workout.total_volume,
      exercises: workout.exercises?.map((exercise: any) => ({
        id: exercise.id,
        workoutId: exercise.workout_id,
        exerciseName: exercise.exercise_name,
        exerciseOrder: exercise.exercise_order,
        notes: exercise.notes || undefined,
        sets: exercise.sets?.map((set: any) => ({
          id: set.id,
          exerciseId: set.exercise_id,
          setOrder: set.set_order,
          reps: set.reps,
          weight: set.weight,
          isWarmup: set.is_warmup,
          isDropset: set.is_dropset,
          restSeconds: set.rest_seconds || undefined
        })) || []
      })) || []
    })) || []
  }

  static async getWorkoutById(workoutId: string, userId: string): Promise<Workout | null> {
    const { data, error } = await (supabase as any)
      .from('workouts')
      .select(`
        *,
        exercises (
          *,
          sets (*)
        )
      `)
      .eq('id', workoutId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      date: new Date(data.date),
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      durationMinutes: data.duration_minutes || undefined,
      notes: data.notes || undefined,
      totalVolume: data.total_volume,
      exercises: data.exercises?.map((exercise: any) => ({
        id: exercise.id,
        workoutId: exercise.workout_id,
        exerciseName: exercise.exercise_name,
        exerciseOrder: exercise.exercise_order,
        notes: exercise.notes || undefined,
        sets: exercise.sets?.map((set: any) => ({
          id: set.id,
          exerciseId: set.exercise_id,
          setOrder: set.set_order,
          reps: set.reps,
          weight: set.weight,
          isWarmup: set.is_warmup,
          isDropset: set.is_dropset,
          restSeconds: set.rest_seconds || undefined
        })) || []
      })) || []
    }
  }

  static async deleteWorkout(workoutId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Delete workout (cascading deletes will handle exercises and sets)
    const { error } = await (supabase as any)
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', user.id)

    if (error) throw error
  }
}

export class ExerciseService {
  static async addExerciseToWorkout(workoutId: string, exercise: Exercise): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Insert the exercise
    const { error: exerciseError } = await (supabase as any)
      .from('exercises')
      .insert({
        workout_id: workoutId,
        exercise_name: exercise.exerciseName,
        exercise_order: exercise.exerciseOrder,
        notes: exercise.notes
      })

    if (exerciseError) throw exerciseError

    // Insert sets if any
    if (exercise.sets.length > 0) {
      const setsToInsert = exercise.sets.map(set => ({
        exercise_id: exercise.id,
        set_order: set.setOrder,
        reps: set.reps,
        weight: set.weight,
        is_warmup: set.isWarmup,
        is_dropset: set.isDropset,
        rest_seconds: set.restSeconds
      }))

      const { error: setsError } = await (supabase as any)
        .from('sets')
        .insert(setsToInsert)

      if (setsError) throw setsError
    }
  }

  static async updateExercise(exerciseId: string, updates: Partial<Exercise>): Promise<void> {
    const { error } = await (supabase as any)
      .from('exercises')
      .update({
        exercise_name: updates.exerciseName,
        exercise_order: updates.exerciseOrder,
        notes: updates.notes
      })
      .eq('id', exerciseId)

    if (error) throw error
  }

  static async getExerciseLibrary(): Promise<ExerciseDefinition[]> {
    const { data, error } = await (supabase as any)
      .from('exercise_definitions')
      .select('*')
      .order('name')

    if (error) throw error
    
    return data?.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      muscleGroups: row.muscle_groups,
      equipment: row.equipment,
      instructions: row.instructions,
      isCustom: row.is_custom,
      createdBy: row.created_by
    })) || []
  }

  static async createCustomExercise(definition: ExerciseDefinition): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await (supabase as any)
      .from('exercise_definitions')
      .insert({
        name: definition.name,
        category: definition.category,
        muscle_groups: definition.muscleGroups,
        equipment: definition.equipment,
        instructions: definition.instructions,
        is_custom: true,
        created_by: user.id
      })

    if (error) throw error
  }
}