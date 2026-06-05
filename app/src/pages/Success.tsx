import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Trophy, Calendar, Mail } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Success() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border border-[#e5e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardContent className="pt-12 pb-12 px-6 text-center">
          {/* 语言切换 */}
          <div className="flex justify-end mb-6">
            <LanguageSwitcher />
          </div>

          {/* 成功图标 */}
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            {t('success.title')}
          </h1>

          <p className="text-gray-600 mb-8">
            {t('success.message')}
          </p>

          {/* 信息卡片 */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Calendar size={20} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t('success.note')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <Trophy size={20} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {t('success.keepCode')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
              <Mail size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {t('success.contact')}
                </p>
              </div>
            </div>
          </div>

          {/* 底部 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Tiger Head Battery · 2026 FIFA World Cup
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
