'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ProgressData } from '@/types'

interface ProgressChartProps {
  data: ProgressData[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  // Transform data for Recharts
  const chartData = data.map(item => ({
    date: item.date.toLocaleDateString(),
    weight: item.weight,
    volume: item.volume,
    oneRepMax: item.oneRepMax
  }))

  const formatTooltip = (value: number, name: string) => {
    switch (name) {
      case 'weight':
        return [`${value} lbs`, 'Max Weight']
      case 'volume':
        return [`${value} lbs`, 'Total Volume']
      case 'oneRepMax':
        return [`${value} lbs`, '1RM Estimate']
      default:
        return [value, name]
    }
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Max Weight"
          />
          <Line 
            type="monotone" 
            dataKey="oneRepMax" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="1RM Estimate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}