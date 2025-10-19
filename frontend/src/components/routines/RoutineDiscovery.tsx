'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Copy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoutineList } from './RoutineList'
import { useRoutine } from '@/hooks/useRoutine'
import type { Routine } from '@/types'

interface RoutineDiscoveryProps {
  onCloneRoutine?: (routine: Routine) => void
}

export function RoutineDiscovery({ onCloneRoutine }: RoutineDiscoveryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Routine[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const {
    publicRoutines,
    loading,
    error,
    loadPublicRoutines,
    searchRoutines,
    cloneRoutine,
    clearError
  } = useRoutine()

  useEffect(() => {
    loadPublicRoutines(20) // Load top 20 public routines
  }, [loadPublicRoutines])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchRoutines(searchTerm, true)
      setSearchResults(results)
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSearching(false)
    }
  }

  const handleClone = async (routine: Routine) => {
    try {
      clearError()
      const clonedRoutine = await cloneRoutine(routine.id)
      onCloneRoutine?.(clonedRoutine)
    } catch (err) {
      // Error handled by hook
    }
  }

  const displayedRoutines = searchTerm ? searchResults : publicRoutines

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Discover Routines</h2>
        <p className="text-gray-600">
          Browse and clone public routines shared by the community
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search routines by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            {searchTerm && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSearchResults([])
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      {searchTerm && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Search Results ({searchResults.length})
          </h3>
        </div>
      )}

      {!searchTerm && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Popular Public Routines
          </h3>
          <div className="text-sm text-gray-600">
            {publicRoutines.length} routine{publicRoutines.length !== 1 ? 's' : ''} available
          </div>
        </div>
      )}

      {/* Routines List */}
      <RoutineList
        routines={displayedRoutines}
        loading={loading || isSearching}
        onClone={handleClone}
        showActions={false}
      />

      {/* No Results */}
      {searchTerm && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No routines found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search terms or browse popular routines below
          </p>
        </div>
      )}

      {/* Clone Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Copy className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                How to use public routines
              </h4>
              <p className="text-sm text-blue-700">
                Click the clone button on any routine to create your own copy. 
                You can then customize it to fit your needs and preferences.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}