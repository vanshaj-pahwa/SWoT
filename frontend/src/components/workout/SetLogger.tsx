'use client'

import { useState } from 'react'
import { Plus, Minus, Trash2, Timer, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePreferences } from '@/contexts/PreferencesContext'
import type { Set as WorkoutSet } from '@/types'

interface SetLoggerProps {
  sets: WorkoutSet[]
  onAddSet: (set: Omit<WorkoutSet, 'id'>) => void
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void
  onRemoveSet: (setId: string) => void
  exerciseName: string
  isSuperset?: boolean
  isDropset?: boolean
}

interface SetInputs {
  reps: string
  weight: string
  isWarmup: boolean
  isDropset: boolean
  restSeconds: string
}

export function SetLogger({
  sets,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  exerciseName,
  isSuperset = false,
  isDropset = false
}: SetLoggerProps) {
  const { formatWeight, preferences } = usePreferences()
  const [newSet, setNewSet] = useState<SetInputs>({
    reps: '',
    weight: '',
    isWarmup: false,
    isDropset: false,
    restSeconds: ''
  })
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const [restInterval, setRestInterval] = useState<NodeJS.Timeout | null>(null)

  const handleAddSet = () => {
    if (!newSet.reps || !newSet.weight) return

    // Convert weight to lbs for storage if user is using kg
    let weightInLbs = parseFloat(newSet.weight)
    if (preferences.weightUnit === 'kg') {
      weightInLbs = weightInLbs / 0.453592 // Convert kg to lbs
    }

    const setToAdd: Omit<WorkoutSet, 'id'> = {
      exerciseId: '', // Will be set by parent
      setOrder: sets.length + 1,
      reps: parseInt(newSet.reps),
      weight: weightInLbs,
      isWarmup: newSet.isWarmup,
      isDropset: newSet.isDropset || isDropset,
      restSeconds: newSet.restSeconds ? parseInt(newSet.restSeconds) : undefined
    }

    onAddSet(setToAdd)

    // Start rest timer if rest time is specified
    if (newSet.restSeconds) {
      startRestTimer(parseInt(newSet.restSeconds))
    }

    // Reset form but keep weight for next set
    setNewSet(prev => ({
      ...prev,
      reps: '',
      isWarmup: false,
      restSeconds: ''
    }))
  }

  const startRestTimer = (seconds: number) => {
    if (restInterval) clearInterval(restInterval)

    setRestTimer(seconds)
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          setRestInterval(null)
          return null
        }
        return prev - 1
      })
    }, 1000)

    setRestInterval(interval)
  }

  const stopRestTimer = () => {
    if (restInterval) {
      clearInterval(restInterval)
      setRestInterval(null)
    }
    setRestTimer(null)
  }

  const incrementValue = (field: 'reps' | 'weight', amount: number) => {
    setNewSet(prev => {
      const currentValue = parseFloat(prev[field]) || 0
      const newValue = Math.max(0, currentValue + amount)
      return {
        ...prev,
        [field]: newValue.toString()
      }
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{exerciseName}</span>
          {(isSuperset || isDropset) && (
            <div className="flex gap-2">
              {isSuperset && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Superset
                </span>
              )}
              {isDropset && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Dropset
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Sets */}
        {sets.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Completed Sets</h4>
            {sets.map((set, index) => (
              <div
                key={set.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm w-8">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {set.reps} reps × {formatWeight(set.weight)}
                    </span>
                    {set.isWarmup && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Warmup
                      </span>
                    )}
                    {set.isDropset && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Drop
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveSet(set.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Rest Timer */}
        {restTimer !== null && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                Rest: {formatTime(restTimer)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopRestTimer}
              className="text-blue-600"
            >
              Skip
            </Button>
          </div>
        )}

        {/* New Set Input */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium text-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Set {sets.length + 1}
          </h4>

          {/* Reps Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reps</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => incrementValue('reps', -1)}
                disabled={!newSet.reps || parseInt(newSet.reps) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={newSet.reps}
                onChange={(e) => setNewSet(prev => ({ ...prev, reps: e.target.value }))}
                placeholder="0"
                className="text-center"
                min="0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => incrementValue('reps', 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weight Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight ({preferences.weightUnit})</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => incrementValue('weight', preferences.weightUnit === 'kg' ? -1.25 : -2.5)}
                disabled={!newSet.weight || parseFloat(newSet.weight) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                step={preferences.weightUnit === 'kg' ? '0.25' : '0.5'}
                value={newSet.weight}
                onChange={(e) => setNewSet(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="0"
                className="text-center"
                min="0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => incrementValue('weight', preferences.weightUnit === 'kg' ? 1.25 : 2.5)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={newSet.isWarmup ? "default" : "outline"}
              size="sm"
              onClick={() => setNewSet(prev => ({ ...prev, isWarmup: !prev.isWarmup }))}
            >
              Warmup
            </Button>
            <Button
              variant={newSet.isDropset ? "default" : "outline"}
              size="sm"
              onClick={() => setNewSet(prev => ({ ...prev, isDropset: !prev.isDropset }))}
            >
              Dropset
            </Button>
          </div>

          {/* Rest Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rest Time (seconds)</label>
            <Input
              type="number"
              value={newSet.restSeconds}
              onChange={(e) => setNewSet(prev => ({ ...prev, restSeconds: e.target.value }))}
              placeholder="60"
              min="0"
            />
          </div>

          {/* Add Set Button */}
          <Button
            onClick={handleAddSet}
            disabled={!newSet.reps || !newSet.weight}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Add Set
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}