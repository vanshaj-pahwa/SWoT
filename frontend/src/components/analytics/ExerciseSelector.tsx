'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

interface ExerciseSelectorProps {
  exercises: string[]
  selectedExercise: string
  onExerciseChange: (exercise: string) => void
}

export function ExerciseSelector({ exercises, selectedExercise, onExerciseChange }: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredExercises = exercises.filter(exercise =>
    exercise.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExerciseSelect = (exercise: string) => {
    onExerciseChange(exercise)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] justify-between"
      >
        <span className="truncate">
          {selectedExercise || 'Select Exercise'}
        </span>
        <Search className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => handleExerciseSelect(exercise)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                    exercise === selectedExercise ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {exercise}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No exercises found
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}