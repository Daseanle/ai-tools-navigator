/**
 * 推荐系统更新API端点 - Vercel Cron Job
 */
import { NextRequest, NextResponse } from 'next/server'
import { IntelligentRecommendationEngine } from '../../../../lib/intelligent-recommendation'

export async function GET(request: NextRequest) {
  try {
    console.log('🧠 开始推荐系统更新...')
    
    const recommendationEngine = new IntelligentRecommendationEngine()
    
    // 模拟获取所有用户
    const users = ['user1', 'user2', 'user3', 'user4', 'user5']
    let updatedProfiles = 0
    let generatedRecommendations = 0
    
    for (const userId of users) {
      try {
        // 更新用户画像（模拟交互数据）
        await recommendationEngine.updateUserProfile(userId, {
          type: 'view',
          data: {
            toolId: 'chatgpt',
            duration: Math.floor(Math.random() * 300) + 60,
            source: 'search'
          }
        })
        
        // 生成个性化推荐
        const recommendations = await recommendationEngine.generateRecommendations(userId, {
          currentTool: 'chatgpt',
          timeContext: {
            isWorkingHours: true,
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            season: 'summer'
          },
          sessionContext: {
            pagesViewed: ['/tools/chatgpt'],
            timeSpent: 180,
            source: 'organic'
          }
        }, 10)
        
        updatedProfiles++
        generatedRecommendations += recommendations.length
        
      } catch (error) {
        console.error(`更新用户 ${userId} 推荐失败:`, error)
      }
    }
    
    // 训练推荐模型
    await recommendationEngine.trainModels()
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        totalUsers: users.length,
        updatedProfiles: updatedProfiles,
        generatedRecommendations: generatedRecommendations,
        avgRecommendationsPerUser: Math.round(generatedRecommendations / updatedProfiles),
        modelTrained: true
      }
    }
    
    console.log('✅ 推荐系统更新完成', {
      updatedProfiles: result.data.updatedProfiles,
      totalRecommendations: result.data.generatedRecommendations
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ 推荐系统更新失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}