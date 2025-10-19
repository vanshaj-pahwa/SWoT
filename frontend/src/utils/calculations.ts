// Workout calculation utilities
import type { Set } from '@/types'

/**
 * Calculate total volume for a set of exercises
 * Volume = sets × reps × weight
 */
export function calculateVolume(sets: Set[]): number {
  return sets.reduce((total, set) => {
    if (set.isWarmup) return total // Don't count warmup sets
    return total + (set.reps * set.weight)
  }, 0)
}

/**
 * Calculate One Rep Max using Epley formula
 * 1RM = weight × (1 + reps/30)
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

/**
 * Find the best set (highest estimated 1RM) from a collection of sets
 */
export function findBestSet(sets: Set[]): Set | null {
  if (sets.length === 0) return null
  
  return sets
    .filter(set => !set.isWarmup)
    .reduce((best, current) => {
      const currentMax = calculateOneRepMax(current.weight, current.reps)
      const bestMax = calculateOneRepMax(best.weight, best.reps)
      return currentMax > bestMax ? current : best
    })
}

/**
 * Calculate workout duration in minutes
 */
export function calculateWorkoutDuration(startTime: Date, endTime: Date): number {
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
}