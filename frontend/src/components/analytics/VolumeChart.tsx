'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { VolumeData } from '@/types'

interface VolumeChartProps {
  data: VolumeData[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  // Transform data for Recharts
  const chartData = data.map(item => ({
    date: item.date.toLocaleDateString(),
    volume: item.volume,
    exerciseCount: item.exerciseCount
  }))

  const formatTooltip = (value: number, name: string) => {
    switch (name) {
      case 'volume':
        return [`${value.toLocaleString()} lbs`, 'Total Volume']
      case 'exerciseCount':
        return [`${value} exercises`, 'Exercise Count']
      default:
        return [value, name]
    }
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={formatTooltip} />
          <Legend />
          <Bar 
            dataKey="volume" 
            fill="#3b82f6" 
            name="Total Volume"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}