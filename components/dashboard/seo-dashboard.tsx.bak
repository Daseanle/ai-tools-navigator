// SEO Management Dashboard
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { SEOHealthChecker, SEOAnalytics } from '@/lib/seo-optimizer'
import { Search, TrendingUp, AlertTriangle, CheckCircle, Globe, BarChart3 } from 'lucide-react'

// ==================== SEO Dashboard ====================

export function SEODashboard() {
  const [seoHealth, setSeoHealth] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    loadSEOHealth()
  }, [])

  const loadSEOHealth = async () => {
    setIsAnalyzing(true)
    try {
      // Simulate SEO health check for key pages
      const pages = [
        { url: '/', name: 'Home Page' },
        { url: '/tools', name: 'Tools Page' },
        { url: '/categories', name: 'Categories Page' }
      ]

      const results = await Promise.all(
        pages.map(async page => ({
          ...page,
          ...(await SEOHealthChecker.checkPageSEO(`${window.location.origin}${page.url}`))
        }))
      )

      const report = SEOHealthChecker.generateSEOReport(results)
      setSeoHealth({ pages: results, report })
    } catch (error) {
      console.error('SEO analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO管理中心</h1>
          <p className="text-gray-600">监控和优化网站的搜索引擎表现</p>
        </div>
        <Button 
          onClick={loadSEOHealth} 
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          {isAnalyzing ? '分析中...' : '重新分析'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="pages">页面分析</TabsTrigger>
          <TabsTrigger value="keywords">关键词</TabsTrigger>
          <TabsTrigger value="tools">SEO工具</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {seoHealth ? (
            <>
              {/* Overall Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      整体SEO得分
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">
                          {seoHealth.report.overallScore}
                        </span>
                        <SEOScoreBadge score={seoHealth.report.overallScore} />
                      </div>
                      <Progress value={seoHealth.report.overallScore} className="h-2" />
                      <p className="text-sm text-gray-600">
                        基于{seoHealth.pages.length}个关键页面的分析
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      待修复问题
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <span className="text-3xl font-bold text-red-600">
                        {seoHealth.report.totalIssues}
                      </span>
                      <p className="text-sm text-gray-600">
                        其中{seoHealth.report.criticalIssues.length}个为严重问题
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      优化建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <span className="text-3xl font-bold text-blue-600">
                        {seoHealth.report.recommendations.length}
                      </span>
                      <p className="text-sm text-gray-600">
                        可提升SEO表现的建议
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Critical Issues */}
              {seoHealth.report.criticalIssues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">严重问题</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {seoHealth.report.criticalIssues.map((issue, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>优化建议</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {seoHealth.report.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">点击"重新分析"开始SEO检查</p>
            </div>
          )}
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          {seoHealth ? (
            <div className="grid gap-6">
              {seoHealth.pages.map((page, index) => (
                <PageAnalysisCard key={index} page={page} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无页面分析数据</p>
            </div>
          )}
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-6">
          <KeywordAnalysis />
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <SEOTools />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== Helper Components ====================

function SEOScoreBadge({ score }: { score: number }) {
  let variant: 'default' | 'secondary' | 'destructive' = 'default'
  let color = 'text-green-600'
  
  if (score < 60) {
    variant = 'destructive'
    color = 'text-red-600'
  } else if (score < 80) {
    variant = 'secondary'
    color = 'text-yellow-600'
  }

  return (
    <Badge variant={variant} className={color}>
      {score >= 80 ? '优秀' : score >= 60 ? '良好' : '需改进'}
    </Badge>
  )
}

function PageAnalysisCard({ page }: { page: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{page.name}</CardTitle>
          <SEOScoreBadge score={page.score} />
        </div>
        <p className="text-sm text-gray-600">{page.url}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">SEO得分</span>
              <span className="text-sm">{page.score}/100</span>
            </div>
            <Progress value={page.score} className="h-2" />
          </div>

          {page.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-red-600 mb-2">问题</h4>
              <div className="space-y-1">
                {page.issues.map((issue, index) => (
                  <div key={index} className="text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {page.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-600 mb-2">建议</h4>
              <div className="space-y-1">
                {page.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm text-blue-600 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function KeywordAnalysis() {
  const [keywords, setKeywords] = useState([
    { keyword: 'AI工具', position: 12, volume: 5400, difficulty: 65 },
    { keyword: '人工智能应用', position: 23, volume: 2200, difficulty: 58 },
    { keyword: 'AI导航', position: 8, volume: 1800, difficulty: 42 },
    { keyword: '机器学习工具', position: 35, volume: 980, difficulty: 72 }
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>关键词排名监控</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keywords.map((kw, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div>
                <h4 className="font-medium">{kw.keyword}</h4>
                <p className="text-sm text-gray-600">搜索量: {kw.volume.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">#{kw.position}</div>
                <div className="text-sm text-gray-600">难度: {kw.difficulty}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SEOTools() {
  const tools = [
    {
      name: '生成Sitemap',
      description: '自动生成XML站点地图',
      action: () => window.open('/sitemap.xml', '_blank')
    },
    {
      name: '查看Robots.txt',
      description: '检查robots.txt配置',
      action: () => window.open('/robots.txt', '_blank')
    },
    {
      name: '结构化数据测试',
      description: '验证结构化数据标记',
      action: () => window.open('https://search.google.com/test/rich-results', '_blank')
    },
    {
      name: 'PageSpeed检测',
      description: '检查页面加载速度',
      action: () => window.open('https://pagespeed.web.dev/', '_blank')
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tools.map((tool, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </CardHeader>
          <CardContent>
            <Button onClick={tool.action} className="w-full">
              使用工具
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SEODashboard