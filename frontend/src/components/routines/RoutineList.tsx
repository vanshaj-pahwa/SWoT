'use client'

import { useState } from 'react'
import { Play, Edit, Copy, Trash2, Users, Lock, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePreferences } from '@/contexts/PreferencesContext'
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
    const { formatWeight } = usePreferences()
    const [showMenu, setShowMenu] = useState(false)

    return (
        <Card className="border-0 bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
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
                                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[120px] overflow-hidden">
                                    {onEdit && (
                                        <button
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-gray-700 cursor-pointer"
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
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-gray-700 cursor-pointer"
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
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
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
                                <div key={index} className="text-sm text-gray-700">
                                    <div className="flex items-start justify-between">
                                        <span className="flex-1">{index + 1}. {exercise.exerciseName}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 ml-4">
                                        {exercise.targetSets && exercise.targetReps && (
                                            <>
                                                {exercise.targetSets} × {exercise.targetReps} reps
                                                {exercise.targetWeight && (
                                                    <> × {formatWeight(exercise.targetWeight)}</>
                                                )}
                                            </>
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
                            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
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
                            className="rounded-xl border-gray-200 hover:bg-slate-50"
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
                    <Card key={i} className="animate-pulse border-0 bg-white/80 backdrop-blur shadow-lg">
                        <CardHeader>
                            <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-100 rounded"></div>
                                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                <div className="h-8 bg-slate-100 rounded mt-4"></div>
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
                <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No routines found
                </h3>
                <p className="text-gray-600">
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