"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface FavoritesContextType {
  favorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 加载收藏
  useEffect(() => {
    const stored = localStorage.getItem("ai-navigator-favorites")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setFavorites(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error("Failed to parse favorites:", error)
        setFavorites([])
      }
    }
    setIsLoaded(true)
  }, [])

  // 保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ai-navigator-favorites", JSON.stringify(favorites))
    }
  }, [favorites, isLoaded])

  const addFavorite = (id: string) => {
    setFavorites((prev) => [...prev.filter((fav) => fav !== id), id])
  }

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav !== id))
  }

  const isFavorite = (id: string) => {
    return favorites.includes(id)
  }

  const toggleFavorite = async (id: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (isFavorite(id)) {
          removeFavorite(id)
        } else {
          addFavorite(id)
        }
        resolve()
      }, 100) // 模拟异步操作
    })
  }

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
