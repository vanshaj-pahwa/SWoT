'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RoutineBuilder, RoutineList, RoutineDiscovery } from '@/components/routines'
import { useRoutine } from '@/hooks/useRoutine'
import { useWorkout } from '@/hooks/useWorkout'
import { useRouter } from 'next/navigation'
import type { Routine } from '@/types'

type ViewMode = 'list' | 'create' | 'edit' | 'discover'

export default function RoutinesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const router = useRouter()
  
  const {
    userRoutines,
    loading,
    error,
    loadUserRoutines,
    deleteRoutine,
    cloneRoutine,
    clearError
  } = useRoutine()

  const { startWorkout } = useWorkout()

  useEffect(() => {
    loadUserRoutines()
  }, [loadUserRoutines])

  const handleCreateNew = () => {
    setEditingRoutine(null)
    setViewMode('create')
  }

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine)
    setViewMode('edit')
  }

  const handleSave = (routine: Routine) => {
    setViewMode('list')
    setEditingRoutine(null)
    // Refresh the list
    loadUserRoutines()
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingRoutine(null)
    clearError()
  }

  const handleStartWorkout = async (routine: Routine) => {
    try {
      await startWorkout(routine)
      router.push('/dashboard') // Redirect to dashboard where workout logger is
    } catch (err) {
      // Error handled by workout hook
    }
  }

  const handleClone = async (routine: Routine) => {
    try {
      await cloneRoutine(routine.id, `${routine.name} (Copy)`)
      // Refresh the list to show the cloned routine
      loadUserRoutines()
    } catch (err) {
      // Error handled by hook
    }
  }

  const handleDelete = async (routine: Routine) => {
    if (window.confirm(`Are you sure you want to delete "${routine.name}"? This action cannot be undone.`)) {
      try {
        await deleteRoutine(routine.id)
      } catch (err) {
        // Error handled by hook
      }
    }
  }

  const handleCloneFromDiscovery = (routine: Routine) => {
    setViewMode('list')
    // Refresh the list to show the cloned routine
    loadUserRoutines()
  }

  // Render based on view mode
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="container mx-auto px-4 py-8">
        <RoutineBuilder
          routine={editingRoutine || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  if (viewMode === 'discover') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setViewMode('list')}
          >
            ← Back to My Routines
          </Button>
        </div>
        <RoutineDiscovery onCloneRoutine={handleCloneFromDiscovery} />
      </div>
    )
  }

  // Default list view
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Routines</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your workout routines
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode('discover')}
          >
            <Search className="h-4 w-4 mr-2" />
            Discover
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Routine
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!loading && userRoutines.length === 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <BookOpen className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Get started with routines
                </h3>
                <p className="text-blue-700 mb-4">
                  Routines help you plan and structure your workouts. Create your first routine 
                  or discover popular ones from the community.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Routine
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setViewMode('discover')}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Public Routines
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routines List */}
      <RoutineList
        routines={userRoutines}
        loading={loading}
        onStartWorkout={handleStartWorkout}
        onEdit={handleEdit}
        onClone={handleClone}
        onDelete={handleDelete}
      />

      {/* Stats */}
      {!loading && userRoutines.length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {userRoutines.length} routine{userRoutines.length !== 1 ? 's' : ''} created
              </span>
              <span>
                {userRoutines.reduce((total, routine) => total + routine.exercises.length, 0)} total exercises
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}