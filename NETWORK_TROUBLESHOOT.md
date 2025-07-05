# 🔧 网络连接问题解决方案

## 🚨 当前问题
Next.js开发服务器显示启动成功，但浏览器无法访问 localhost

## 💡 解决方案

### 方案1: 检查macOS防火墙
```bash
# 检查防火墙状态
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 如果开启，尝试临时关闭
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### 方案2: 使用不同的主机地址
```bash
# 绑定到所有接口
npm run dev -- -H 0.0.0.0 -p 3001

# 或者使用next.config.js配置
```

### 方案3: 检查hosts文件
```bash
# 编辑hosts文件
sudo nano /etc/hosts

# 确保包含:
127.0.0.1 localhost
::1 localhost
```

### 方案4: 重置网络
```bash
# 刷新DNS缓存
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### 方案5: 使用IP地址访问
尝试访问: http://127.0.0.1:3001

## 🔄 立即尝试的命令

1. **启动服务器（绑定所有接口）：**
```bash
PORT=3001 npm run dev -- -H 0.0.0.0
```

2. **然后访问：**
- http://localhost:3001
- http://127.0.0.1:3001  
- http://0.0.0.0:3001

## 📱 如果仍然无法访问

可以尝试使用手机热点或移动数据，确认是否为本地网络问题。

## 🎯 最终目标

成功访问AI工具导航网站，包含：
- ✅ 2500+个AI工具数据
- ✅ 完整认证系统
- ✅ 收藏和评价功能
- ✅ 响应式设计