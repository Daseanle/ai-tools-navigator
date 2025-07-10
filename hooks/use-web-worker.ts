'use client'

import { useRef, useCallback, useEffect } from 'react'

interface WorkerMessage {
  type: string
  data?: any
  results?: any
  error?: string
  processingTime?: number
}

export function useWebWorker(workerPath: string) {
  const workerRef = useRef<Worker | null>(null)
  const callbacksRef = useRef<Map<string, (result: any) => void>>(new Map())

  useEffect(() => {
    // 检查Web Worker支持
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(workerPath)
      
      workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const { type, results, error } = e.data
        
        if (error) {
          console.error('Worker error:', error)
          return
        }
        
        const callback = callbacksRef.current.get(type)
        if (callback) {
          callback(results)
          callbacksRef.current.delete(type)
        }
      }
      
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error)
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [workerPath])

  const postMessage = useCallback((type: string, data: any, callback?: (result: any) => void) => {
    if (!workerRef.current) {
      // Fallback to main thread if Worker not supported
      console.warn('Web Worker not supported, falling back to main thread')
      if (callback) {
        // Simulate async processing
        setTimeout(() => callback(data), 0)
      }
      return
    }

    if (callback) {
      callbacksRef.current.set(`${type}_COMPLETE`, callback)
    }

    workerRef.current.postMessage({ type, data })
  }, [])

  return { postMessage, isSupported: !!workerRef.current }
}

// 专门的搜索Worker Hook
export function useSearchWorker() {
  const { postMessage, isSupported } = useWebWorker('/workers/search-worker.js')

  const searchTools = useCallback((tools: any[], query: string, callback: (results: any[]) => void) => {
    postMessage('SEARCH_TOOLS', { tools, query }, callback)
  }, [postMessage])

  const filterTools = useCallback((tools: any[], filters: any, callback: (results: any[]) => void) => {
    postMessage('FILTER_TOOLS', { tools, filters }, callback)
  }, [postMessage])

  const sortTools = useCallback((tools: any[], sortBy: string, sortOrder: string, callback: (results: any[]) => void) => {
    postMessage('SORT_TOOLS', { tools, sortBy, sortOrder }, callback)
  }, [postMessage])

  const calculateRecommendations = useCallback((tools: any[], userPreferences: any, viewHistory: any[], callback: (results: any[]) => void) => {
    postMessage('CALCULATE_RECOMMENDATIONS', { tools, userPreferences, viewHistory }, callback)
  }, [postMessage])

  return {
    searchTools,
    filterTools,
    sortTools,
    calculateRecommendations,
    isSupported
  }
}