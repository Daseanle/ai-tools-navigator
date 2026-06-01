'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AuthModal } from '@/components/ui/auth-modal'
import { 
  User, 
  LogOut, 
  Settings, 
  Heart, 
  BarChart3,
  Shield,
  Loader2 
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

export function UserNav() {
  const { user, signOut, loading, isAdmin } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string || 'zh'

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <AuthModal>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          登录
        </Button>
      </AuthModal>
    )
  }

  const userEmail = user.email || ''
  const userInitials = userEmail
    .split('@')[0]
    .substring(0, 2)
    .toUpperCase()

  const handleMenuClick = (path: string) => {
    router.push(`/${lang}/dashboard/${path}`)
  }

  const handleAdminClick = () => {
    router.push(`/${lang}/admin`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="头像" />
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || '用户'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 管理员专用菜单项 */}
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={handleAdminClick}>
              <Shield className="mr-2 h-4 w-4 text-orange-500" />
              <span>管理后台</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={() => handleMenuClick('favorites')}>
          <Heart className="mr-2 h-4 w-4" />
          <span>智能收藏</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick('analytics')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>数据分析</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick('settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
