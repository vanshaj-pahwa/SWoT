'use client'

import { useState } from 'react'
import { Download, FileText, BarChart3, Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { ExportService } from '@/services/export'
import { useAuth } from '@/hooks/useAuth'

export default function ExportPage() {
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleExportWorkouts = async () => {
    if (!user?.id) return
    
    try {
      setExporting(true)
      setExportError(null)
      const options = {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined
      }
      
      const csv = await ExportService.exportWorkoutsToCSV(user.id, options)
      const timestamp = new Date().toISOString().split('T')[0]
      ExportService.downloadCSV(csv, `swot-workouts-${timestamp}.csv`)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportError('Failed to export workouts. Please try again.')
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setExporting(false)
    }
  }

  const handleExportAnalytics = async () => {
    if (!user?.id) return
    
    try {
      setExporting(true)
      setExportError(null)
      const options = {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined
      }
      
      const csv = await ExportService.exportAnalyticsToCSV(user.id, options)
      const timestamp = new Date().toISOString().split('T')[0]
      ExportService.downloadCSV(csv, `swot-analytics-${timestamp}.csv`)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportError('Failed to export analytics. Please try again.')
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setExporting(false)
    }
  }

  const handleExportRoutines = async () => {
    if (!user?.id) return
    
    try {
      setExporting(true)
      setExportError(null)
      const csv = await ExportService.exportRoutinesToCSV(user.id)
      const timestamp = new Date().toISOString().split('T')[0]
      ExportService.downloadCSV(csv, `swot-routines-${timestamp}.csv`)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportError('Failed to export routines. Please try again.')
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setExporting(false)
    }
  }

  const handleExportAll = async () => {
    if (!user?.id) return
    
    try {
      setExporting(true)
      setExportError(null)
      const options = {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined
      }
      
      await ExportService.exportAllData(user.id, options)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportError('Failed to export data. Please try again.')
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setExporting(false)
    }
  }

  const handleExportSnapshot = async () => {
    if (!user?.id) return
    
    try {
      setExporting(true)
      setExportError(null)
      await ExportService.downloadProgressSnapshot(user.id, 30)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportError('Failed to generate snapshot. Please try again.')
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setExporting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Data</h1>
          <p className="text-gray-600">
            Download your workout data, analytics, and routines
          </p>
        </div>

        {exportSuccess && (
          <Card className="mb-6 border-0 bg-green-50 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">Export completed successfully!</p>
            </CardContent>
          </Card>
        )}

        {exportError && (
          <Card className="mb-6 border-0 bg-red-50 shadow-lg">
            <CardContent className="p-4">
              <p className="text-red-800 font-medium">{exportError}</p>
            </CardContent>
          </Card>
        )}

        {/* Date Range Filter */}
        <Card className="mb-6 border-0 bg-white/80 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5" />
              Date Range (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Leave empty to export all data
            </p>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Workouts Export */}
          <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Workout History</h3>
                  <p className="text-sm text-gray-600">
                    Export all your workouts with exercises, sets, reps, and weights
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExportWorkouts}
                disabled={exporting}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export Workouts'}
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Export */}
          <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Analytics Data</h3>
                  <p className="text-sm text-gray-600">
                    Export volume progression and workout frequency data
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExportAnalytics}
                disabled={exporting}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export Analytics'}
              </Button>
            </CardContent>
          </Card>

          {/* Routines Export */}
          <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Routines</h3>
                  <p className="text-sm text-gray-600">
                    Export all your workout routines and templates
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExportRoutines}
                disabled={exporting}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export Routines'}
              </Button>
            </CardContent>
          </Card>

          {/* Progress Snapshot */}
          <Card className="border-0 bg-white/80 backdrop-blur shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Progress Snapshot</h3>
                  <p className="text-sm text-gray-600">
                    Generate a summary of your last 30 days of progress
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExportSnapshot}
                disabled={exporting}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Generating...' : 'Generate Snapshot'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Export All */}
        <Card className="border-0 bg-gradient-to-br from-slate-50 to-blue-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Export Everything</h3>
                <p className="text-sm text-gray-600">
                  Download all your data in one go (workouts, analytics, and routines)
                </p>
              </div>
              <Button
                onClick={handleExportAll}
                disabled={exporting}
                size="lg"
                className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl"
              >
                <Download className="h-5 w-5 mr-2" />
                {exporting ? 'Exporting...' : 'Export All Data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="mt-6 border-0 bg-white/80 backdrop-blur shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Data Privacy</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• All exports are generated locally and downloaded directly to your device</li>
              <li>• Your data is never sent to third-party services during export</li>
              <li>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
              <li>• JSON snapshots can be used for backup or data analysis</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
