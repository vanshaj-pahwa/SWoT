// Sync service placeholder
import type { SyncResult, DataConflict } from '@/types'

export interface SyncableChange {
  id: string
  type: 'create' | 'update' | 'delete'
  table: string
  data: Record<string, unknown>
  timestamp: Date
}

export class SyncService {
  static async queueLocalChanges(_changes: SyncableChange[]): Promise<void> {
    // Implementation will be added in task 7.2
    throw new Error('Not implemented yet')
  }

  static async syncWithServer(): Promise<SyncResult> {
    // Implementation will be added in task 7.2
    throw new Error('Not implemented yet')
  }

  static async handleConflictResolution(_conflicts: DataConflict[]): Promise<void> {
    // Implementation will be added in task 7.2
    throw new Error('Not implemented yet')
  }

  static getOfflineStatus(): boolean {
    // Implementation will be added in task 7.1
    return navigator.onLine
  }
}