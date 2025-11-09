'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { RoutineBuilder, RoutineList, RoutineDiscovery } from '@/components/routines'
import { useRoutine } from '@/hooks/useRoutine'
import { useWorkout } from '@/hooks/useWorkout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import type { Routine } from '@/types'

type ViewMode = 'list' | 'create' | 'edit' | 'discover'

export default function RoutinesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null)
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
  const { user } = useAuth()

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

  const handleDelete = (routine: Routine) => {
    setRoutineToDelete(routine)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (routineToDelete) {
      try {
        await deleteRoutine(routineToDelete.id)
      } catch (err) {
        // Error handled by hook
      }
      setRoutineToDelete(null)
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
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <RoutineBuilder
            routine={editingRoutine || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (viewMode === 'discover') {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setViewMode('list')}
              className="rounded-xl"
            >
              ← Back to My Routines
            </Button>
          </div>
          <RoutineDiscovery onCloneRoutine={handleCloneFromDiscovery} />
        </div>
      </DashboardLayout>
    )
  }

  // Default list view
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Routines</h1>
            <p className="text-gray-600 mt-2">
              Create and manage your workout routines
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (!user?.id) return
                try {
                  const { ExportService } = await import('@/services/export')
                  const csv = await ExportService.exportRoutinesToCSV(user.id)
                  const timestamp = new Date().toISOString().split('T')[0]
                  ExportService.downloadCSV(csv, `swot-routines-${timestamp}.csv`)
                } catch (error) {
                  console.error('Export failed:', error)
                }
              }}
              className="rounded-xl hidden md:flex"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode('discover')}
              className="rounded-xl"
            >
              <Search className="h-4 w-4 mr-2" />
              Discover
            </Button>
            <Button
              onClick={handleCreateNew}
              className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Routine
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-0 bg-red-50 mb-6 shadow-lg">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {!loading && userRoutines.length === 0 && (
          <Card className="mb-6 bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <BookOpen className="h-8 w-8 text-slate-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Get started with routines
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Routines help you plan and structure your workouts. Create your first routine
                    or discover popular ones from the community.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateNew}
                      className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Routine
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setViewMode('discover')}
                      className="rounded-xl"
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

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false)
            setRoutineToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Delete Routine"
          message={`Are you sure you want to delete "${routineToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}