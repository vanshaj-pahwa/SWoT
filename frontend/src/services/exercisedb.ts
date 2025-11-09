// ExerciseDB API Service
const EXERCISEDB_BASE_URL = 'https://v2.exercisedb.dev/api/v1'

export interface ExerciseDBExercise {
  exerciseId: string
  name: string
  equipments: string[]
  bodyParts: string[]
  exerciseType: string
  targetMuscles: string[]
  secondaryMuscles: string[]
  imageUrl: string
  videoUrl?: string
  keywords: string[]
  overview?: string
  instructions?: string[]
  exerciseTips?: string[]
  variations?: string[]
}

export interface ExerciseDBResponse {
  success: boolean
  meta?: {
    total: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextCursor: string | null
    previousCursor: string | null
  }
  data: ExerciseDBExercise[]
}

export interface BodyPart {
  name: string
  imageUrl: string
}

export interface Equipment {
  name: string
  imageUrl: string
}

export interface Muscle {
  name: string
}

export interface ExerciseFilters {
  name?: string
  keywords?: string
  targetMuscles?: string[]
  secondaryMuscles?: string[]
  exerciseType?: string
  bodyParts?: string[]
  equipments?: string[]
  limit?: number
  after?: string
  before?: string
}

export class ExerciseDBService {
  private static buildQueryParams(filters: ExerciseFilters): string {
    const params = new URLSearchParams()
    
    if (filters.name) params.append('name', filters.name)
    if (filters.keywords) params.append('keywords', filters.keywords)
    if (filters.targetMuscles?.length) {
      params.append('targetMuscles', filters.targetMuscles.join(','))
    }
    if (filters.secondaryMuscles?.length) {
      params.append('secondaryMuscles', filters.secondaryMuscles.join(','))
    }
    if (filters.exerciseType) params.append('exerciseType', filters.exerciseType)
    if (filters.bodyParts?.length) {
      params.append('bodyParts', filters.bodyParts.join(','))
    }
    if (filters.equipments?.length) {
      params.append('equipments', filters.equipments.join(','))
    }
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.after) params.append('after', filters.after)
    if (filters.before) params.append('before', filters.before)
    
    return params.toString()
  }

  static async getExercises(filters: ExerciseFilters = {}): Promise<ExerciseDBResponse> {
    const queryString = this.buildQueryParams(filters)
    const url = `${EXERCISEDB_BASE_URL}/exercises${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.statusText}`)
    }
    
    return response.json()
  }

  static async searchExercises(query: string, filters: Omit<ExerciseFilters, 'name'> = {}): Promise<ExerciseDBResponse> {
    return this.getExercises({ ...filters, name: query })
  }

  static async getExerciseById(exerciseId: string): Promise<ExerciseDBExercise> {
    const url = `${EXERCISEDB_BASE_URL}/exercises/${exerciseId}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch exercise: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data
  }

  static async getBodyParts(): Promise<BodyPart[]> {
    const url = `${EXERCISEDB_BASE_URL}/bodyparts`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch body parts: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data
  }

  static async getEquipments(): Promise<Equipment[]> {
    const url = `${EXERCISEDB_BASE_URL}/equipments`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch equipments: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data
  }

  static async getMuscles(): Promise<Muscle[]> {
    const url = `${EXERCISEDB_BASE_URL}/muscles`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch muscles: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data
  }
}
