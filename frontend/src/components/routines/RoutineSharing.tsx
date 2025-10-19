'use client'

import { useState } from 'react'
import { Share2, Users, Lock, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRoutine } from '@/hooks/useRoutine'
import type { Routine } from '@/types'

interface RoutineSharingProps {
  routine: Routine
  onUpdate?: (routine: Routine) => void
}

export function RoutineSharing({ routine, onUpdate }: RoutineSharingProps) {
  const [copied, setCopied] = useState(false)
  const { saveCurrentRoutine, setCurrentRoutine, error } = useRoutine()

  const handleTogglePublic = async () => {
    try {
      const updatedRoutine = { ...routine, isPublic: !routine.isPublic }
      setCurrentRoutine(updatedRoutine)
      await saveCurrentRoutine()
      onUpdate?.(updatedRoutine)
    } catch (err) {
      console.error('Failed to update routine visibility:', err)
    }
  }

  const handleCopyLink = async () => {
    if (!routine.isPublic) return

    const routineUrl = `${window.location.origin}/routines/shared/${routine.id}`
    
    try {
      await navigator.clipboard.writeText(routineUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Sharing Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {routine.isPublic ? (
              <Users className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h4 className="font-medium">
                {routine.isPublic ? 'Public Routine' : 'Private Routine'}
              </h4>
              <p className="text-sm text-gray-600">
                {routine.isPublic 
                  ? 'Anyone can discover and clone this routine'
                  : 'Only you can see this routine'
                }
              </p>
            </div>
          </div>
          <Button
            variant={routine.isPublic ? "default" : "outline"}
            onClick={handleTogglePublic}
          >
            {routine.isPublic ? 'Make Private' : 'Make Public'}
          </Button>
        </div>

        {/* Share Link */}
        {routine.isPublic && (
          <div className="space-y-3">
            <h4 className="font-medium">Share this routine</h4>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-gray-50 border rounded-lg text-sm text-gray-700 font-mono">
                {`${window.location.origin}/routines/shared/${routine.id}`}
              </div>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Share this link with others so they can clone your routine
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Privacy Notice</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Public routines can be discovered by all users</li>
            <li>• Others can clone your routine but cannot modify the original</li>
            <li>• Your personal workout data remains private</li>
            <li>• You can make routines private at any time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}