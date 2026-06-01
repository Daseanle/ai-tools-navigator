#!/bin/bash

# Supabase完整部署自动化脚本
# 一键完成从创建项目到数据导入的全过程

set -e

echo "🚀 AI工具导航 - Supabase自动化部署"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要工具
check_dependencies() {
    echo -e "${BLUE}🔍 检查依赖工具...${NC}"
    
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ PostgreSQL客户端未安装${NC}"
        echo "请安装PostgreSQL: brew install postgresql"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 依赖检查通过${NC}"
}

# 检查环境变量
check_env_vars() {
    echo -e "${BLUE}🔧 检查环境变量...${NC}"
    
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        echo -e "${YELLOW}请输入Supabase项目引用ID (从项目URL获取):${NC}"
        read -p "Project Ref: " SUPABASE_PROJECT_REF
        export SUPABASE_PROJECT_REF
    fi
    
    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
        echo -e "${YELLOW}请输入数据库密码:${NC}"
        read -s -p "Database Password: " SUPABASE_DB_PASSWORD
        export SUPABASE_DB_PASSWORD
        echo
    fi
    
    if [ -z "$SUPABASE_ANON_KEY" ]; then
        echo -e "${YELLOW}请输入anon key:${NC}"
        read -p "Anon Key: " SUPABASE_ANON_KEY
        export SUPABASE_ANON_KEY
    fi
    
    if [ -z "$SUPABASE_SERVICE_KEY" ]; then
        echo -e "${YELLOW}请输入service role key:${NC}"
        read -p "Service Role Key: " SUPABASE_SERVICE_KEY
        export SUPABASE_SERVICE_KEY
    fi
}

# 创建.env.local文件
create_env_file() {
    echo -e "${BLUE}📝 创建环境配置文件...${NC}"
    
    cat > .env.local << EOF
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://${SUPABASE_PROJECT_REF}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}
VERCEL_ENV=development
EOF
    
    echo -e "${GREEN}✅ .env.local文件创建成功${NC}"
}

# 测试数据库连接
test_connection() {
    echo -e "${BLUE}🔗 测试数据库连接...${NC}"
    
    DB_HOST="db.${SUPABASE_PROJECT_REF}.supabase.co"
    DB_NAME="postgres"
    DB_USER="postgres"
    DB_PORT="5432"
    
    if PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✅ 数据库连接成功${NC}"
        return 0
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        return 1
    fi
}

# 创建表结构
create_tables() {
    echo -e "${BLUE}📋 创建数据库表结构...${NC}"
    
    DB_HOST="db.${SUPABASE_PROJECT_REF}.supabase.co"
    DB_NAME="postgres"
    DB_USER="postgres"
    DB_PORT="5432"
    
    PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/create-tables-updated.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 表结构创建成功${NC}"
    else
        echo -e "${RED}❌ 表结构创建失败${NC}"
        exit 1
    fi
}

# 导入CSV数据
import_csv_data() {
    echo -e "${BLUE}📊 导入CSV数据...${NC}"
    
    # 检查CSV文件
    CSV_FILES=(
        "/Users/dasean/Downloads/categories_rows.csv"
        "/Users/dasean/Downloads/tags_rows.csv" 
        "/Users/dasean/Downloads/tools_rows.csv"
        "/Users/dasean/Downloads/tool_categories_rows.csv"
        "/Users/dasean/Downloads/admins_rows.csv"
        "/Users/dasean/Downloads/comments_rows.csv"
        "/Users/dasean/Downloads/favorites_rows.csv"
        "/Users/dasean/Downloads/upvotes_rows.csv"
        "/Users/dasean/Downloads/use_cases_rows.csv"
        "/Users/dasean/Downloads/workflows_rows.csv"
    )
    
    missing_files=()
    for file in "${CSV_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo -e "${RED}❌ 以下CSV文件缺失:${NC}"
        printf '%s\n' "${missing_files[@]}"
        echo -e "${YELLOW}请确保所有CSV文件都在Downloads目录中${NC}"
        return 1
    fi
    
    # 执行数据导入
    ./scripts/import-data.sh
}

# 设置RLS政策
setup_rls() {
    echo -e "${BLUE}🔒 设置行级安全政策...${NC}"
    
    DB_HOST="db.${SUPABASE_PROJECT_REF}.supabase.co"
    DB_NAME="postgres"
    DB_USER="postgres"
    DB_PORT="5432"
    
    PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/setup-rls-policies.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ RLS政策设置成功${NC}"
    else
        echo -e "${YELLOW}⚠️ RLS政策设置失败，请手动在Supabase控制台设置${NC}"
    fi
}

# 验证部署
verify_deployment() {
    echo -e "${BLUE}🔍 验证部署结果...${NC}"
    
    # 运行测试脚本
    if [ -f "scripts/test-database.js" ]; then
        node scripts/test-database.js
    fi
    
    echo -e "${GREEN}✅ 部署验证完成${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}开始自动化部署流程...${NC}"
    echo
    
    # 1. 检查依赖
    check_dependencies
    echo
    
    # 2. 检查环境变量
    check_env_vars
    echo
    
    # 3. 创建环境文件
    create_env_file
    echo
    
    # 4. 测试连接
    if ! test_connection; then
        echo -e "${RED}请检查Supabase配置信息是否正确${NC}"
        exit 1
    fi
    echo
    
    # 5. 创建表结构
    create_tables
    echo
    
    # 6. 导入数据
    echo -e "${YELLOW}是否导入CSV数据? (y/n):${NC}"
    read -p "" import_data
    if [ "$import_data" = "y" ] || [ "$import_data" = "Y" ]; then
        import_csv_data
        echo
    fi
    
    # 7. 设置RLS
    echo -e "${YELLOW}是否设置RLS安全政策? (y/n):${NC}"
    read -p "" setup_security
    if [ "$setup_security" = "y" ] || [ "$setup_security" = "Y" ]; then
        setup_rls
        echo
    fi
    
    # 8. 验证部署
    verify_deployment
    echo
    
    # 完成
    echo -e "${GREEN}🎉 Supabase部署完成！${NC}"
    echo
    echo -e "${BLUE}下一步操作:${NC}"
    echo "1. 访问Supabase控制台检查数据"
    echo "2. 运行 npm run dev 启动应用"
    echo "3. 访问 http://localhost:3000 查看网站"
    echo
    echo -e "${BLUE}配置文件位置:${NC}"
    echo "- 环境变量: .env.local"
    echo "- 数据库类型: lib/database.types.ts"
    echo "- Supabase客户端: lib/supabase.ts"
}

# 运行主函数
main "$@"

# NaviGuard-AI Security Audited - 2026-06-01
