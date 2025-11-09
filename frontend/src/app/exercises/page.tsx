'use client'

import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { ExerciseDBBrowser } from '@/components/exercises'
import { Card, CardContent } from '@/components/ui/card'
import { Dumbbell } from 'lucide-react'

export default function ExercisesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
          <p className="text-gray-600 mt-2">
            Browse thousands of exercises
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Dumbbell className="h-8 w-8 text-slate-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Discover New Exercises
                </h3>
                <p className="text-gray-700">
                  Search and filter through a comprehensive database of exercises. 
                  Filter by body part, equipment, target muscles, and exercise type to find the perfect exercises for your workout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Browser */}
        <ExerciseDBBrowser showAddButton={false} />
      </div>
    </DashboardLayout>
  )
}
