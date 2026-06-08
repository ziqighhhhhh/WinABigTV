import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { surveyQuestions } from '@/lib/survey-questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

export default function Survey() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';

  const [answers, setAnswers] = useState<string[]>(() => new Array(surveyQuestions.length).fill(''));
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentStep]) {
      toast.error(t('survey.error.required'));
      return;
    }

    if (currentStep < surveyQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 保存到 localStorage，跳转到预测页
      localStorage.setItem(`survey_${code}`, JSON.stringify(answers));
      navigate(`/prediction?code=${code}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = surveyQuestions[currentStep];
  const lang = i18n.resolvedLanguage?.startsWith('ar') || i18n.language.startsWith('ar')
    ? 'ar'
    : i18n.resolvedLanguage?.startsWith('fr') || i18n.language.startsWith('fr')
      ? 'fr'
      : 'en';
  const progress = ((currentStep + 1) / surveyQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <Card className="max-w-md w-full border border-[#e5e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardContent className="pt-8 pb-8 px-6">
          {/* 语言切换 */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{t('survey.progress', { current: currentStep + 1, total: surveyQuestions.length })}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 问题 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={20} className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {currentQuestion.question[lang]}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      answers[currentStep] === option.value
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {option.label[lang]}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-11 border-gray-300"
              >
                <ChevronLeft size={16} className="mr-1" />
                {t('survey.back')}
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white"
            >
              {currentStep < surveyQuestions.length - 1 ? (
                <>
                  {t('survey.next')}
                  <ChevronRight size={16} className="ml-1" />
                </>
              ) : (
                t('survey.submit')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
