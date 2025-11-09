'use client'

import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function AchievementsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Achievements</h1>
        <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">
              Track your achievements and milestones. This feature is coming soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
