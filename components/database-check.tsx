'use client'

import { useEffect, useState } from 'react'
import DatabaseNotConfigured from './database-not-configured'

interface DatabaseCheckProps {
  children: React.ReactNode
}

export default function DatabaseCheck({ children }: DatabaseCheckProps) {
  const [isConfigured, setIsConfigured] = useState(true) // Start optimistic
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if environment variables are available
    const checkConfig = () => {
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // Also check if the URL contains the actual values (not placeholders)
      const urlValid = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url' &&
                      process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')
      
      const keyValid = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key' &&
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')
      
      setIsConfigured(!!(urlValid && keyValid))
      setIsLoading(false)
    }

    checkConfig()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">正在检查配置...</div>
      </div>
    )
  }

  if (!isConfigured) {
    return <DatabaseNotConfigured />
  }

  return <>{children}</>
}