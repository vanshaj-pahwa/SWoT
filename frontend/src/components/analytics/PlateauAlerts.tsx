'use client'

import { AlertTriangle, Calendar, Lightbulb } from 'lucide-react'
import type { PlateauAlert } from '@/types'

interface PlateauAlertsProps {
  alerts: PlateauAlert[]
}

export function PlateauAlerts({ alerts }: PlateauAlertsProps) {
  if (alerts.length === 0) {
    return null
  }

  const getSeverityColor = (days: number) => {
    if (days >= 42) return 'border-red-200 bg-red-50'
    if (days >= 28) return 'border-orange-200 bg-orange-50'
    return 'border-yellow-200 bg-yellow-50'
  }

  const getSeverityIcon = (days: number) => {
    if (days >= 42) return 'text-red-500'
    if (days >= 28) return 'text-orange-500'
    return 'text-yellow-500'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-yellow-400">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        Plateau Alerts
      </h2>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div 
            key={alert.exerciseName}
            className={`p-4 rounded-lg border ${getSeverityColor(alert.daysSinceProgress)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${getSeverityIcon(alert.daysSinceProgress)}`} />
                <h3 className="font-semibold text-gray-900">
                  {alert.exerciseName}
                </h3>
              </div>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {alert.daysSinceProgress} days
              </span>
            </div>
            
            <div className="text-sm text-gray-700 mb-2">
              No progress since {alert.lastProgressDate.toLocaleDateString()}
            </div>
            
            <div className="flex items-start gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{alert.suggestion}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Plateaus are normal in strength training. 
          Try the suggestions above or consider a deload week to break through.
        </p>
      </div>
    </div>
  )
}