// Offline hook placeholder
import { useState, useEffect } from 'react'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)
  const [syncStatus, _setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced')

  useEffect(() => {
    // Implementation will be added in task 7.1
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOffline,
    syncStatus,
    forcSync: async () => {
      throw new Error('Not implemented yet')
    }
  }
}