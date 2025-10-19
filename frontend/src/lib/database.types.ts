// Type definitions for our Supabase database
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    profile_image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    profile_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    profile_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            workouts: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    date: string
                    start_time: string | null
                    end_time: string | null
                    duration_minutes: number | null
                    notes: string | null
                    total_volume: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    date: string
                    start_time?: string | null
                    end_time?: string | null
                    duration_minutes?: number | null
                    notes?: string | null
                    total_volume?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    date?: string
                    start_time?: string | null
                    end_time?: string | null
                    duration_minutes?: number | null
                    notes?: string | null
                    total_volume?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            exercises: {
                Row: {
                    id: string
                    workout_id: string
                    exercise_name: string
                    exercise_order: number
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    workout_id: string
                    exercise_name: string
                    exercise_order: number
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    workout_id?: string
                    exercise_name?: string
                    exercise_order?: number
                    notes?: string | null
                    created_at?: string
                }
            }
            sets: {
                Row: {
                    id: string
                    exercise_id: string
                    set_order: number
                    reps: number
                    weight: number
                    is_warmup: boolean
                    is_dropset: boolean
                    rest_seconds: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    exercise_id: string
                    set_order: number
                    reps: number
                    weight: number
                    is_warmup?: boolean
                    is_dropset?: boolean
                    rest_seconds?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    exercise_id?: string
                    set_order?: number
                    reps?: number
                    weight?: number
                    is_warmup?: boolean
                    is_dropset?: boolean
                    rest_seconds?: number | null
                    created_at?: string
                }
            }
            routines: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    description: string | null
                    exercises: Record<string, unknown>
                    is_public: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    description?: string | null
                    exercises: Record<string, unknown>
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    description?: string | null
                    exercises?: Record<string, unknown>
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            exercise_definitions: {
                Row: {
                    id: string
                    name: string
                    category: string
                    muscle_groups: string[]
                    equipment: string | null
                    instructions: string | null
                    is_custom: boolean
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category: string
                    muscle_groups: string[]
                    equipment?: string | null
                    instructions?: string | null
                    is_custom?: boolean
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string
                    muscle_groups?: string[]
                    equipment?: string | null
                    instructions?: string | null
                    is_custom?: boolean
                    created_by?: string | null
                    created_at?: string
                }
            }
        }
    }
}