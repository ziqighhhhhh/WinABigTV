import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { trpc } from '@/providers/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { QrCode, ArrowRight, AlertTriangle } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function Home() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlCode = searchParams.get('code') || ''

  const [code, setCode] = useState('')
  const [autoChecking, setAutoChecking] = useState(!!urlCode)

  const verifyMutation = trpc.registration.verifyCode.useMutation({
    onSuccess: (data) => {
      setAutoChecking(false)
      if (data.valid) {
        navigate(`/survey?code=${data.code}`)
      } else if (data.reason === 'used') {
        toast.error(t('home.error.used'))
      } else {
        toast.error(t('home.error.notFound'))
      }
    },
    onError: () => {
      setAutoChecking(false)
      toast.error(t('home.error.verifyFailed'))
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
      toast.error(t('home.error.empty'))
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <Card className="max-w-sm w-full border border-[#e5e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardContent className="pt-8 pb-8 px-6">
          {/* 语言切换 */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <QrCode size={28} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-[#111827] mb-2">
              {t('home.title')}
            </h1>
            <p className="text-sm text-[#6b7280]">
              {t('home.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#111827]">{t('home.codeLabel')}</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder={t('home.codePlaceholder')}
                maxLength={6}
                className="h-12 text-center text-lg tracking-[0.3em] font-mono border-[#e5e7eb] rounded-md uppercase focus:ring-2 focus:ring-green-100 focus:border-green-500"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={verifyMutation.isPending}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              {verifyMutation.isPending ? (
                t('home.autoChecking')
              ) : (
                <>
                  {t('home.submit')}
                  <ArrowRight size={14} className="ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 flex items-start gap-2 px-3 py-2.5 bg-[#f9fafb] rounded-md">
            <AlertTriangle size={14} className="text-[#9ca3af] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              {t('home.note')}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[#e5e7eb] text-center">
            <a
              href="/admin"
              className="text-xs text-[#9ca3af] hover:text-[#2563eb] transition-colors"
            >
              {t('home.adminLink')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
