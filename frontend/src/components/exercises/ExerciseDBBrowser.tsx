'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ExerciseDetailModal } from './ExerciseDetailModal'
import { ExerciseDBService, type ExerciseDBExercise, type BodyPart, type Equipment, type Muscle } from '@/services/exercisedb'

interface ExerciseDBBrowserProps {
    onSelectExercise?: (exercise: ExerciseDBExercise) => void
    showAddButton?: boolean
}

export function ExerciseDBBrowser({ onSelectExercise, showAddButton = true }: ExerciseDBBrowserProps) {
    const [exercises, setExercises] = useState<ExerciseDBExercise[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    // Filter options
    const [bodyParts, setBodyParts] = useState<BodyPart[]>([])
    const [equipments, setEquipments] = useState<Equipment[]>([])
    const [muscles, setMuscles] = useState<Muscle[]>([])

    // Selected filters
    const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([])
    const [selectedEquipments, setSelectedEquipments] = useState<string[]>([])
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
    const [selectedType, setSelectedType] = useState<string>('')

    // Pagination
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [prevCursor, setPrevCursor] = useState<string | null>(null)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)

    // Load filter options on mount
    useEffect(() => {
        loadFilterOptions()
    }, [])

    // Load exercises when filters change
    useEffect(() => {
        loadExercises()
    }, [selectedBodyParts, selectedEquipments, selectedMuscles, selectedType])

    const loadFilterOptions = async () => {
        try {
            const [bodyPartsData, equipmentsData, musclesData] = await Promise.all([
                ExerciseDBService.getBodyParts(),
                ExerciseDBService.getEquipments(),
                ExerciseDBService.getMuscles()
            ])

            setBodyParts(bodyPartsData)
            setEquipments(equipmentsData)
            setMuscles(musclesData)
        } catch (err) {
            console.error('Failed to load filter options:', err)
        }
    }

    const loadExercises = async (cursor?: string, direction?: 'next' | 'prev') => {
        setLoading(true)
        setError(null)

        try {
            const response = await ExerciseDBService.getExercises({
                name: searchQuery || undefined,
                bodyParts: selectedBodyParts.length > 0 ? selectedBodyParts : undefined,
                equipments: selectedEquipments.length > 0 ? selectedEquipments : undefined,
                targetMuscles: selectedMuscles.length > 0 ? selectedMuscles : undefined,
                exerciseType: selectedType || undefined,
                limit: 20,
                after: direction === 'next' ? cursor : undefined,
                before: direction === 'prev' ? cursor : undefined
            })

            setExercises(response.data)
            setNextCursor(response.meta?.nextCursor || null)
            setPrevCursor(response.meta?.previousCursor || null)
            setHasNextPage(response.meta?.hasNextPage || false)
            setHasPrevPage(response.meta?.hasPreviousPage || false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load exercises')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        loadExercises()
    }

    const handleMultiSelectChange = (value: string, selected: string[], setter: (values: string[]) => void) => {
        if (!value) {
            setter([])
            return
        }

        if (selected.includes(value)) {
            setter(selected.filter(v => v !== value))
        } else {
            setter([...selected, value])
        }
    }

    const clearFilters = () => {
        setSelectedBodyParts([])
        setSelectedEquipments([])
        setSelectedMuscles([])
        setSelectedType('')
        setSearchQuery('')
    }

    const activeFiltersCount =
        selectedBodyParts.length +
        selectedEquipments.length +
        selectedMuscles.length +
        (selectedType ? 1 : 0)

    const handleExerciseClick = (exerciseId: string) => {
        setSelectedExerciseId(exerciseId)
        setShowDetailModal(true)
    }

    const handleCloseModal = () => {
        setShowDetailModal(false)
        setSelectedExerciseId(null)
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleSearch} className="bg-slate-600 hover:bg-slate-700">
                    Search
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-slate-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card className="border-0 bg-gray-50">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Filters</h3>
                            {activeFiltersCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Exercise Type */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Exercise Type</label>
                                <Select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="strength">Strength</option>
                                    <option value="cardio">Cardio</option>
                                    <option value="flexibility">Flexibility</option>
                                    <option value="balance">Balance</option>
                                </Select>
                            </div>

                            {/* Body Parts */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Body Part</label>
                                <Select
                                    value=""
                                    onChange={(e) => handleMultiSelectChange(e.target.value, selectedBodyParts, setSelectedBodyParts)}
                                >
                                    <option value="">Select body part...</option>
                                    {bodyParts.map(part => (
                                        <option key={part.name} value={part.name}>
                                            {part.name}
                                        </option>
                                    ))}
                                </Select>
                                {selectedBodyParts.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {selectedBodyParts.map(part => (
                                            <span
                                                key={part}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                                            >
                                                {part}
                                                <button
                                                    onClick={() => setSelectedBodyParts(selectedBodyParts.filter(p => p !== part))}
                                                    className="hover:text-slate-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Equipment */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Equipment</label>
                                <Select
                                    value=""
                                    onChange={(e) => handleMultiSelectChange(e.target.value, selectedEquipments, setSelectedEquipments)}
                                >
                                    <option value="">Select equipment...</option>
                                    {equipments.map(equip => (
                                        <option key={equip.name} value={equip.name}>
                                            {equip.name}
                                        </option>
                                    ))}
                                </Select>
                                {selectedEquipments.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {selectedEquipments.map(equip => (
                                            <span
                                                key={equip}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                                            >
                                                {equip}
                                                <button
                                                    onClick={() => setSelectedEquipments(selectedEquipments.filter(e => e !== equip))}
                                                    className="hover:text-slate-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Target Muscles */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Target Muscle</label>
                                <Select
                                    value=""
                                    onChange={(e) => handleMultiSelectChange(e.target.value, selectedMuscles, setSelectedMuscles)}
                                >
                                    <option value="">Select muscle...</option>
                                    {muscles.map(muscle => (
                                        <option key={muscle.name} value={muscle.name}>
                                            {muscle.name}
                                        </option>
                                    ))}
                                </Select>
                                {selectedMuscles.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {selectedMuscles.map(muscle => (
                                            <span
                                                key={muscle}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                                            >
                                                {muscle}
                                                <button
                                                    onClick={() => setSelectedMuscles(selectedMuscles.filter(m => m !== muscle))}
                                                    className="hover:text-slate-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Card className="border-0 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading exercises...</p>
                </div>
            )}

            {/* Exercise Grid */}
            {!loading && exercises.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {exercises.map(exercise => (
                            <Card
                                key={exercise.exerciseId}
                                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                                onClick={() => handleExerciseClick(exercise.exerciseId)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-lg flex-1">{exercise.name}</h3>
                                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium ml-2">
                                            {exercise.exerciseType}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {exercise.bodyParts.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-gray-600 min-w-[80px]">Body Parts:</span>
                                                <span className="font-medium flex-1">{exercise.bodyParts.join(', ')}</span>
                                            </div>
                                        )}

                                        {exercise.equipments.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-gray-600 min-w-[80px]">Equipment:</span>
                                                <span className="font-medium flex-1">{exercise.equipments.join(', ')}</span>
                                            </div>
                                        )}

                                        {exercise.targetMuscles.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-gray-600 min-w-[80px]">Target:</span>
                                                <span className="font-medium text-xs flex-1">{exercise.targetMuscles.join(', ')}</span>
                                            </div>
                                        )}

                                        {exercise.secondaryMuscles.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-gray-600 min-w-[80px]">Secondary:</span>
                                                <span className="text-gray-500 text-xs flex-1">{exercise.secondaryMuscles.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 text-center text-sm text-gray-500">
                                        Click to view details
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => prevCursor && loadExercises(prevCursor, 'prev')}
                            disabled={!hasPrevPage || loading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => nextCursor && loadExercises(nextCursor, 'next')}
                            disabled={!hasNextPage || loading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </>
            )}

            {/* Empty State */}
            {!loading && exercises.length === 0 && !error && (
                <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Exercise Detail Modal */}
            {selectedExerciseId && (
                <ExerciseDetailModal
                    exerciseId={selectedExerciseId}
                    isOpen={showDetailModal}
                    onClose={handleCloseModal}
                    onAddToRoutine={onSelectExercise}
                    showAddButton={showAddButton}
                />
            )}
        </div>
    )
}
