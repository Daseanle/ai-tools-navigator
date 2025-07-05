"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, ExternalLink, Star, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import type { Tool } from "@/types"
import { useFavorites } from "@/hooks/use-favorites"

interface ToolCardProps {
  tool: Tool
  className?: string
}

export default function ToolCard({ tool, className = "" }: ToolCardProps) {
  const [imageError, setImageError] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(tool.id)
  const params = useParams()
  const lang = params.lang as string

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-gray-900/20 transition-all duration-300 h-full flex flex-col ${className}`}
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          toggleFavorite(tool.id)
        }}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
          favorite
            ? "bg-red-100 dark:bg-red-900/30 text-red-500"
            : "bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500"
        }`}
      >
        <Heart className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
      </button>

      <Link href={`/${lang}/tools/${tool.slug}`} className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            {!imageError && tool.logo_url ? (
              <Image
                src={tool.logo_url || "/placeholder.svg"}
                alt={`${tool.name} logo`}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                {tool.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tool.name}
            </h3>
            {tool.rating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{tool.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">
          {tool.tagline || tool.description}
        </p>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.tags.slice(0, 3).map((tag) => {
              const tagName = typeof tag === "string" ? tag : tag.name
              return (
                <span
                  key={tagName}
                  className="px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
                >
                  {tagName}
                </span>
              )
            })}
            {tool.tags.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                +{tool.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {tool.users_count && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{tool.users_count.toLocaleString()}</span>
              </div>
            )}
          </div>

          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </Link>
    </motion.div>
  )
}
