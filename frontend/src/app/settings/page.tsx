'use client'

import { Settings as SettingsIcon, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { usePreferences, type WeightUnit } from '@/contexts/PreferencesContext'

export default function SettingsPage() {
  const { preferences, setWeightUnit } = usePreferences()

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Customize your workout tracking experience
          </p>
        </div>

        {/* Weight Unit Preference */}
        <Card className="mb-6 border-0 bg-white/80 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Scale className="h-5 w-5" />
              Weight Unit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Choose your preferred unit for displaying weights throughout the app
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setWeightUnit('lbs')}
                variant={preferences.weightUnit === 'lbs' ? 'default' : 'outline'}
                className={
                  preferences.weightUnit === 'lbs'
                    ? 'bg-slate-600 hover:bg-slate-700 text-white rounded-xl'
                    : 'rounded-xl'
                }
              >
                Pounds (lbs)
              </Button>
              <Button
                onClick={() => setWeightUnit('kg')}
                variant={preferences.weightUnit === 'kg' ? 'default' : 'outline'}
                className={
                  preferences.weightUnit === 'kg'
                    ? 'bg-slate-600 hover:bg-slate-700 text-white rounded-xl'
                    : 'rounded-xl'
                }
              >
                Kilograms (kg)
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Current selection: <span className="font-semibold">{preferences.weightUnit}</span>
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-0 bg-gradient-to-br from-slate-50 to-blue-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <SettingsIcon className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">About Settings</h3>
                <p className="text-sm text-gray-600">
                  Your preferences are saved locally in your browser. All weights in the app will be 
                  automatically converted to your preferred unit. The conversion is done in real-time 
                  and doesn't affect your stored data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
