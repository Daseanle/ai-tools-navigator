"use client"

import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    // Load favorites from localStorage on mount
    const stored = localStorage.getItem("favorites")
    if (stored) {
      try {
        const favoriteIds = JSON.parse(stored)
        setFavorites(new Set(favoriteIds))
      } catch (error) {
        console.error("Failed to parse favorites:", error)
      }
    }
  }, [])

  const toggleFavorite = (toolId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(toolId)) {
        newFavorites.delete(toolId)
      } else {
        newFavorites.add(toolId)
      }

      // Save to localStorage
      localStorage.setItem("favorites", JSON.stringify([...newFavorites]))
      return newFavorites
    })
  }

  const isFavorite = (toolId: number) => favorites.has(toolId)

  return {
    favorites: [...favorites],
    toggleFavorite,
    isFavorite,
  }
}
