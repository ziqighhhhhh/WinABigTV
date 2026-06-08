import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { QrCode, ArrowRight, AlertTriangle, Trophy } from 'lucide-react'
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

  useEffect(() => {
    if (urlCode) {
      const normalizedCode = urlCode.trim().toUpperCase()
      setCode(normalizedCode)
      verifyMutation.mutate({ code: normalizedCode })
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

  if (autoChecking) {
    return (
      <div className="min-h-screen bg-[#eef8f0] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-lg border border-emerald-100 bg-white px-6 py-8 text-center shadow-[0_24px_70px_rgba(15,118,73,0.12)]">
          <Spinner className="size-8 mx-auto mb-4 text-emerald-600" />
          <p className="text-sm text-slate-600 mb-3">{t('home.autoChecking')}</p>
          <div className="inline-flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1.5">
            <QrCode size={14} className="text-emerald-700" />
            <span className="text-sm font-mono font-semibold tracking-[0.18em] text-emerald-800">
              {code || urlCode.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7_0,#f8fafc_34%,#eef8f0_100%)] px-4 py-6 sm:py-10">
      <Toaster position="top-right" />
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center">
        <section className="grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-emerald-800 shadow-sm">
                <Trophy size={16} />
                Tiger Head World Cup Campaign
              </div>
              <h1 className="text-5xl font-semibold leading-tight text-slate-950">
                {t('home.title')}
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                {t('home.note')}
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[430px] rounded-lg border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <QrCode size={23} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Tiger Head
                  </p>
                  <p className="text-sm text-slate-500">World Cup 2026</p>
                </div>
              </div>
              <LanguageSwitcher />
            </div>

            <div className="mb-7 lg:hidden">
              <h1 className="text-3xl font-semibold leading-tight text-slate-950">
                {t('home.title')}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t('home.subtitle')}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">{t('home.codeLabel')}</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder={t('home.codePlaceholder')}
                  maxLength={6}
                  className="h-12 rounded-md border-slate-200 text-center font-mono text-lg uppercase tracking-[0.28em] shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={verifyMutation.isPending}
                className="h-12 w-full rounded-md bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                {verifyMutation.isPending ? (
                  t('home.autoChecking')
                ) : (
                  <>
                    {t('home.submit')}
                    <ArrowRight size={15} className="ml-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-md bg-slate-50 px-3 py-3">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="text-xs leading-5 text-slate-500">{t('home.note')}</p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 text-center">
              <a href="/admin" className="text-xs font-medium text-slate-400 transition-colors hover:text-emerald-700">
                {t('home.adminLink')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
