'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WorkoutFrequencyChartProps {
  data: { date: Date; workoutCount: number }[]
}

export function WorkoutFrequencyChart({ data }: WorkoutFrequencyChartProps) {
  // Transform data for Recharts and fill in missing dates
  const chartData = data.map(item => ({
    date: item.date.toLocaleDateString(),
    workouts: item.workoutCount,
    fullDate: item.date
  }))

  // Sort by date
  chartData.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

  const formatTooltip = (value: number, name: string) => {
    if (name === 'workouts') {
      return [`${value} workout${value !== 1 ? 's' : ''}`, 'Workouts']
    }
    return [value, name]
  }

  // Calculate consistency metrics
  const totalWorkouts = data.reduce((sum, item) => sum + item.workoutCount, 0)
  const totalDays = data.length
  const avgWorkoutsPerDay = totalDays > 0 ? (totalWorkouts / totalDays).toFixed(2) : '0'
  const workoutDays = data.filter(item => item.workoutCount > 0).length
  const consistencyPercentage = totalDays > 0 ? ((workoutDays / totalDays) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-4">
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{totalWorkouts}</div>
          <div className="text-sm text-blue-800">Total Workouts</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{consistencyPercentage}%</div>
          <div className="text-sm text-green-800">Consistency</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{avgWorkoutsPerDay}</div>
          <div className="text-sm text-purple-800">Avg/Day</div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip formatter={formatTooltip} />
            <Area 
              type="monotone" 
              dataKey="workouts" 
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Consistency Insights */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Consistency Insights</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• You&apos;ve worked out on {workoutDays} out of {totalDays} days</p>
          <p>• Your consistency rate is {consistencyPercentage}%</p>
          {parseFloat(consistencyPercentage) >= 70 && (
            <p className="text-green-600 font-medium">🎉 Great consistency! Keep it up!</p>
          )}
          {parseFloat(consistencyPercentage) < 50 && (
            <p className="text-orange-600 font-medium">💪 Try to maintain a more regular workout schedule</p>
          )}
        </div>
      </div>
    </div>
  )
}