import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  PenLine,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowLeft,
  QrCode,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function Register() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const code = searchParams.get('code') || ''

  const [names, setNames] = useState(['', '', '', ''])
  const [submitted, setSubmitted] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; reason?: string; code?: string } | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(true)

  const verifyMutation = trpc.registration.verifyCode.useMutation({
    onSuccess: (data) => {
      setVerifyResult(data)
      setVerifyLoading(false)
    },
    onError: () => {
      setVerifyResult({ valid: false, reason: 'error' })
      setVerifyLoading(false)
    },
  })

  useEffect(() => {
    if (code.length > 0) {
      verifyMutation.mutate({ code })
    } else {
      setVerifyLoading(false)
    }
  }, [code])

  const submitMutation = trpc.registration.submit.useMutation({
    onSuccess: () => {
      toast.success('提交成功！该编码已失效。')
      setSubmitted(true)
    },
    onError: (err) => {
      toast.error('提交失败: ' + err.message)
    },
  })

  const handleSubmit = () => {
    if (!code) {
      toast.error('无效的编码')
      return
    }
    if (names.some((n) => !n.trim())) {
      toast.error('请填写所有名字')
      return
    }
    submitMutation.mutate({
      code,
      names: [
        names[0].trim(),
        names[1].trim(),
        names[2].trim(),
        names[3].trim(),
      ],
    })
  }

  // 验证编码中
  if (verifyLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  // 无编码参数
  if (!code) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <Card className="max-w-md w-full border border-[#e5e7eb] shadow-none">
          <CardContent className="pt-8 text-center">
            <QrCode size={48} className="mx-auto text-[#d1d5db] mb-4" />
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              缺少编码
            </h2>
            <p className="text-sm text-[#6b7280] mb-4">
              请通过首页输入编码或扫描二维码进入
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-[#e5e7eb]"
            >
              <ArrowLeft size={14} className="mr-1" />
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 编码不存在
  if (verifyResult?.reason === 'not_found') {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <Card className="max-w-md w-full border border-[#e5e7eb] shadow-none">
          <CardContent className="pt-8 text-center">
            <AlertTriangle
              size={48}
              className="mx-auto text-[#d1d5db] mb-4"
            />
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              编码不存在
            </h2>
            <p className="text-sm text-[#6b7280] mb-4">
              编码「{code.toUpperCase()}」不存在，请检查后重新输入
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-[#e5e7eb]"
            >
              <ArrowLeft size={14} className="mr-1" />
              返回首页重新输入
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 编码已使用（一次性）
  if (verifyResult?.reason === 'used') {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <Card className="max-w-md w-full border border-[#e5e7eb] shadow-none">
          <CardContent className="pt-8 text-center">
            <Lock size={48} className="mx-auto text-[#d1d5db] mb-4" />
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              该编码已被使用
            </h2>
            <p className="text-sm text-[#6b7280] mb-1">
              编码「{code.toUpperCase()}」已完成登记
            </p>
            <p className="text-xs text-[#9ca3af] mb-4">
              每个编码只能使用一次，如需修改请联系管理员
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-[#e5e7eb]"
            >
              <ArrowLeft size={14} className="mr-1" />
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <Card className="max-w-md w-full border border-[#e5e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#ecfdf5] flex items-center justify-center mb-3">
            <PenLine size={24} className="text-[#059669]" />
          </div>
          <h1 className="text-xl font-semibold text-[#111827]">
            报名信息录入
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            请仔细核对并填写下方信息
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#eff6ff] rounded-full">
            <QrCode size={12} className="text-[#2563eb]" />
            <span className="text-xs font-mono font-medium text-[#2563eb] tracking-wider">
              {code.toUpperCase()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          {[
            { label: '第一个名字', index: 0 },
            { label: '第二个名字', index: 1 },
            { label: '第三个名字', index: 2 },
            { label: '第四个名字', index: 3 },
          ].map(({ label, index }) => (
            <div key={index} className="space-y-1.5">
              <Label className="text-sm font-medium text-[#111827]">
                {label}
              </Label>
              <Input
                value={names[index]}
                onChange={(e) => {
                  const newNames = [...names]
                  newNames[index] = e.target.value
                  setNames(newNames)
                }}
                disabled={submitted}
                placeholder={`请输入${label}`}
                className="h-11 border-[#e5e7eb] rounded-md text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#2563eb] disabled:bg-[#f9fafb] disabled:text-[#6b7280]"
              />
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || submitted}
            className={`w-full h-11 rounded-lg text-sm font-medium transition-colors ${
              submitted
                ? 'bg-[#059669] hover:bg-[#059669] text-white'
                : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
            }`}
          >
            {submitMutation.isPending ? (
              <span className="flex items-center gap-2">提交中...</span>
            ) : submitted ? (
              <span className="flex items-center gap-2">
                <CheckCircle size={16} />
                提交成功（编码已失效）
              </span>
            ) : (
              '确认提交'
            )}
          </Button>

          {!submitted && (
            <p className="text-xs text-center text-[#9ca3af]">
              提交后该编码将自动失效，无法再次修改
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
