'use client'

import { Trophy, TrendingUp } from 'lucide-react'
import type { PersonalBest } from '@/types'

interface PersonalBestsDisplayProps {
  personalBests: PersonalBest[]
}

export function PersonalBestsDisplay({ personalBests }: PersonalBestsDisplayProps) {
  if (personalBests.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Personal Bests
        </h2>
        <p className="text-gray-600">No personal bests recorded yet. Keep training!</p>
      </div>
    )
  }

  // Sort by 1RM and take top 6 for display
  const topBests = personalBests
    .sort((a, b) => b.oneRepMax - a.oneRepMax)
    .slice(0, 6)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Personal Bests
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topBests.map((best, index) => (
          <div 
            key={`${best.exerciseName}-${best.date.toISOString()}`}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {best.exerciseName}
              </h3>
              {index < 3 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    #{index + 1}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Max Weight:</span>
                <span className="font-bold text-blue-600">
                  {best.weight} lbs × {best.reps}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Est. 1RM:</span>
                <span className="font-bold text-indigo-600">
                  {Math.round(best.oneRepMax)} lbs
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Date:</span>
                <span className="text-xs text-gray-800">
                  {best.date.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {personalBests.length > 6 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Personal Bests ({personalBests.length})
          </button>
        </div>
      )}
    </div>
  )
}