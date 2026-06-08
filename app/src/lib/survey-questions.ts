export interface SurveyOption {
  value: string;
  label: {
    en: string;
    ar: string;
    fr: string;
  };
}

export interface SurveyQuestion {
  id: string;
  question: {
    en: string;
    ar: string;
    fr: string;
  };
  type: "select" | "text";
  options?: SurveyOption[];
}

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: "experience",
    type: "select",
    question: {
      en: "How long have you been distributing Tiger Head batteries?",
      ar: "منذ متى وأنت توزع بطاريات Tiger Head؟",
      fr: "Depuis combien de temps distribuez-vous les batteries Tiger Head ?",
    },
    options: [
      {
        value: "less_than_1",
        label: { en: "Less than 1 year", ar: "أقل من سنة", fr: "Moins d'un an" },
      },
      {
        value: "1_to_3",
        label: { en: "1-3 years", ar: "من سنة إلى 3 سنوات", fr: "1 à 3 ans" },
      },
      {
        value: "3_to_5",
        label: { en: "3-5 years", ar: "من 3 إلى 5 سنوات", fr: "3 à 5 ans" },
      },
      {
        value: "more_than_5",
        label: { en: "More than 5 years", ar: "أكثر من 5 سنوات", fr: "Plus de 5 ans" },
      },
    ],
  },
  {
    id: "monthly_volume",
    type: "select",
    question: {
      en: "What is your approximate monthly purchase volume of Tiger Head batteries?",
      ar: "ما حجم مشترياتك الشهرية التقريبي من بطاريات Tiger Head؟",
      fr: "Quel est votre volume d'achat mensuel approximatif de batteries Tiger Head ?",
    },
    options: [
      {
        value: "less_100",
        label: { en: "Less than 100 units", ar: "أقل من 100 وحدة", fr: "Moins de 100 unités" },
      },
      {
        value: "100_500",
        label: { en: "100-500 units", ar: "100 إلى 500 وحدة", fr: "100 à 500 unités" },
      },
      {
        value: "500_1000",
        label: { en: "500-1000 units", ar: "500 إلى 1000 وحدة", fr: "500 à 1000 unités" },
      },
      {
        value: "more_1000",
        label: { en: "More than 1000 units", ar: "أكثر من 1000 وحدة", fr: "Plus de 1000 unités" },
      },
    ],
  },
  {
    id: "sales_channel",
    type: "select",
    question: {
      en: "What is your primary sales channel for Tiger Head batteries?",
      ar: "ما قناة البيع الرئيسية لديك لبطاريات Tiger Head؟",
      fr: "Quel est votre principal canal de vente pour les batteries Tiger Head ?",
    },
    options: [
      {
        value: "retail",
        label: { en: "Retail stores", ar: "متاجر التجزئة", fr: "Magasins de détail" },
      },
      {
        value: "wholesale",
        label: { en: "Wholesale market", ar: "سوق الجملة", fr: "Marché de gros" },
      },
      {
        value: "online",
        label: { en: "Online e-commerce", ar: "التجارة الإلكترونية", fr: "Commerce en ligne" },
      },
      {
        value: "project",
        label: { en: "Engineering projects", ar: "مشاريع هندسية", fr: "Projets d'ingénierie" },
      },
    ],
  },
  {
    id: "improvement",
    type: "select",
    question: {
      en: "Which aspect of Tiger Head batteries would you most like to see improved?",
      ar: "ما الجانب الذي ترغب أكثر في تحسينه في بطاريات Tiger Head؟",
      fr: "Quel aspect des batteries Tiger Head souhaiteriez-vous le plus voir amélioré ?",
    },
    options: [
      {
        value: "price",
        label: { en: "Price competitiveness", ar: "التنافسية السعرية", fr: "Compétitivité des prix" },
      },
      {
        value: "packaging",
        label: { en: "Product packaging", ar: "تغليف المنتج", fr: "Emballage du produit" },
      },
      {
        value: "service",
        label: { en: "After-sales service", ar: "خدمة ما بعد البيع", fr: "Service après-vente" },
      },
      {
        value: "variety",
        label: { en: "Product line variety", ar: "تنوع خط المنتجات", fr: "Variété de la gamme" },
      },
    ],
  },
];

export function getQuestionById(id: string): SurveyQuestion | undefined {
  return surveyQuestions.find((question) => question.id === id);
}
