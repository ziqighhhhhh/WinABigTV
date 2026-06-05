import { useState } from 'react'
import { useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, ArrowLeft, Shield, User } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('admin_token', data.token)
      toast.success('登录成功')
      navigate('/admin/dashboard')
    },
    onError: (err) => {
      toast.error('登录失败: ' + err.message)
    },
  })

  const handleLogin = () => {
    if (!username || !password) {
      toast.error('请输入用户名和密码')
      return
    }
    loginMutation.mutate({ username, password })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <Card className="max-w-sm w-full border border-[#e5e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardContent className="pt-8 pb-8 px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#111827] transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            返回首页
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-3">
              <Shield size={24} className="text-[#2563eb]" />
            </div>
            <h1 className="text-xl font-semibold text-[#111827]">管理后台</h1>
            <p className="text-sm text-[#6b7280] mt-1">请输入用户名和密码</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111827]">用户名</Label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入用户名"
                  className="h-11 pl-9 border-[#e5e7eb] rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#2563eb]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111827]">密码</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入密码"
                  className="h-11 pl-9 border-[#e5e7eb] rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#2563eb]"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-sm font-medium"
            >
              {loginMutation.isPending ? '登录中...' : '进入管理后台'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
