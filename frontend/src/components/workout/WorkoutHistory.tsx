'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Dumbbell, Trash2, Eye, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { WorkoutService } from '@/services/workout'
import { useAuth } from '@/hooks/useAuth'
import { usePreferences } from '@/contexts/PreferencesContext'
import type { Workout } from '@/types'

interface WorkoutHistoryProps {
    onViewWorkout?: (workout: Workout) => void
    onEditWorkout?: (workout: Workout) => void
    limit?: number
}

export function WorkoutHistory({
    onViewWorkout,
    onEditWorkout,
    limit
}: WorkoutHistoryProps) {
    const { user } = useAuth()
    const { formatWeight } = usePreferences()
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null)

    useEffect(() => {
        if (user) {
            loadWorkouts()
        }
    }, [user, limit])

    useEffect(() => {
        filterWorkouts()
    }, [workouts, searchTerm, dateFilter])

    const loadWorkouts = async () => {
        if (!user) return

        try {
            setLoading(true)
            const data = await WorkoutService.getWorkoutHistory(user.id, limit)
            setWorkouts(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workout history')
        } finally {
            setLoading(false)
        }
    }

    const filterWorkouts = () => {
        let filtered = workouts

        if (searchTerm) {
            filtered = filtered.filter(workout =>
                workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workout.exercises.some(ex =>
                    ex.exerciseName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            )
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter)
            filtered = filtered.filter(workout => {
                const workoutDate = new Date(workout.date)
                return workoutDate.toDateString() === filterDate.toDateString()
            })
        }

        setFilteredWorkouts(filtered)
    }

    const handleDeleteWorkout = (workout: Workout) => {
        setWorkoutToDelete(workout)
        setDeleteConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (!workoutToDelete) return

        try {
            await WorkoutService.deleteWorkout(workoutToDelete.id)
            setWorkouts(prev => prev.filter(w => w.id !== workoutToDelete.id))
            setWorkoutToDelete(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete workout')
        }
    }

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A'
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) {
            return `${hours}h ${mins}m`
        }
        return `${mins}m`
    }

    const calculateTotalSets = (workout: Workout) => {
        return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                        <Button onClick={loadWorkouts} className="mt-2">
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
                    <span>Workout History</span>
                    <span className="text-sm font-normal text-gray-500">
                        {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            placeholder="Search workouts or exercises..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-auto"
                    />
                    {(searchTerm || dateFilter) && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('')
                                setDateFilter('')
                            }}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Workout List */}
                <div className="space-y-3">
                    {filteredWorkouts.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <Dumbbell className="h-8 w-8 mx-auto mb-2" />
                            <p>
                                {workouts.length === 0
                                    ? 'No workouts yet'
                                    : 'No workouts match your filters'
                                }
                            </p>
                            {searchTerm || dateFilter ? (
                                <p className="text-sm">Try adjusting your search or date filter</p>
                            ) : null}
                        </div>
                    ) : (
                        filteredWorkouts.map((workout) => (
                            <div
                                key={workout.id}
                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-medium">{workout.name}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{workout.date.toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDuration(workout.durationMinutes)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                            <span>{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</span>
                                            <span>{calculateTotalSets(workout)} set{calculateTotalSets(workout) !== 1 ? 's' : ''}</span>
                                            <span>{formatWeight(workout.totalVolume)} total</span>
                                        </div>

                                        {workout.exercises.length > 0 && (
                                            <div className="text-sm text-gray-500">
                                                <span>Exercises: </span>
                                                <span>
                                                    {workout.exercises
                                                        .slice(0, 3)
                                                        .map(ex => ex.exerciseName)
                                                        .join(', ')}
                                                    {workout.exercises.length > 3 && ` +${workout.exercises.length - 3} more`}
                                                </span>
                                            </div>
                                        )}

                                        {workout.notes && (
                                            <p className="text-sm text-gray-600 mt-2 italic">
                                                "{workout.notes}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        {onViewWorkout && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewWorkout(workout)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onEditWorkout && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEditWorkout(workout)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteWorkout(workout)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={deleteConfirmOpen}
                    onClose={() => {
                        setDeleteConfirmOpen(false)
                        setWorkoutToDelete(null)
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Workout"
                    message={`Are you sure you want to delete this workout? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                />
            </CardContent>
        </Card>
    )
}