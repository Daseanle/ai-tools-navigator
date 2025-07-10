import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  membership: {
    type: 'free' | 'experience' | 'industry' | 'team'
    expires_at?: string
  }
  settings: {
    language: 'zh' | 'en'
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    privacy: {
      profile_public: boolean
      usage_analytics: boolean
    }
  }
}

interface Tool {
  id: string
  name: string
  description: string
  slug: string
  url: string
  category_id: string
  rating: number
  rating_count: number
  visits: number
  pricing: 'free' | 'freemium' | 'paid'
  featured: boolean
  created_at: string
  updated_at: string
  tags: string[]
  logo_url?: string
  screenshots?: string[]
  is_favorite?: boolean
  user_rating?: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
  color?: string
  tools_count: number
  featured: boolean
}

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Tools state
  tools: Tool[]
  categories: Category[]
  favorites: Tool[]
  searchResults: Tool[]
  
  // UI state
  theme: 'light' | 'dark' | 'system'
  language: 'zh' | 'en'
  sidebarOpen: boolean
  searchQuery: string
  selectedCategory: string | null
  
  // Filters
  filters: {
    category: string | null
    pricing: string | null
    rating: number | null
    tags: string[]
    sortBy: 'name' | 'rating' | 'visits' | 'created_at'
    sortOrder: 'asc' | 'desc'
  }
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  
  // Tools actions
  setTools: (tools: Tool[]) => void
  setCategories: (categories: Category[]) => void
  setFavorites: (favorites: Tool[]) => void
  setSearchResults: (results: Tool[]) => void
  addToFavorites: (tool: Tool) => void
  removeFromFavorites: (toolId: string) => void
  updateToolRating: (toolId: string, rating: number) => void
  
  // UI actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: 'zh' | 'en') => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  
  // Filter actions
  setFilters: (filters: Partial<AppState['filters']>) => void
  resetFilters: () => void
  
  // Utility actions
  clearSearch: () => void
  refresh: () => void
}

const defaultFilters = {
  category: null,
  pricing: null,
  rating: null,
  tags: [],
  sortBy: 'rating' as const,
  sortOrder: 'desc' as const
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      tools: [],
      categories: [],
      favorites: [],
      searchResults: [],
      
      theme: 'system',
      language: 'zh',
      sidebarOpen: false,
      searchQuery: '',
      selectedCategory: null,
      
      filters: defaultFilters,
      
      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      
      // Tools actions
      setTools: (tools) => set({ tools }),
      setCategories: (categories) => set({ categories }),
      setFavorites: (favorites) => set({ favorites }),
      setSearchResults: (searchResults) => set({ searchResults }),
      
      addToFavorites: (tool) => set((state) => ({
        favorites: [...state.favorites, tool],
        tools: state.tools.map(t => 
          t.id === tool.id ? { ...t, is_favorite: true } : t
        )
      })),
      
      removeFromFavorites: (toolId) => set((state) => ({
        favorites: state.favorites.filter(t => t.id !== toolId),
        tools: state.tools.map(t => 
          t.id === toolId ? { ...t, is_favorite: false } : t
        )
      })),
      
      updateToolRating: (toolId, rating) => set((state) => ({
        tools: state.tools.map(t => 
          t.id === toolId ? { ...t, user_rating: rating } : t
        ),
        favorites: state.favorites.map(t => 
          t.id === toolId ? { ...t, user_rating: rating } : t
        )
      })),
      
      // UI actions
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      
      // Filter actions
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      
      resetFilters: () => set({ 
        filters: defaultFilters,
        searchQuery: '',
        selectedCategory: null
      }),
      
      // Utility actions
      clearSearch: () => set({ 
        searchQuery: '', 
        searchResults: [] 
      }),
      
      refresh: () => {
        // This will be implemented to refresh data from APIs
        set({ isLoading: true })
        // API calls will be handled by the components
      }
    }),
    {
      name: 'ai-navigator-store',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        language: state.language,
        favorites: state.favorites,
        filters: state.filters
      })
    }
  )
)

// Selectors for better performance
export const useUser = () => useAppStore(state => state.user)
export const useAuth = () => useAppStore(state => ({ 
  user: state.user, 
  isAuthenticated: state.isAuthenticated, 
  isLoading: state.isLoading 
}))
export const useTools = () => useAppStore(state => state.tools)
export const useCategories = () => useAppStore(state => state.categories)
export const useFavorites = () => useAppStore(state => state.favorites)
export const useSearchResults = () => useAppStore(state => state.searchResults)
export const useTheme = () => useAppStore(state => state.theme)
export const useLanguage = () => useAppStore(state => state.language)
export const useFilters = () => useAppStore(state => state.filters)
export const useSearchQuery = () => useAppStore(state => state.searchQuery)