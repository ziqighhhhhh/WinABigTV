import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { QrCode, ArrowRight, AlertTriangle } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function Home() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlCode = searchParams.get('code') || ''

  const [code, setCode] = useState('')
  const [autoChecking, setAutoChecking] = useState(!!urlCode)

  const verifyMutation = trpc.registration.verifyCode.useMutation({
    onSuccess: (data) => {
      setAutoChecking(false)
      if (data.valid) {
        navigate(`/register?code=${data.code}`)
      } else if (data.reason === 'used') {
        toast.error('该编码已被使用，无法再次进入')
      } else {
        toast.error('编码不存在，请检查后重新输入')
      }
    },
    onError: () => {
      setAutoChecking(false)
      toast.error('验证失败，请重试')
    },
  })

  // 如果URL中有code参数，自动验证并跳转
  useEffect(() => {
    if (urlCode) {
      verifyMutation.mutate({ code: urlCode })
    }
  }, [urlCode])

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error('请输入编码')
      return
    }
    verifyMutation.mutate({ code: code.trim().toUpperCase() })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  // URL中有code参数时，显示加载状态
  if (autoChecking) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <Card className="max-w-sm w-full border border-[#e5e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardContent className="pt-8 pb-8 px-6">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-4">
              <QrCode size={28} className="text-[#2563eb]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#111827] mb-2">
              编码登记系统
            </h1>
            <p className="text-sm text-[#6b7280]">
              请输入您的编码进入登记页面
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111827]">编码</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="请输入6位编码"
                maxLength={6}
                className="h-12 text-center text-lg tracking-[0.3em] font-mono border-[#e5e7eb] rounded-md uppercase focus:ring-2 focus:ring-blue-100 focus:border-[#2563eb]"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={verifyMutation.isPending}
              className="w-full h-12 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-sm font-medium"
            >
              {verifyMutation.isPending ? (
                '验证中...'
              ) : (
                <>
                  进入登记页面
                  <ArrowRight size={14} className="ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 flex items-start gap-2 px-3 py-2.5 bg-[#f9fafb] rounded-md">
            <AlertTriangle size={14} className="text-[#9ca3af] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              每个编码只能使用一次，提交后编码将自动失效。扫码可自动填入编码。
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e5e7eb] text-center">
            <a
              href="/admin"
              className="text-xs text-[#9ca3af] hover:text-[#2563eb] transition-colors"
            >
              管理后台入口
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
