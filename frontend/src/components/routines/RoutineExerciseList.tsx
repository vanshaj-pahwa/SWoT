'use client'

import { useState } from 'react'
import { GripVertical, Trash2, Edit3, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import type { RoutineExercise } from '@/types'

interface RoutineExerciseListProps {
  exercises: RoutineExercise[]
  onRemove: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onUpdate: (index: number, exercise: RoutineExercise) => void
}

interface ExerciseItemProps {
  exercise: RoutineExercise
  index: number
  onRemove: () => void
  onUpdate: (exercise: RoutineExercise) => void
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: () => void
  isDragging: boolean
  dragOverIndex: number | null
}

function ExerciseItem({
  exercise,
  index,
  onRemove,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  dragOverIndex
}: ExerciseItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedExercise, setEditedExercise] = useState(exercise)

  const handleSave = () => {
    onUpdate(editedExercise)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedExercise(exercise)
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    onDragOver(index)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop()
  }

  return (
    <Card
      className={`border-0 bg-white/80 backdrop-blur shadow-lg transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''
        } ${dragOverIndex === index ? 'border-2 border-blue-300 bg-slate-50' : ''
        }`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-slate-600">
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Exercise Content */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                {/* Exercise Name (read-only) */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Exercise</label>
                  <div className="text-sm text-gray-900 font-medium mt-1">
                    {exercise.exerciseName}
                  </div>
                </div>

                {/* Target Values */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Target Sets</label>
                    <Input
                      type="number"
                      min="1"
                      value={editedExercise.targetSets || ''}
                      onChange={(e) => setEditedExercise({
                        ...editedExercise,
                        targetSets: parseInt(e.target.value) || undefined
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Target Reps</label>
                    <Input
                      type="number"
                      min="1"
                      value={editedExercise.targetReps || ''}
                      onChange={(e) => setEditedExercise({
                        ...editedExercise,
                        targetReps: parseInt(e.target.value) || undefined
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Target Weight</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editedExercise.targetWeight || ''}
                      onChange={(e) => setEditedExercise({
                        ...editedExercise,
                        targetWeight: parseFloat(e.target.value) || undefined
                      })}
                      className="h-8 text-sm"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-gray-600">Notes</label>
                  <Input
                    value={editedExercise.notes || ''}
                    onChange={(e) => setEditedExercise({
                      ...editedExercise,
                      notes: e.target.value
                    })}
                    className="h-8 text-sm"
                    placeholder="Optional notes..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-slate-500 to-blue-600 hover:from-slate-600 hover:to-blue-700 text-white rounded-xl"
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="rounded-xl">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {/* Exercise Name and Order */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {index + 1}. {exercise.exerciseName}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="hover:bg-slate-50 text-gray-600 hover:text-slate-700"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onRemove}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Target Information */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>
                      {exercise.targetSets ? `${exercise.targetSets} sets` : 'No target sets'}
                    </span>
                  </div>
                  {exercise.targetReps && (
                    <span>• {exercise.targetReps} reps</span>
                  )}
                  {exercise.targetWeight && (
                    <span>• {exercise.targetWeight} lbs</span>
                  )}
                </div>

                {/* Notes */}
                {exercise.notes && (
                  <div className="mt-2 text-sm text-gray-600 italic">
                    "{exercise.notes}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RoutineExerciseList({
  exercises,
  onRemove,
  onReorder,
  onUpdate
}: RoutineExerciseListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (index: number) => {
    setDragOverIndex(index)
  }

  const handleDrop = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorder(draggedIndex, dragOverIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-3">
      {exercises.map((exercise, index) => (
        <ExerciseItem
          key={`${exercise.exerciseName}-${index}`}
          exercise={exercise}
          index={index}
          onRemove={() => onRemove(index)}
          onUpdate={(updatedExercise) => onUpdate(index, updatedExercise)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragging={draggedIndex === index}
          dragOverIndex={dragOverIndex}
        />
      ))}
    </div>
  )
}