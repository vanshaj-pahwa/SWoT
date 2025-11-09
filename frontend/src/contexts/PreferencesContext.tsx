'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type WeightUnit = 'lbs' | 'kg'

interface Preferences {
  weightUnit: WeightUnit
}

interface PreferencesContextType {
  preferences: Preferences
  setWeightUnit: (unit: WeightUnit) => void
  convertWeight: (weight: number, toUnit?: WeightUnit) => number
  formatWeight: (weight: number, showUnit?: boolean) => string
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

const STORAGE_KEY = 'swot-preferences'

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>({
    weightUnit: 'lbs'
  })

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPreferences(parsed)
      } catch (err) {
        console.error('Failed to parse preferences:', err)
      }
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const setWeightUnit = (unit: WeightUnit) => {
    setPreferences(prev => ({ ...prev, weightUnit: unit }))
  }

  // Convert weight between units
  const convertWeight = (weight: number, toUnit?: WeightUnit): number => {
    const targetUnit = toUnit || preferences.weightUnit
    
    // Assuming weights are stored in lbs in the database
    if (targetUnit === 'kg') {
      return weight * 0.453592 // lbs to kg
    }
    return weight // already in lbs
  }

  // Format weight with optional unit display
  const formatWeight = (weight: number, showUnit: boolean = true): string => {
    const converted = convertWeight(weight)
    const rounded = Math.round(converted * 10) / 10 // Round to 1 decimal
    
    if (showUnit) {
      return `${rounded} ${preferences.weightUnit}`
    }
    return rounded.toString()
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setWeightUnit,
        convertWeight,
        formatWeight
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}
