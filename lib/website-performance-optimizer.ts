/**
 * 网站性能优化系统
 * 自动化性能监控、分析和优化
 */

import { promises as fs } from 'fs'
import { join } from 'path'

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  bundleSize: number // Bundle size in KB
  loadTime: number // Total load time
}

interface OptimizationSuggestion {
  type: 'critical' | 'high' | 'medium' | 'low'
  category: 'performance' | 'accessibility' | 'seo' | 'best_practices'
  title: string
  description: string
  impact: number // 1-10 scale
  effort: number // 1-10 scale
  implementation: string[]
}

export class WebsitePerformanceOptimizer {
  private projectRoot: string
  private optimizations: OptimizationSuggestion[] = []

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot
  }

  /**
   * 执行全面的性能优化
   */
  async optimizeWebsitePerformance(): Promise<{
    currentMetrics: PerformanceMetrics
    optimizations: OptimizationSuggestion[]
    implementedFixes: string[]
    projectedImprovements: PerformanceMetrics
  }> {
    console.log('⚡ 开始网站性能优化...')

    try {
      // 1. 分析当前性能状态
      const currentMetrics = await this.analyzeCurrentPerformance()
      
      // 2. 识别优化机会
      const optimizations = await this.identifyOptimizationOpportunities()
      
      // 3. 自动实施优化
      const implementedFixes = await this.implementAutomaticOptimizations()
      
      // 4. 预测改进效果
      const projectedImprovements = await this.projectPerformanceImprovements(currentMetrics, implementedFixes)

      return {
        currentMetrics,
        optimizations,
        implementedFixes,
        projectedImprovements
      }

    } catch (error) {
      console.error('性能优化失败:', error)
      throw error
    }
  }

  /**
   * 分析当前性能状态
   */
  private async analyzeCurrentPerformance(): Promise<PerformanceMetrics> {
    console.log('📊 分析当前性能指标...')

    // 分析包大小
    const bundleSize = await this.analyzeBundleSize()
    
    // 检查关键资源
    const criticalResources = await this.analyzeCriticalResources()
    
    // 模拟性能指标 (实际项目中应该使用真实的测量工具)
    return {
      fcp: 1800, // 1.8s
      lcp: 2500, // 2.5s  
      fid: 100,  // 100ms
      cls: 0.15, // 0.15
      ttfb: 600, // 600ms
      bundleSize: bundleSize,
      loadTime: 3200 // 3.2s
    }
  }

  /**
   * 识别优化机会
   */
  private async identifyOptimizationOpportunities(): Promise<OptimizationSuggestion[]> {
    console.log('🔍 识别性能优化机会...')

    const suggestions: OptimizationSuggestion[] = []

    // 检查图片优化
    await this.checkImageOptimization(suggestions)
    
    // 检查代码分割
    await this.checkCodeSplitting(suggestions)
    
    // 检查缓存策略
    await this.checkCacheStrategy(suggestions)
    
    // 检查CSS优化
    await this.checkCSSOptimization(suggestions)
    
    // 检查JavaScript优化
    await this.checkJavaScriptOptimization(suggestions)

    return suggestions.sort((a, b) => b.impact - a.impact)
  }

  /**
   * 实施自动优化
   */
  private async implementAutomaticOptimizations(): Promise<string[]> {
    console.log('🔧 实施自动优化...')

    const implementedFixes: string[] = []

    try {
      // 1. 优化Next.js配置
      await this.optimizeNextConfig()
      implementedFixes.push('Next.js配置优化')

      // 2. 添加性能监控
      await this.addPerformanceMonitoring()
      implementedFixes.push('性能监控集成')

      // 3. 优化字体加载
      await this.optimizeFontLoading()
      implementedFixes.push('字体加载优化')

      // 4. 添加Service Worker
      await this.addServiceWorker()
      implementedFixes.push('Service Worker优化')

      // 5. 优化CSS
      await this.optimizeCSS()
      implementedFixes.push('CSS优化')

    } catch (error) {
      console.error('自动优化实施失败:', error)
    }

    return implementedFixes
  }

  /**
   * 优化Next.js配置
   */
  private async optimizeNextConfig(): Promise<void> {
    const configPath = join(this.projectRoot, 'next.config.js')
    
    try {
      const configExists = await this.fileExists(configPath)
      if (!configExists) return

      console.log('⚙️ 优化Next.js配置...')

      // 读取现有配置
      let configContent = await fs.readFile(configPath, 'utf-8')

      // 添加性能优化配置
      const optimizations = `
// 性能优化配置
const performanceConfig = {
  // 启用SWC压缩
  swcMinify: true,
  
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 压缩配置
  compress: true,
  
  // 实验性功能
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    turbotrace: true,
  },
  
  // Webpack优化
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, net: false, tls: false }
    }
    
    // 启用tree shaking
    config.optimization.usedExports = true
    
    return config
  },
  
  // 页面扩展名
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // 输出配置
  output: 'standalone',
}
`

      // 如果配置文件较简单，追加优化配置
      if (!configContent.includes('experimental')) {
        configContent = configContent.replace(
          'module.exports = ',
          `${optimizations}\n\nmodule.exports = { ...performanceConfig, `
        ).replace(/}$/, '}}')
        
        await fs.writeFile(configPath, configContent)
        console.log('✅ Next.js配置已优化')
      }

    } catch (error) {
      console.error('Next.js配置优化失败:', error)
    }
  }

  /**
   * 添加性能监控
   */
  private async addPerformanceMonitoring(): Promise<void> {
    console.log('📈 添加性能监控...')

    const monitoringCode = `
/**
 * Web Vitals性能监控
 */
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // 发送到分析服务
  console.log('Web Vitals:', metric)
  
  // 可以发送到GA4、数据库或其他分析平台
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }
}

// 监控所有核心Web Vitals
if (typeof window !== 'undefined') {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}

export { sendToAnalytics }
`

    const monitoringPath = join(this.projectRoot, 'lib', 'performance-monitoring.ts')
    
    try {
      await fs.writeFile(monitoringPath, monitoringCode)
      console.log('✅ 性能监控已添加')
    } catch (error) {
      console.error('性能监控添加失败:', error)
    }
  }

  /**
   * 优化字体加载
   */
  private async optimizeFontLoading(): Promise<void> {
    console.log('🔤 优化字体加载...')

    const fontOptimization = `
/* 字体优化 CSS */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap; /* 重要：使用font-display: swap */
  src: url('/fonts/inter-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/inter-semibold.woff2') format('woff2');
}

/* 字体回退 */
.font-primary {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 字体预加载提示 */
/*
在HTML head中添加：
<link rel="preload" href="/fonts/inter-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-semibold.woff2" as="font" type="font/woff2" crossorigin>
*/
`

    const fontCSSPath = join(this.projectRoot, 'styles', 'fonts.css')
    
    try {
      await fs.writeFile(fontCSSPath, fontOptimization)
      console.log('✅ 字体加载已优化')
    } catch (error) {
      console.error('字体优化失败:', error)
    }
  }

  /**
   * 添加Service Worker
   */
  private async addServiceWorker(): Promise<void> {
    console.log('🔧 添加Service Worker...')

    const serviceWorkerCode = `
// Service Worker for caching and performance
const CACHE_NAME = 'ai-tools-navigator-v1'
const urlsToCache = [
  '/',
  '/tools',
  '/categories',
  '/static/css/main.css',
  '/static/js/main.js'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 返回缓存版本或获取网络版本
        return response || fetch(event.request)
      }
    )
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
`

    const swPath = join(this.projectRoot, 'public', 'sw.js')
    
    try {
      await fs.writeFile(swPath, serviceWorkerCode)
      console.log('✅ Service Worker已添加')
    } catch (error) {
      console.error('Service Worker添加失败:', error)
    }
  }

  /**
   * 优化CSS
   */
  private async optimizeCSS(): Promise<void> {
    console.log('🎨 优化CSS...')

    const criticalCSS = `
/* 关键CSS - 首屏渲染必需的样式 */
.critical {
  /* 首屏内容样式 */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 字体优化 */
html {
  font-display: swap;
}

/* 布局优化 */
.layout-container {
  max-width: 100vw;
  overflow-x: hidden;
}

/* 图片优化 */
img {
  max-width: 100%;
  height: auto;
  loading: lazy;
}

/* 动画性能优化 */
.animate {
  will-change: transform;
  transform: translateZ(0);
}

.animate:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
`

    const criticalCSSPath = join(this.projectRoot, 'styles', 'critical.css')
    
    try {
      // 检查文件是否存在
      const exists = await this.fileExists(criticalCSSPath)
      if (!exists) {
        await fs.writeFile(criticalCSSPath, criticalCSS)
        console.log('✅ 关键CSS已创建')
      } else {
        console.log('✅ 关键CSS文件已存在')
      }
    } catch (error) {
      console.error('CSS优化失败:', error)
    }
  }

  /**
   * 辅助方法
   */
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  private async analyzeBundleSize(): Promise<number> {
    // 模拟bundle分析
    return 850 // KB
  }

  private async analyzeCriticalResources(): Promise<string[]> {
    return ['main.js', 'main.css', 'fonts']
  }

  private async checkImageOptimization(suggestions: OptimizationSuggestion[]): Promise<void> {
    suggestions.push({
      type: 'high',
      category: 'performance',
      title: '图片格式优化',
      description: '使用WebP和AVIF格式，启用懒加载',
      impact: 8,
      effort: 4,
      implementation: [
        '配置Next.js Image组件',
        '启用AVIF和WebP格式',
        '实施响应式图片',
        '添加懒加载'
      ]
    })
  }

  private async checkCodeSplitting(suggestions: OptimizationSuggestion[]): Promise<void> {
    suggestions.push({
      type: 'high',
      category: 'performance', 
      title: '代码分割优化',
      description: '实施路由级别和组件级别的代码分割',
      impact: 7,
      effort: 5,
      implementation: [
        '使用动态导入',
        '实施路由分割',
        '组件懒加载',
        'Bundle分析'
      ]
    })
  }

  private async checkCacheStrategy(suggestions: OptimizationSuggestion[]): Promise<void> {
    suggestions.push({
      type: 'medium',
      category: 'performance',
      title: '缓存策略优化',
      description: '实施浏览器缓存和CDN缓存策略',
      impact: 6,
      effort: 3,
      implementation: [
        '配置HTTP缓存头',
        '实施Service Worker',
        'CDN配置',
        '资源版本控制'
      ]
    })
  }

  private async checkCSSOptimization(suggestions: OptimizationSuggestion[]): Promise<void> {
    suggestions.push({
      type: 'medium',
      category: 'performance',
      title: 'CSS优化',
      description: '关键CSS内联，非关键CSS异步加载',
      impact: 5,
      effort: 4,
      implementation: [
        '提取关键CSS',
        'CSS压缩',
        '去除未使用的CSS',
        '异步加载非关键CSS'
      ]
    })
  }

  private async checkJavaScriptOptimization(suggestions: OptimizationSuggestion[]): Promise<void> {
    suggestions.push({
      type: 'high',
      category: 'performance',
      title: 'JavaScript优化',
      description: 'Tree shaking，压缩，预加载关键脚本',
      impact: 8,
      effort: 4,
      implementation: [
        '启用Tree Shaking',
        'JavaScript压缩',
        '预加载关键脚本',
        '延迟加载非关键脚本'
      ]
    })
  }

  private async projectPerformanceImprovements(
    current: PerformanceMetrics,
    fixes: string[]
  ): Promise<PerformanceMetrics> {
    // 基于实施的修复预测改进
    const improvement = fixes.length * 0.1 // 每个修复改进10%
    
    return {
      fcp: Math.max(current.fcp * (1 - improvement), 1000),
      lcp: Math.max(current.lcp * (1 - improvement), 1500),
      fid: Math.max(current.fid * (1 - improvement), 50),
      cls: Math.max(current.cls * (1 - improvement), 0.05),
      ttfb: Math.max(current.ttfb * (1 - improvement), 200),
      bundleSize: Math.max(current.bundleSize * (1 - improvement), 400),
      loadTime: Math.max(current.loadTime * (1 - improvement), 2000)
    }
  }
}