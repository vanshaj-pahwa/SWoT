'use client'

import { useState } from 'react'
import { Play, Edit, Copy, Trash2, Users, Lock, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Routine } from '@/types'

interface RoutineListProps {
    routines: Routine[]
    loading?: boolean
    onStartWorkout?: (routine: Routine) => void
    onEdit?: (routine: Routine) => void
    onClone?: (routine: Routine) => void
    onDelete?: (routine: Routine) => void
    showActions?: boolean
}

interface RoutineCardProps {
    routine: Routine
    onStartWorkout?: (routine: Routine) => void
    onEdit?: (routine: Routine) => void
    onClone?: (routine: Routine) => void
    onDelete?: (routine: Routine) => void
    showActions?: boolean
}

function RoutineCard({
    routine,
    onStartWorkout,
    onEdit,
    onClone,
    onDelete,
    showActions = true
}: RoutineCardProps) {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {routine.name}
                            {routine.isPublic ? (
                                <span title="Public routine">
                                    <Users className="h-4 w-4 text-green-600" />
                                </span>
                            ) : (
                                <span title="Private routine">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </span>
                            )}
                        </CardTitle>

                        {routine.description && (
                            <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
                        )}
                    </div>

                    {showActions && (
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>

                            {showMenu && (
                                <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
                                    {onEdit && (
                                        <button
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                            onClick={() => {
                                                onEdit(routine)
                                                setShowMenu(false)
                                            }}
                                        >
                                            <Edit className="h-3 w-3" />
                                            Edit
                                        </button>
                                    )}
                                    {onClone && (
                                        <button
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                            onClick={() => {
                                                onClone(routine)
                                                setShowMenu(false)
                                            }}
                                        >
                                            <Copy className="h-3 w-3" />
                                            Clone
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                            onClick={() => {
                                                onDelete(routine)
                                                setShowMenu(false)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Exercise Summary */}
                <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                        {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                    </div>

                    {routine.exercises.length > 0 && (
                        <div className="space-y-1">
                            {routine.exercises.slice(0, 3).map((exercise, index) => (
                                <div key={index} className="text-sm text-gray-700 flex items-center justify-between">
                                    <span>{index + 1}. {exercise.exerciseName}</span>
                                    <div className="text-xs text-gray-500">
                                        {exercise.targetSets && exercise.targetReps && (
                                            <span>{exercise.targetSets} × {exercise.targetReps}</span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {routine.exercises.length > 3 && (
                                <div className="text-xs text-gray-500 italic">
                                    +{routine.exercises.length - 3} more exercise{routine.exercises.length - 3 !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {onStartWorkout && (
                        <Button
                            onClick={() => onStartWorkout(routine)}
                            className="flex-1"
                            disabled={routine.exercises.length === 0}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Start Workout
                        </Button>
                    )}

                    {showActions && onEdit && (
                        <Button
                            variant="outline"
                            onClick={() => onEdit(routine)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export function RoutineList({
    routines,
    loading = false,
    onStartWorkout,
    onEdit,
    onClone,
    onDelete,
    showActions = true
}: RoutineListProps) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-8 bg-gray-200 rounded mt-4"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (routines.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <Play className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No routines found
                </h3>
                <p className="text-gray-500">
                    Create your first routine to get started with structured workouts
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
                <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onStartWorkout={onStartWorkout}
                    onEdit={onEdit}
                    onClone={onClone}
                    onDelete={onDelete}
                    showActions={showActions}
                />
            ))}
        </div>
    )
}