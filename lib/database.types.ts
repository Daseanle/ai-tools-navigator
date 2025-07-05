export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tools: {
        Row: {
          id: number
          name: string
          slug: string
          tagline: string | null
          description: string | null
          logo_url: string | null
          website_url: string | null
          category_id: number | null
          pricing_type: "free" | "freemium" | "paid" | null
          pricing: string | null
          pricing_details: any | null
          has_api: boolean | null
          api_support: boolean | null
          media: string | null
          rating: number | null
          rating_count: number | null
          users_count: number | null
          views_count: number | null
          upvotes_count: number | null
          is_featured: boolean | null
          is_verified: boolean | null
          is_active: boolean | null
          meta_title: string | null
          meta_description: string | null
          keywords: string[] | null
          search_vector: any | null
          created_at: string | null
          updated_at: string | null
          published_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          tagline?: string | null
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          category_id?: number | null
          pricing_type?: "free" | "freemium" | "paid" | null
          pricing?: string | null
          pricing_details?: any | null
          has_api?: boolean | null
          api_support?: boolean | null
          media?: string | null
          rating?: number | null
          rating_count?: number | null
          users_count?: number | null
          views_count?: number | null
          upvotes_count?: number | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          is_active?: boolean | null
          meta_title?: string | null
          meta_description?: string | null
          keywords?: string[] | null
          search_vector?: any | null
          created_at?: string | null
          updated_at?: string | null
          published_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          tagline?: string | null
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          category_id?: number | null
          pricing_type?: "free" | "freemium" | "paid" | null
          pricing?: string | null
          pricing_details?: any | null
          has_api?: boolean | null
          api_support?: boolean | null
          media?: string | null
          rating?: number | null
          rating_count?: number | null
          users_count?: number | null
          views_count?: number | null
          upvotes_count?: number | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          is_active?: boolean | null
          meta_title?: string | null
          meta_description?: string | null
          keywords?: string[] | null
          search_vector?: any | null
          created_at?: string | null
          updated_at?: string | null
          published_at?: string | null
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          slug: string
          color: string | null
          usage_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          color?: string | null
          usage_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          color?: string | null
          usage_count?: number | null
          created_at?: string | null
        }
      }
      tool_tags: {
        Row: {
          id: number
          tool_id: number | null
          tag_id: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          tool_id?: number | null
          tag_id?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          tool_id?: number | null
          tag_id?: number | null
          created_at?: string | null
        }
      }
      tool_categories: {
        Row: {
          id: number
          tool_id: number | null
          category_id: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          tool_id?: number | null
          category_id?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          tool_id?: number | null
          category_id?: number | null
          created_at?: string | null
        }
      }
      bookmarks: {
        Row: {
          id: number
          user_id: string
          tool_id: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          tool_id?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          tool_id?: number | null
          created_at?: string | null
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          tool_id: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          tool_id?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          tool_id?: number | null
          created_at?: string | null
        }
      }
      comments: {
        Row: {
          id: number
          tool_id: number | null
          user_id: string
          content: string
          rating: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          tool_id?: number | null
          user_id: string
          content: string
          rating?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          tool_id?: number | null
          user_id?: string
          content?: string
          rating?: number | null
          created_at?: string | null
        }
      }
      upvotes: {
        Row: {
          id: number
          user_id: string
          tool_id: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          tool_id?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          tool_id?: number | null
          created_at?: string | null
        }
      }
      admins: {
        Row: {
          id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string | null
        }
      }
      use_cases: {
        Row: {
          id: number
          title: string
          prompt: string
          notes: string | null
          tool_id: number | null
          upvotes: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          title: string
          prompt: string
          notes?: string | null
          tool_id?: number | null
          upvotes?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          prompt?: string
          notes?: string | null
          tool_id?: number | null
          upvotes?: number | null
          created_at?: string | null
        }
      }
      workflows: {
        Row: {
          id: number
          title: string
          description: string | null
          steps: any
          created_at: string | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          steps: any
          created_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          steps?: any
          created_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: number
          tool_id: number | null
          user_id: string
          rating: number | null
          title: string | null
          content: string | null
          is_verified: boolean | null
          helpful_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          tool_id?: number | null
          user_id: string
          rating?: number | null
          title?: string | null
          content?: string | null
          is_verified?: boolean | null
          helpful_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          tool_id?: number | null
          user_id?: string
          rating?: number | null
          title?: string | null
          content?: string | null
          is_verified?: boolean | null
          helpful_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
