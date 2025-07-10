// Real-time Data Synchronization System
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { EventEmitter } from 'events'

// ==================== Real-time Sync Manager ====================

export interface SyncConfig {
  channel: string
  table: string
  filter?: string
  events?: Array<'INSERT' | 'UPDATE' | 'DELETE'>
  batchSize?: number
  debounceMs?: number
  retryAttempts?: number
  autoReconnect?: boolean
}

export interface SyncEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record?: any
  timestamp: number
  eventId: string
}

class RealTimeSyncManager extends EventEmitter {
  private static instance: RealTimeSyncManager
  private supabase: SupabaseClient | null = null
  private subscriptions: Map<string, any> = new Map()
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private eventQueue: SyncEvent[] = []
  private batchProcessor: NodeJS.Timeout | null = null

  static getInstance(): RealTimeSyncManager {
    if (!this.instance) {
      this.instance = new RealTimeSyncManager()
    }
    return this.instance
  }

  constructor() {
    super()
    this.setMaxListeners(50) // Increase max listeners for multiple subscriptions
    this.initializeConnection()
    this.setupHeartbeat()
    this.setupBatchProcessor()
  }

  private async initializeConnection() {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase credentials not found')
      }

      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        }
      )

      // Monitor connection status
      (this.supabase.realtime as any).onOpen(() => {
        this.connectionStatus = 'connected'
        this.reconnectAttempts = 0
        this.emit('connection:open')
        console.log('Real-time connection established')
      })

      (this.supabase.realtime as any).onClose(() => {
        this.connectionStatus = 'disconnected'
        this.emit('connection:close')
        console.log('Real-time connection closed')
        this.handleReconnection()
      })

      (this.supabase.realtime as any).onError((error: any) => {
        console.error('Real-time connection error:', error)
        this.emit('connection:error', error)
        this.handleReconnection()
      })

    } catch (error) {
      console.error('Failed to initialize real-time connection:', error)
      this.emit('connection:error', error)
    }
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionStatus === 'connected' && this.supabase) {
        // Send heartbeat to maintain connection
        this.supabase.realtime.send({
          type: 'heartbeat',
          timestamp: Date.now()
        })
      }
    }, 30000) // Every 30 seconds
  }

  private setupBatchProcessor() {
    this.batchProcessor = setInterval(() => {
      this.processBatchedEvents()
    }, 1000) // Process every second
  }

  private processBatchedEvents() {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    // Group events by table and type
    const groupedEvents = events.reduce((acc, event) => {
      const key = `${event.table}:${event.type}`
      if (!acc[key]) acc[key] = []
      acc[key].push(event)
      return acc
    }, {} as Record<string, SyncEvent[]>)

    // Emit grouped events
    Object.entries(groupedEvents).forEach(([key, events]) => {
      const [table, type] = key.split(':')
      this.emit('batch:update', { table, type, events })
    })
  }

  private handleReconnection() {
    if (
      this.connectionStatus === 'reconnecting' ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return
    }

    this.connectionStatus = 'reconnecting'
    this.reconnectAttempts++

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.initializeConnection()
    }, delay)
  }

  // ==================== Subscription Management ====================

  subscribe(config: SyncConfig): string {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const subscriptionId = `${config.channel}_${Date.now()}`
    
    try {
      const channel = this.supabase
        .channel(config.channel)
        .on(
          'postgres_changes',
          {
            event: config.events?.join('|') || '*',
            schema: 'public',
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            const syncEvent: SyncEvent = {
              type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              table: config.table,
              record: payload.new,
              old_record: payload.old,
              timestamp: Date.now(),
              eventId: `${config.table}_${Date.now()}_${Math.random()}`
            }

            // Add to event queue for batch processing
            this.eventQueue.push(syncEvent)

            // Emit immediate event
            this.emit('data:change', syncEvent)
            this.emit(`${config.table}:${syncEvent.type}`, syncEvent)
          }
        )
        .subscribe()

      this.subscriptions.set(subscriptionId, {
        channel,
        config
      })

      return subscriptionId
    } catch (error) {
      console.error('Failed to create subscription:', error)
      throw error
    }
  }

  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription && this.supabase) {
      this.supabase.removeChannel(subscription.channel)
      this.subscriptions.delete(subscriptionId)
    }
  }

  // ==================== Data Operations ====================

  async syncData(table: string, query: any = {}) {
    if (!this.supabase) return null

    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .match(query)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Data sync error:', error)
      return null
    }
  }

  async updateData(table: string, data: any, condition: any) {
    if (!this.supabase) return null

    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .match(condition)

      if (error) throw error
      return result
    } catch (error) {
      console.error('Data update error:', error)
      return null
    }
  }

  // ==================== Connection Management ====================

  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  forceReconnect() {
    this.reconnectAttempts = 0
    this.handleReconnection()
  }

  disconnect() {
    if (this.supabase) {
      this.subscriptions.forEach((subscription) => {
        this.supabase!.removeChannel(subscription.channel)
      })
      this.subscriptions.clear()
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    if (this.batchProcessor) {
      clearInterval(this.batchProcessor)
    }

    this.connectionStatus = 'disconnected'
    this.emit('connection:disconnected')
  }
}

// ==================== React Hooks ====================

export function useRealTimeSync(config: SyncConfig) {
  const [data, setData] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const syncManager = useRef(RealTimeSyncManager.getInstance())
  const subscriptionId = useRef<string | null>(null)

  const handleDataChange = useCallback((event: SyncEvent) => {
    setData(prevData => {
      switch (event.type) {
        case 'INSERT':
          return [...prevData, event.record]
        case 'UPDATE':
          return prevData.map(item => 
            item.id === event.record.id ? { ...item, ...event.record } : item
          )
        case 'DELETE':
          return prevData.filter(item => item.id !== event.old_record?.id)
        default:
          return prevData
      }
    })
  }, [])

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected)
    if (connected) {
      setError(null)
    }
  }, [])

  const handleError = useCallback((err: any) => {
    setError(err.message || 'Connection error')
  }, [])

  useEffect(() => {
    const manager = syncManager.current

    // Subscribe to data changes
    try {
      subscriptionId.current = manager.subscribe(config)
      
      manager.on('data:change', handleDataChange)
      manager.on('connection:open', () => handleConnectionChange(true))
      manager.on('connection:close', () => handleConnectionChange(false))
      manager.on('connection:error', handleError)

      // Initial data sync
      manager.syncData(config.table).then(initialData => {
        if (initialData) {
          setData(initialData)
        }
      })

    } catch (err: any) {
      setError(err.message)
    }

    return () => {
      if (subscriptionId.current) {
        manager.unsubscribe(subscriptionId.current)
      }
      
      manager.off('data:change', handleDataChange)
      manager.off('connection:open', () => handleConnectionChange(true))
      manager.off('connection:close', () => handleConnectionChange(false))
      manager.off('connection:error', handleError)
    }
  }, [config.channel, config.table, handleDataChange, handleConnectionChange, handleError])

  const updateData = useCallback(async (updates: any, condition: any) => {
    return syncManager.current.updateData(config.table, updates, condition)
  }, [config.table])

  const refresh = useCallback(async () => {
    const freshData = await syncManager.current.syncData(config.table)
    if (freshData) {
      setData(freshData)
    }
  }, [config.table])

  return {
    data,
    isConnected,
    error,
    updateData,
    refresh
  }
}

// ==================== Specialized Hooks ====================

export function useToolsSync() {
  return useRealTimeSync({
    channel: 'tools-sync',
    table: 'tools',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    debounceMs: 1000
  })
}

export function useFavoritesSync(userId: string) {
  return useRealTimeSync({
    channel: `favorites-${userId}`,
    table: 'user_favorites',
    filter: `user_id=eq.${userId}`,
    events: ['INSERT', 'DELETE']
  })
}

export function useAnalyticsSync() {
  return useRealTimeSync({
    channel: 'analytics-sync',
    table: 'tool_analytics',
    events: ['INSERT', 'UPDATE'],
    batchSize: 10,
    debounceMs: 5000
  })
}

export function useRatingsSync(toolId: string) {
  return useRealTimeSync({
    channel: `ratings-${toolId}`,
    table: 'tool_ratings',
    filter: `tool_id=eq.${toolId}`,
    events: ['INSERT', 'UPDATE', 'DELETE']
  })
}

// ==================== Real-time Connection Status Component ====================

export function RealTimeStatus() {
  const [status, setStatus] = useState<any>({})
  const syncManager = useRef(RealTimeSyncManager.getInstance())

  useEffect(() => {
    const updateStatus = () => {
      setStatus(syncManager.current.getConnectionStatus())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)

    const manager = syncManager.current
    manager.on('connection:open', updateStatus)
    manager.on('connection:close', updateStatus)
    manager.on('connection:error', updateStatus)

    return () => {
      clearInterval(interval)
      manager.off('connection:open', updateStatus)
      manager.off('connection:close', updateStatus)
      manager.off('connection:error', updateStatus)
    }
  }, [])

  const getStatusColor = () => {
    switch (status.status) {
      case 'connected': return 'text-green-500'
      case 'reconnecting': return 'text-yellow-500'
      case 'disconnected': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const handleReconnect = () => {
    syncManager.current.forceReconnect()
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className={getStatusColor()}>
        {status.status || 'Unknown'}
      </span>
      {status.subscriptions > 0 && (
        <span className="text-gray-500">
          ({status.subscriptions} subscriptions)
        </span>
      )}
      {status.status === 'disconnected' && (
        <button
          onClick={handleReconnect}
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Reconnect
        </button>
      )}
    </div>
  )
}

// ==================== Sync Utilities ====================

export class SyncUtils {
  private static syncManager = RealTimeSyncManager.getInstance()

  static async broadcastUpdate(table: string, data: any) {
    // This would typically trigger a database update that would
    // then be broadcasted to all connected clients
    return this.syncManager.updateData(table, data, { id: data.id })
  }

  static subscribeToUserUpdates(userId: string, callback: (event: SyncEvent) => void) {
    return this.syncManager.subscribe({
      channel: `user-updates-${userId}`,
      table: 'users',
      filter: `id=eq.${userId}`,
      events: ['UPDATE']
    })
  }

  static subscribeToGlobalUpdates(callback: (event: SyncEvent) => void) {
    const subscriptions = [
      this.syncManager.subscribe({
        channel: 'global-tools',
        table: 'tools',
        events: ['INSERT', 'UPDATE']
      }),
      this.syncManager.subscribe({
        channel: 'global-categories',
        table: 'categories',
        events: ['INSERT', 'UPDATE']
      })
    ]

    return subscriptions
  }
}

export { RealTimeSyncManager }
export default RealTimeSyncManager