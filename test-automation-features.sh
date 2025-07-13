#!/bin/bash

echo "🧪 开始测试AI Navigator自动化功能页面..."
echo "=================================="

BASE_URL="https://ai-navigator-pro.vercel.app"

# 测试函数
test_page() {
    local url=$1
    local page_name=$2
    
    echo -n "测试 $page_name: "
    
    # 使用curl测试页面状态
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    
    if [ "$status" = "200" ]; then
        echo "✅ 正常 (HTTP $status)"
    elif [ "$status" = "000" ]; then
        echo "⚠️  连接超时"
    else
        echo "❌ 错误 (HTTP $status)"
    fi
}

# 测试API端点
test_api() {
    local url=$1
    local api_name=$2
    
    echo -n "测试 $api_name API: "
    
    # 使用curl测试API并检查响应
    response=$(curl -s --max-time 10 "$url")
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    
    if [ "$status" = "200" ]; then
        # 检查是否返回JSON
        if echo "$response" | jq . >/dev/null 2>&1; then
            echo "✅ 正常 (返回有效JSON)"
        else
            echo "✅ 正常 (HTTP $status)"
        fi
    else
        echo "❌ 错误 (HTTP $status)"
    fi
}

echo "📱 前端页面测试："
echo "-------------------"

# 测试主要页面
test_page "$BASE_URL/zh" "首页"
test_page "$BASE_URL/zh/admin" "管理后台主页"
test_page "$BASE_URL/zh/admin/content" "内容管理页面"
test_page "$BASE_URL/zh/admin/crawling" "工具爬取管理页面"
test_page "$BASE_URL/zh/admin/status" "系统状态页面"
test_page "$BASE_URL/automation" "自动化总览页面"
test_page "$BASE_URL/automation/full-automation" "完全自动化面板"

echo ""
echo "🔌 API接口测试："
echo "-------------------"

# 测试API接口
test_api "$BASE_URL/api/monitoring/health" "系统健康检查"
test_api "$BASE_URL/api/automation/status" "自动化状态"
test_api "$BASE_URL/api/debug/database" "数据库调试"
test_api "$BASE_URL/api/tools" "工具列表"
test_api "$BASE_URL/api/categories" "分类列表"

echo ""
echo "🚀 自动化功能API测试："
echo "-------------------"

test_api "$BASE_URL/api/automation/content-generation" "内容生成"
test_api "$BASE_URL/api/automation/competitor-analysis" "竞品分析"
test_api "$BASE_URL/api/automation/seo-sync" "SEO同步"
test_api "$BASE_URL/api/automation/performance-monitoring" "性能监控"
test_api "$BASE_URL/api/automation/user-behavior-analysis" "用户行为分析"

echo ""
echo "📊 详细响应测试："
echo "-------------------"

echo "🔍 健康检查详情："
curl -s "$BASE_URL/api/monitoring/health" | jq . 2>/dev/null || echo "响应不是有效JSON或服务不可用"

echo ""
echo "🔍 自动化状态详情："
curl -s "$BASE_URL/api/automation/status" | jq . 2>/dev/null || echo "响应不是有效JSON或服务不可用"

echo ""
echo "=================================="
echo "测试完成！"
echo ""
echo "📝 访问这些页面进行手动测试："
echo "• 管理后台: $BASE_URL/zh/admin"
echo "• 内容管理: $BASE_URL/zh/admin/content"  
echo "• 工具爬取: $BASE_URL/zh/admin/crawling"
echo "• 自动化面板: $BASE_URL/automation/full-automation"