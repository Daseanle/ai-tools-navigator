'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg',
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [imageError, setImageError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // 交叉观察器实现懒加载
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px'
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority])

  // 生成模糊占位符
  const generateBlurDataURL = (width: number, height: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, width, height)
    }
    return canvas.toDataURL()
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      setImageSrc(fallbackSrc)
      onError?.()
    }
  }

  return (
    <div 
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {isInView ? (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={generateBlurDataURL(width || 400, height || 300)}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      ) : (
        <div 
          className="w-full h-full bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* 加载指示器 */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// WebP 支持检测
export function useWebPSupport() {
  const [supportsWebP, setSupportsWebP] = useState(false)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const dataURL = canvas.toDataURL('image/webp')
      setSupportsWebP(dataURL.indexOf('data:image/webp') === 0)
    }
  }, [])

  return supportsWebP
}

// 响应式图片组件
export function ResponsiveImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  const supportsWebP = useWebPSupport()
  
  // 根据屏幕尺寸和WebP支持生成不同的图片源
  const getOptimizedSrc = (baseSrc: string) => {
    if (!baseSrc) return baseSrc
    
    // 如果是外部URL，返回原始URL
    if (baseSrc.startsWith('http')) return baseSrc
    
    // 生成WebP版本
    if (supportsWebP) {
      return baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }
    
    return baseSrc
  }

  return (
    <OptimizedImage
      src={getOptimizedSrc(src)}
      alt={alt}
      className={className}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality={85}
      {...props}
    />
  )
}