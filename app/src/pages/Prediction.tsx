import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/providers/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TeamPicker from '@/components/TeamPicker';
import { toast, Toaster } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Trophy, ChevronRight, AlertCircle } from 'lucide-react';

export default function Prediction() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';

  const [teams, setTeams] = useState<string[]>(['', '', '', '']);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.registration.submit.useMutation({
    onSuccess: () => {
      toast.success('Prediction submitted successfully!');
      setSubmitted(true);
      setTimeout(() => navigate('/success'), 1500);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleTeamChange = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
  };

  const handleSubmit = () => {
    if (teams.some((t) => !t)) {
      toast.error(t('prediction.error.incomplete'));
      return;
    }
    if (new Set(teams).size !== 4) {
      toast.error(t('prediction.error.duplicate'));
      return;
    }

    const surveyAnswers = JSON.parse(
      localStorage.getItem(`survey_${code}`) || '[]'
    );
    const scanInfo = JSON.parse(
      localStorage.getItem(`scan_register_${code}`) || '{}'
    );

    submitMutation.mutate({
      code,
      surveyAnswers,
      teams: teams as [string, string, string, string],
      responderName: scanInfo.name,
      responderContact: scanInfo.contact
        ? `${scanInfo.contactType || 'contact'}:${scanInfo.contact}`
        : undefined,
      responderCountry: scanInfo.country,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('prediction.submit')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <Card className="max-w-md w-full border border-[#e5e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardContent className="pt-8 pb-8 px-6">
          {/* 语言切换 */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Trophy size={28} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {t('prediction.title')}
            </h1>
            <p className="text-sm text-gray-500">{t('prediction.subtitle')}</p>
          </div>

          {/* 球队选择 */}
          <div className="space-y-5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('prediction.teamLabel', { number: index + 1 })}
                </label>
                <TeamPicker
                  value={teams[index]}
                  onChange={(value) => handleTeamChange(index, value)}
                  disabledTeams={teams.filter((_, teamIndex) => teamIndex !== index)}
                  placeholder={t('prediction.teamPlaceholder')}
                />
              </div>
            ))}
          </div>

          {/* 提示 */}
          <div className="mt-6 flex items-start gap-2 px-3 py-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle
              size={16}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-amber-700">
              Select 4 different teams. Each code can only submit once.
            </p>
          </div>

          {/* 提交按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || teams.some((t) => !t)}
            className="w-full h-12 mt-6 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
          >
            {submitMutation.isPending ? (
              'Submitting...'
            ) : (
              <>
                {t('prediction.submit')}
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
