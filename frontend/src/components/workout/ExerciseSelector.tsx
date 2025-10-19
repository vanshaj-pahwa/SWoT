'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExerciseService } from '@/services/workout'
import type { ExerciseDefinition } from '@/types'

interface ExerciseSelectorProps {
  onSelectExercise: (exercise: ExerciseDefinition) => void
  onCreateCustom?: () => void
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
}

export function ExerciseSelector({ 
  onSelectExercise, 
  onCreateCustom,
  selectedCategory,
  onCategoryChange 
}: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<ExerciseDefinition[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      setLoading(true)
      const data = await ExerciseService.getExerciseLibrary()
      setExercises(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises')
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const cats = [...new Set(exercises.map(ex => ex.category))]
    return cats.sort()
  }, [exercises])

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = !selectedCategory || exercise.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [exercises, searchTerm, selectedCategory])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading exercise library...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={loadExercises} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Exercise</span>
          {onCreateCustom && (
            <Button onClick={onCreateCustom} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Custom
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange?.('')}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange?.(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Exercise List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No exercises found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filters' 
                  : 'Unable to load exercises from the library'
                }
              </p>
              {(searchTerm || selectedCategory) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    onCategoryChange?.('')
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-3">
                {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
              </div>
              {filteredExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200 group"
                  onClick={() => onSelectExercise(exercise)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
                        {exercise.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Targets:</span> {exercise.muscleGroups.join(', ')}
                      </p>
                      {exercise.equipment && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Equipment:</span> {exercise.equipment}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {exercise.category}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}