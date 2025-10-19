// Routine service implementation
import { supabase } from '@/lib/supabase'
import type { Routine, RoutineExercise } from '@/types'

export class RoutineService {
  static async createRoutine(routine: Omit<Routine, 'id'>): Promise<Routine> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await (supabase as any)
      .from('routines')
      .insert({
        user_id: user.id,
        name: routine.name,
        description: routine.description,
        exercises: routine.exercises,
        is_public: routine.isPublic
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      exercises: data.exercises,
      isPublic: data.is_public
    }
  }

  static async updateRoutine(routineId: string, updates: Partial<Routine>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.exercises !== undefined) updateData.exercises = updates.exercises
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic

    const { error } = await (supabase as any)
      .from('routines')
      .update(updateData)
      .eq('id', routineId)
      .eq('user_id', user.id)

    if (error) throw error
  }

  static async deleteRoutine(routineId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await (supabase as any)
      .from('routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', user.id)

    if (error) throw error
  }

  static async getUserRoutines(userId?: string): Promise<Routine[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const targetUserId = userId || user.id

    const { data, error } = await (supabase as any)
      .from('routines')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map((routine: any) => ({
      id: routine.id,
      userId: routine.user_id,
      name: routine.name,
      description: routine.description,
      exercises: routine.exercises,
      isPublic: routine.is_public
    })) || []
  }

  static async getPublicRoutines(limit?: number): Promise<Routine[]> {
    let query = (supabase as any)
      .from('routines')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error

    return data?.map((routine: any) => ({
      id: routine.id,
      userId: routine.user_id,
      name: routine.name,
      description: routine.description,
      exercises: routine.exercises,
      isPublic: routine.is_public
    })) || []
  }

  static async getRoutineById(routineId: string): Promise<Routine | null> {
    const { data, error } = await (supabase as any)
      .from('routines')
      .select('*')
      .eq('id', routineId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      exercises: data.exercises,
      isPublic: data.is_public
    }
  }

  static async cloneRoutine(routineId: string, newName?: string): Promise<Routine> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get the original routine
    const originalRoutine = await this.getRoutineById(routineId)
    if (!originalRoutine) throw new Error('Routine not found')

    // Create a new routine with the same exercises
    const clonedRoutine = await this.createRoutine({
      userId: user.id,
      name: newName || `${originalRoutine.name} (Copy)`,
      description: originalRoutine.description,
      exercises: originalRoutine.exercises,
      isPublic: false // Cloned routines are private by default
    })

    return clonedRoutine
  }

  static async searchRoutines(query: string, includePublic: boolean = true): Promise<Routine[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let supabaseQuery = (supabase as any)
      .from('routines')
      .select('*')
      .ilike('name', `%${query}%`)

    if (includePublic) {
      supabaseQuery = supabaseQuery.or(`user_id.eq.${user.id},is_public.eq.true`)
    } else {
      supabaseQuery = supabaseQuery.eq('user_id', user.id)
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false })

    if (error) throw error

    return data?.map((routine: any) => ({
      id: routine.id,
      userId: routine.user_id,
      name: routine.name,
      description: routine.description,
      exercises: routine.exercises,
      isPublic: routine.is_public
    })) || []
  }
}