'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ExerciseSelector } from '@/components/workout/ExerciseSelector'
import { ExerciseDBBrowser } from '@/components/exercises'
import { RoutineSharing } from './RoutineSharing'
import { useRoutine } from '@/hooks/useRoutine'
import type { Routine, RoutineExercise, ExerciseDefinition } from '@/types'
import type { ExerciseDBExercise } from '@/services/exercisedb'
import { RoutineExerciseList } from './RoutineExerciseList'

const routineSchema = z.object({
    name: z.string().min(1, 'Routine name is required'),
    description: z.string().optional()
})

type RoutineFormData = z.infer<typeof routineSchema>

interface RoutineBuilderProps {
    routine?: Routine
    onSave?: (routine: Routine) => void
    onCancel?: () => void
}

export function RoutineBuilder({ routine, onSave, onCancel }: RoutineBuilderProps) {
    const [showExerciseSelector, setShowExerciseSelector] = useState(false)
    const [showExerciseDB, setShowExerciseDB] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>('')

    const {
        currentRoutine,
        saving,
        error,
        setCurrentRoutine,
        updateRoutineName,
        updateRoutineDescription,
        addExerciseToRoutine,
        removeExerciseFromRoutine,
        reorderExercises,
        updateExerciseInRoutine,
        saveCurrentRoutine,
        createRoutine,
        clearError
    } = useRoutine()

    const form = useForm<RoutineFormData>({
        resolver: zodResolver(routineSchema),
        defaultValues: {
            name: routine?.name || '',
            description: routine?.description || ''
        }
    })

    // Initialize current routine
    useEffect(() => {
        if (routine) {
            setCurrentRoutine(routine)
            form.reset({
                name: routine.name,
                description: routine.description || ''
            })
        } else {
            // Create new routine template
            const newRoutine: Routine = {
                id: '',
                userId: '',
                name: '',
                description: '',
                exercises: [],
                isPublic: false
            }
            setCurrentRoutine(newRoutine)
        }
    }, [routine, setCurrentRoutine, form])

    // Update routine when form values change
    useEffect(() => {
        const subscription = form.watch((values) => {
            if (values.name !== undefined) {
                updateRoutineName(values.name)
            }
            if (values.description !== undefined) {
                updateRoutineDescription(values.description || '')
            }
        })
        return () => subscription.unsubscribe()
    }, [form, updateRoutineName, updateRoutineDescription])

    const handleAddExercise = (exerciseDefinition: ExerciseDefinition) => {
        if (!currentRoutine) return

        const newExercise: RoutineExercise = {
            exerciseName: exerciseDefinition.name,
            order: currentRoutine.exercises.length + 1,
            targetSets: 3,
            targetReps: 10,
            targetWeight: undefined,
            notes: ''
        }

        addExerciseToRoutine(newExercise)
        setShowExerciseSelector(false)
    }

    const handleAddExerciseFromDB = (exercise: ExerciseDBExercise) => {
        if (!currentRoutine) return

        const newExercise: RoutineExercise = {
            exerciseName: exercise.name,
            order: currentRoutine.exercises.length + 1,
            targetSets: 3,
            targetReps: 10,
            targetWeight: undefined,
            notes: `Type: ${exercise.exerciseType} | Equipment: ${exercise.equipments.join(', ')}`
        }

        addExerciseToRoutine(newExercise)
        setShowExerciseDB(false)
    }

    const handleSave = async () => {
        if (!currentRoutine) return

        try {
            clearError()

            if (routine?.id) {
                // Update existing routine
                await saveCurrentRoutine()
                onSave?.(currentRoutine)
            } else {
                // Create new routine
                const savedRoutine = await createRoutine({
                    userId: '', // Will be set by the service
                    name: currentRoutine.name,
                    description: currentRoutine.description,
                    exercises: currentRoutine.exercises,
                    isPublic: false
                })
                onSave?.(savedRoutine)
            }
        } catch (err) {
            // Error is handled by the hook
        }
    }

    if (showExerciseDB) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setShowExerciseDB(false)}
                        className="rounded-xl"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Routine
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">Browse Exercise Database</h2>
                    <div></div>
                </div>

                <ExerciseDBBrowser onSelectExercise={handleAddExerciseFromDB} />
            </div>
        )
    }

    if (showExerciseSelector) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setShowExerciseSelector(false)}
                        className="rounded-xl"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Routine
                    </Button>
                </div>

                <ExerciseSelector
                    onSelectExercise={handleAddExercise}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {routine ? 'Edit Routine' : 'Create New Routine'}
                </h2>
                <div className="flex gap-2">
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel} className="rounded-xl">
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving || !currentRoutine?.name}
                        className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Routine'}
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Card className="border-0 bg-red-50 shadow-lg">
                    <CardContent className="p-4">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Routine Details Form */}
            <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                    <CardTitle className="text-gray-900">Routine Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Routine Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter routine name..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Describe your routine..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Exercises Section */}
            <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-gray-900">
                        <span>Exercises ({currentRoutine?.exercises.length || 0})</span>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowExerciseDB(true)}
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Browse Database
                            </Button>
                            <Button
                                onClick={() => setShowExerciseSelector(true)}
                                size="sm"
                                className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Quick Add
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!currentRoutine || currentRoutine.exercises.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="h-8 w-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No exercises added yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Add exercises to build your routine
                            </p>
                            <div className="flex gap-2 justify-center">
                                <Button 
                                    onClick={() => setShowExerciseDB(true)}
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Browse Database
                                </Button>
                                <Button 
                                    onClick={() => setShowExerciseSelector(true)}
                                    className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Quick Add
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <RoutineExerciseList
                            exercises={currentRoutine.exercises}
                            onRemove={removeExerciseFromRoutine}
                            onReorder={reorderExercises}
                            onUpdate={updateExerciseInRoutine}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Sharing Settings (only for existing routines) */}
            {routine?.id && currentRoutine && (
                <RoutineSharing
                    routine={currentRoutine}
                    onUpdate={(updatedRoutine) => setCurrentRoutine(updatedRoutine)}
                />
            )}
        </div>
    )
}