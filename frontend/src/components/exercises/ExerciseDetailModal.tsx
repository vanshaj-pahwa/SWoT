'use client'

import { useEffect, useState } from 'react'
import { X, Dumbbell, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExerciseDBService, type ExerciseDBExercise } from '@/services/exercisedb'

interface ExerciseDetailModalProps {
    exerciseId: string
    isOpen: boolean
    onClose: () => void
    onAddToRoutine?: (exercise: ExerciseDBExercise) => void
    showAddButton?: boolean
}

export function ExerciseDetailModal({ 
    exerciseId, 
    isOpen, 
    onClose, 
    onAddToRoutine,
    showAddButton = true 
}: ExerciseDetailModalProps) {
    const [exercise, setExercise] = useState<ExerciseDBExercise | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && exerciseId) {
            loadExerciseDetails()
        }
    }, [isOpen, exerciseId])

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    const loadExerciseDetails = async () => {
        setLoading(true)
        setError(null)
        
        try {
            const data = await ExerciseDBService.getExerciseById(exerciseId)
            setExercise(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load exercise details')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {exercise?.name || 'Exercise Details'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading exercise details...</p>
                        </div>
                    )}

                    {error && (
                        <Card className="border-0 bg-red-50">
                            <CardContent className="p-4">
                                <p className="text-red-600">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {exercise && !loading && (
                        <div className="space-y-6">
                            {/* Video/GIF Section */}
                            {(exercise.videoUrl || exercise.imageUrl) ? (
                                <div className="bg-gray-100 rounded-xl overflow-hidden">
                                    {(exercise.videoUrl || exercise.imageUrl)?.endsWith('.gif') ? (
                                        <img
                                            src={exercise.videoUrl || exercise.imageUrl}
                                            alt={exercise.name}
                                            className="w-full h-auto"
                                        />
                                    ) : (
                                        <video
                                            key={exercise.exerciseId}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-auto"
                                        >
                                            <source src={exercise.videoUrl || exercise.imageUrl} type="video/mp4" />
                                            <source src={exercise.videoUrl || exercise.imageUrl} type="video/webm" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-xl p-12 text-center">
                                    <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No video available for this exercise</p>
                                </div>
                            )}

                            {/* Exercise Type Badge */}
                            <div className="flex items-center gap-2">
                                <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                    {exercise.exerciseType}
                                </span>
                            </div>

                            {/* Overview */}
                            {exercise.overview && (
                                <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-50">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Overview</h3>
                                        <p className="text-gray-700 leading-relaxed">{exercise.overview}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Body Parts */}
                            {exercise.bodyParts.length > 0 && (
                                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Dumbbell className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">Body Parts</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {exercise.bodyParts.map(part => (
                                                        <span
                                                            key={part}
                                                            className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm font-medium"
                                                        >
                                                            {part}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Target Muscles */}
                            {exercise.targetMuscles.length > 0 && (
                                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Target className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">Target Muscles</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {exercise.targetMuscles.map(muscle => (
                                                        <span
                                                            key={muscle}
                                                            className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm font-medium"
                                                        >
                                                            {muscle}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Secondary Muscles */}
                            {exercise.secondaryMuscles.length > 0 && (
                                <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Zap className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">Secondary Muscles</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {exercise.secondaryMuscles.map(muscle => (
                                                        <span
                                                            key={muscle}
                                                            className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm font-medium"
                                                        >
                                                            {muscle}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Equipment */}
                            {exercise.equipments.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Equipment Needed</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {exercise.equipments.map(equip => (
                                            <span
                                                key={equip}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                                            >
                                                {equip}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            {exercise.instructions && exercise.instructions.length > 0 && (
                                <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="text-xl">📋</span>
                                            Instructions
                                        </h3>
                                        <ol className="space-y-3">
                                            {exercise.instructions.map((instruction, idx) => (
                                                <li key={idx} className="flex gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-gray-700 flex-1">{instruction}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Exercise Tips */}
                            {exercise.exerciseTips && exercise.exerciseTips.length > 0 && (
                                <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="text-xl">💡</span>
                                            Exercise Tips
                                        </h3>
                                        <ul className="space-y-3">
                                            {exercise.exerciseTips.map((tip, idx) => (
                                                <li key={idx} className="flex gap-3">
                                                    <span className="text-cyan-600 flex-shrink-0 mt-1">•</span>
                                                    <span className="text-gray-700 flex-1">{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Variations */}
                            {exercise.variations && exercise.variations.length > 0 && (
                                <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="text-xl">🔄</span>
                                            Variations
                                        </h3>
                                        <ul className="space-y-3">
                                            {exercise.variations.map((variation, idx) => (
                                                <li key={idx} className="flex gap-3">
                                                    <span className="text-violet-600 flex-shrink-0 mt-1">→</span>
                                                    <span className="text-gray-700 flex-1">{variation}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Keywords */}
                            {exercise.keywords.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Related Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {exercise.keywords.slice(0, 10).map((keyword, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {exercise && showAddButton && onAddToRoutine && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="rounded-xl"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    onAddToRoutine(exercise)
                                    onClose()
                                }}
                                className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
                            >
                                Add to Routine
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
