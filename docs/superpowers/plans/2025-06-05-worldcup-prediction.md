# 虎头电池世界杯预测活动平台 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将现有编码登记系统升级为世界杯前四强预测活动平台，支持调研问卷、球队预测、多语言、客户管理和中奖筛选。

**架构：** 最小改动方案（方案A）。在现有 React + tRPC + Drizzle ORM + MySQL 架构上增量修改：新增 `customers` 表和 JWT 认证，扩展 `name_records` 存储预测数据，新增 Survey/Prediction/Success 页面，硬编码球队列表和调研问题。

**技术栈：** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + tRPC + Drizzle ORM + MySQL + i18next + jsonwebtoken + bcryptjs

---

## 文件结构

### 新增文件

| 文件路径 | 职责 |
|---------|------|
| `app/db/migrations/0001_add_customers_and_fields.sql` | 数据库迁移：customers 表、qr_codes.customerId、name_records 新字段 |
| `app/api/routers/admin.ts` | 管理员认证路由：login + JWT 签发 |
| `app/api/lib/auth.ts` | JWT 验证工具函数、bcrypt 密码比对 |
| `app/api/middleware.ts` | 更新：新增 authenticatedProcedure（JWT 验证中间件） |
| `app/src/lib/worldcup-teams.ts` | 硬编码 48 支世界杯参赛球队列表 |
| `app/src/lib/survey-questions.ts` | 硬编码 4 道调研问题（英/阿/法三语） |
| `app/src/lib/i18n.ts` | i18next 配置：资源加载、语言检测、RTL 支持 |
| `app/public/locales/en/translation.json` | 英语翻译文件 |
| `app/public/locales/ar/translation.json` | 阿拉伯语翻译文件 |
| `app/public/locales/fr/translation.json` | 法语翻译文件 |
| `app/src/pages/Survey.tsx` | 调研问卷页面（4 道单选题） |
| `app/src/pages/Prediction.tsx` | 球队预测页面（4 个下拉选择器） |
| `app/src/pages/Success.tsx` | 提交成功页面 |
| `app/src/components/LanguageSwitcher.tsx` | 语言切换按钮组件 |
| `app/src/components/ProgressBar.tsx` | 进度条组件 |

### 修改文件

| 文件路径 | 职责变更 |
|---------|---------|
| `app/db/schema.ts` | 新增 customers 表、扩展 qr_codes 和 name_records |
| `app/db/seed.ts` | 新增默认管理员账号 seed |
| `app/api/routers/qrCode.ts` | 新增 customer 相关路由、winners 筛选路由 |
| `app/api/routers/registration.ts` | 扩展 submit 接收 surveyAnswers 和 teams |
| `app/api/router.ts` | 挂载 admin router |
| `app/src/pages/Home.tsx` | 世界杯主题、多语言、球队说明 |
| `app/src/pages/Register.tsx` | 移除（被 Survey + Prediction + Success 替代） |
| `app/src/pages/Admin.tsx` | 新增客户管理、中奖筛选、导出 CSV |
| `app/src/pages/AdminLogin.tsx` | 改为调用 API 认证（不再硬编码密码） |
| `app/src/components/AuthGuard.tsx` | 改为验证 JWT token |
| `app/src/providers/trpc.tsx` | 请求头附加 Authorization |
| `app/src/App.tsx` | 更新路由：/survey, /prediction, /success |
| `app/src/main.tsx` | 初始化 i18next |
| `app/.env.example` | 新增 JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD_HASH |
| `app/package.json` | 新增 i18next, react-i18next, jsonwebtoken, bcryptjs |

---

## 任务分解

### 任务 1：数据库迁移 — 新增 customers 表和扩展字段

**文件：**
- 修改：`app/db/schema.ts`
- 创建：`app/db/migrations/0001_add_customers_and_fields.sql`

**步骤：**

- [ ] **步骤 1：修改 schema.ts**

```typescript
// 在 qrCodes 后添加
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  country: varchar("country", { length: 50 }),
  contact: varchar("contact", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 新增 admins 表
export const admins = mysqlTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// qr_codes 新增 customerId
// 在 qrCodes 定义中新增：
// customerId: bigint("customer_id", { mode: "number", unsigned: true }),

// name_records 新增字段
// 在 nameRecords 定义中新增：
// surveyAnswers: json("survey_answers"),
// team1: varchar("team1", { length: 50 }),
// team2: varchar("team2", { length: 50 }),
// team3: varchar("team3", { length: 50 }),
// team4: varchar("team4", { length: 50 }),
```

- [ ] **步骤 2：创建迁移 SQL**

```sql
-- 新增 customers 表
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50),
  contact VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 新增 admins 表
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(256) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 扩展 qr_codes
ALTER TABLE qr_codes ADD COLUMN customer_id BIGINT UNSIGNED;

-- 扩展 name_records
ALTER TABLE name_records ADD COLUMN survey_answers JSON;
ALTER TABLE name_records ADD COLUMN team1 VARCHAR(50);
ALTER TABLE name_records ADD COLUMN team2 VARCHAR(50);
ALTER TABLE name_records ADD COLUMN team3 VARCHAR(50);
ALTER TABLE name_records ADD COLUMN team4 VARCHAR(50);
```

- [ ] **步骤 3：运行迁移**

```bash
cd app
npx drizzle-kit migrate
```

- [ ] **步骤 4：Commit**

```bash
git add app/db/schema.ts app/db/migrations/0001_add_customers_and_fields.sql
git commit -m "feat: add customers, admins tables and extend qr_codes, name_records"
```

---

### 任务 2：安全性 — JWT 认证和中间件

**文件：**
- 创建：`app/api/lib/auth.ts`
- 修改：`app/api/middleware.ts`
- 创建：`app/api/routers/admin.ts`
- 修改：`app/api/router.ts`

**步骤：**

- [ ] **步骤 1：安装依赖**

```bash
cd app
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

- [ ] **步骤 2：创建 auth.ts**

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.APP_SECRET || 'fallback-secret-change-me';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: { userId: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
  } catch {
    return null;
  }
}
```

- [ ] **步骤 3：修改 middleware.ts**

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { verifyToken } from "./lib/auth";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// 新增：需要认证的 procedure
export const authenticatedQuery = t.procedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing token' });
  }
  
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: payload,
    },
  });
});
```

- [ ] **步骤 4：创建 admin.ts router**

```typescript
import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { admins } from "@db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken } from "../lib/auth";

export const adminRouter = createRouter({
  login: publicQuery
    .input(z.object({
      username: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const users = await db.select().from(admins).where(eq(admins.username, input.username));
      
      if (users.length === 0) {
        throw new Error("Invalid credentials");
      }
      
      const user = users[0];
      if (!verifyPassword(input.password, user.passwordHash)) {
        throw new Error("Invalid credentials");
      }
      
      const token = signToken({ userId: user.id, username: user.username });
      return { token, username: user.username };
    }),
});
```

- [ ] **步骤 5：修改 router.ts 挂载 admin**

```typescript
import { adminRouter } from './routers/admin';
// 在 appRouter 中添加：
admin: adminRouter,
```

- [ ] **步骤 6：Commit**

```bash
git add app/api/lib/auth.ts app/api/middleware.ts app/api/routers/admin.ts app/api/router.ts
git commit -m "feat: add JWT authentication and admin login API"
```

---

### 任务 3：Seed 默认管理员

**文件：**
- 修改：`app/db/seed.ts`

**步骤：**

- [ ] **步骤 1：修改 seed.ts**

```typescript
import { getDb } from "../api/queries/connection";
import { admins } from "./schema";
import { hashPassword } from "../api/lib/auth";

async function seed() {
  const db = getDb();
  
  // 创建默认管理员
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  
  await db.insert(admins).values({
    username,
    passwordHash: hashPassword(password),
  }).onDuplicateKeyUpdate({
    set: { passwordHash: hashPassword(password) },
  });
  
  console.log("Seeded admin user:", username);
}

seed().catch(console.error);
```

- [ ] **步骤 2：运行 seed**

```bash
cd app
ADMIN_USERNAME=admin ADMIN_PASSWORD=your-secure-password npx tsx db/seed.ts
```

- [ ] **步骤 3：Commit**

```bash
git add app/db/seed.ts
git commit -m "feat: seed default admin user with bcrypt hash"
```

---

### 任务 4：保护管理员 API 路由

**文件：**
- 修改：`app/api/routers/qrCode.ts`

**步骤：**

- [ ] **步骤 1：将 qrCode 路由改为 authenticatedQuery**

```typescript
// 修改导入
import { createRouter, publicQuery, authenticatedQuery } from "../middleware";

// generate, delete, createCategory 改为 authenticatedQuery
export const qrCodeRouter = createRouter({
  generate: authenticatedQuery.input(...).mutation(...),
  delete: authenticatedQuery.input(...).mutation(...),
  createCategory: authenticatedQuery.input(...).mutation(...),
  
  // list, categories, getDetail 保持 publicQuery（或根据需求决定）
  list: publicQuery.input(...).query(...),
  categories: publicQuery.query(...),
  getDetail: publicQuery.input(...).query(...),
});
```

- [ ] **步骤 2：Commit**

```bash
git add app/api/routers/qrCode.ts
git commit -m "security: protect admin qrCode routes with JWT authentication"
```

---

### 任务 5：前端 — 管理员登录改为 JWT

**文件：**
- 修改：`app/src/pages/AdminLogin.tsx`
- 修改：`app/src/components/AuthGuard.tsx`
- 修改：`app/src/providers/trpc.tsx`

**步骤：**

- [ ] **步骤 1：修改 AdminLogin.tsx**

```typescript
import { trpc } from '@/providers/trpc';

// 移除 const ADMIN_PASSWORD = 'admin123'

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('admin_token', data.token);
      toast.success('登录成功');
      navigate('/admin/dashboard');
    },
    onError: (err) => {
      toast.error('登录失败: ' + err.message);
    },
  });

  const handleLogin = () => {
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    loginMutation.mutate({ username, password });
  };
  
  // ... 渲染表单，增加 username 输入框
}
```

- [ ] **步骤 2：修改 AuthGuard.tsx**

```typescript
import { verifyToken } from '@/lib/auth'; // 或使用简单解码

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin', { replace: true });
    }
  }, [navigate, location.pathname]);
  
  const token = localStorage.getItem('admin_token');
  if (!token) return null;
  
  return <>{children}</>;
}
```

- [ ] **步骤 3：修改 trpc.tsx 附加 Authorization header**

```typescript
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers() {
        const token = localStorage.getItem('admin_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

- [ ] **步骤 4：Commit**

```bash
git add app/src/pages/AdminLogin.tsx app/src/components/AuthGuard.tsx app/src/providers/trpc.tsx
git commit -m "feat: frontend JWT authentication for admin"
```

---

### 任务 6：硬编码配置 — 球队列表和调研问题

**文件：**
- 创建：`app/src/lib/worldcup-teams.ts`
- 创建：`app/src/lib/survey-questions.ts`

**步骤：**

- [ ] **步骤 1：创建 worldcup-teams.ts**

```typescript
export interface Team {
  id: string;
  name: string;
  group: string;
}

export const worldCupTeams: Team[] = [
  { id: "argentina", name: "Argentina", group: "A" },
  { id: "brazil", name: "Brazil", group: "B" },
  { id: "france", name: "France", group: "C" },
  // ... 全部 48 支参赛队
];

export function getTeamById(id: string): Team | undefined {
  return worldCupTeams.find(t => t.id === id);
}
```

- [ ] **步骤 2：创建 survey-questions.ts**

```typescript
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
  options: SurveyOption[];
}

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: "experience",
    question: {
      en: "How long have you been distributing Tiger Head batteries?",
      ar: "منذ متى وأنت توزع بطاريات تيجر هيد؟",
      fr: "Depuis combien de temps distribuez-vous des batteries Tiger Head ?"
    },
    options: [
      { value: "less_than_1", label: { en: "Less than 1 year", ar: "أقل من سنة", fr: "Moins d'un an" } },
      { value: "1_to_3", label: { en: "1-3 years", ar: "1-3 سنوات", fr: "1-3 ans" } },
      { value: "3_to_5", label: { en: "3-5 years", ar: "3-5 سنوات", fr: "3-5 ans" } },
      { value: "more_than_5", label: { en: "More than 5 years", ar: "أكثر من 5 سنوات", fr: "Plus de 5 ans" } }
    ]
  },
  // ... 其他 3 个问题
];
```

- [ ] **步骤 3：Commit**

```bash
git add app/src/lib/worldcup-teams.ts app/src/lib/survey-questions.ts
git commit -m "feat: add hardcoded world cup teams and survey questions"
```

---

### 任务 7：i18n 多语言配置

**文件：**
- 创建：`app/src/lib/i18n.ts`
- 创建：`app/public/locales/en/translation.json`
- 创建：`app/public/locales/ar/translation.json`
- 创建：`app/public/locales/fr/translation.json`
- 修改：`app/src/main.tsx`

**步骤：**

- [ ] **步骤 1：安装 i18next**

```bash
cd app
npm install i18next react-i18next i18next-browser-languagedetector
```

- [ ] **步骤 2：创建 i18n.ts**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../../public/locales/en/translation.json';
import ar from '../../public/locales/ar/translation.json';
import fr from '../../public/locales/fr/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
    },
    fallbackLng: 'en',
    detection: {
      order: ['navigator', 'htmlTag'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

- [ ] **步骤 3：创建翻译文件（示例）**

`public/locales/en/translation.json`:
```json
{
  "home": {
    "title": "2026 FIFA World Cup Top 4 Prediction",
    "subtitle": "Enter your code to participate",
    "codeLabel": "Code",
    "submit": "Enter"
  },
  "survey": {
    "title": "Quick Survey",
    "next": "Next",
    "submit": "Submit"
  }
}
```

- [ ] **步骤 4：修改 main.tsx**

```typescript
import './lib/i18n';
```

- [ ] **步骤 5：Commit**

```bash
git add app/src/lib/i18n.ts app/public/locales app/src/main.tsx
git commit -m "feat: add i18n with EN/AR/FR support"
```

---

### 任务 8：语言切换组件

**文件：**
- 创建：`app/src/components/LanguageSwitcher.tsx`
- 修改：`app/src/pages/Home.tsx`

**步骤：**

- [ ] **步骤 1：创建 LanguageSwitcher.tsx**

```typescript
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };
  
  return (
    <div className="flex gap-2">
      {['en', 'ar', 'fr'].map((lng) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`px-2 py-1 text-sm rounded ${i18n.language === lng ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {lng === 'en' ? '🇬🇧 EN' : lng === 'ar' ? '🇸🇦 AR' : '🇫🇷 FR'}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **步骤 2：Commit**

```bash
git add app/src/components/LanguageSwitcher.tsx
git commit -m "feat: add language switcher component with RTL support"
```

---

### 任务 9：调研问卷页面（Survey.tsx）

**文件：**
- 创建：`app/src/pages/Survey.tsx`

**步骤：**

- [ ] **步骤 1：创建 Survey.tsx**

```typescript
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { surveyQuestions } from '@/lib/survey-questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ProgressBar';

export default function Survey() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  
  const [answers, setAnswers] = useState<string[]>(new Array(surveyQuestions.length).fill(''));
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (currentStep < surveyQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 保存到 localStorage 或 URL state，跳转到预测页
      localStorage.setItem(`survey_${code}`, JSON.stringify(answers));
      navigate(`/prediction?code=${code}`);
    }
  };
  
  const currentQuestion = surveyQuestions[currentStep];
  const lang = i18n.language as 'en' | 'ar' | 'fr';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 px-6">
          <ProgressBar current={currentStep + 1} total={surveyQuestions.length} />
          
          <h2 className="text-xl font-semibold mt-6 mb-4">
            {currentQuestion.question[lang]}
          </h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  answers[currentStep] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {option.label[lang]}
              </button>
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            disabled={!answers[currentStep]}
            className="w-full mt-6"
          >
            {currentStep < surveyQuestions.length - 1 ? t('survey.next') : t('survey.submit')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **步骤 2：Commit**

```bash
git add app/src/pages/Survey.tsx
git commit -m "feat: add survey questionnaire page"
```

---

### 任务 10：球队预测页面（Prediction.tsx）

**文件：**
- 创建：`app/src/pages/Prediction.tsx`

**步骤：**

- [ ] **步骤 1：创建 Prediction.tsx**

```typescript
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/providers/trpc';
import { worldCupTeams } from '@/lib/worldcup-teams';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast, Toaster } from 'sonner';

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
    if (teams.some(t => !t)) {
      toast.error('Please select all 4 teams');
      return;
    }
    if (new Set(teams).size !== 4) {
      toast.error('Please select 4 different teams');
      return;
    }
    
    const surveyAnswers = JSON.parse(localStorage.getItem(`survey_${code}`) || '[]');
    
    submitMutation.mutate({
      code,
      surveyAnswers,
      teams: teams as [string, string, string, string],
    });
  };
  
  if (submitted) {
    return <div className="min-h-screen flex items-center justify-center">Submitting...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 px-6">
          <h2 className="text-xl font-semibold text-center mb-2">
            Select Your Top 4 Teams
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Choose 4 teams you think will reach the semi-finals
          </p>
          
          <div className="space-y-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <label className="text-sm font-medium mb-2 block">
                  Team {index + 1}
                </label>
                <Select
                  value={teams[index]}
                  onValueChange={(value) => handleTeamChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select team ${index + 1}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {worldCupTeams.map((team) => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                        disabled={teams.includes(team.id) && teams[index] !== team.id}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || teams.some(t => !t)}
            className="w-full mt-6 bg-green-600 hover:bg-green-700"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Prediction'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **步骤 2：Commit**

```bash
git add app/src/pages/Prediction.tsx
git commit -m "feat: add team prediction page with 48 team selection"
```

---

### 任务 11：提交成功页面（Success.tsx）

**文件：**
- 创建：`app/src/pages/Success.tsx`

**步骤：**

- [ ] **步骤 1：创建 Success.tsx**

```typescript
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function Success() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-12 pb-12 px-6 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Prediction Submitted!
          </h1>
          
          <p className="text-gray-500 mb-6">
            Your prediction has been recorded. Results will be announced after the World Cup.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p>Please keep your code safe.</p>
            <p className="mt-1">Winners will be contacted offline.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **步骤 2：Commit**

```bash
git add app/src/pages/Success.tsx
git commit -m "feat: add submission success page"
```

---

### 任务 12：更新注册提交 API 接收预测数据

**文件：**
- 修改：`app/api/routers/registration.ts`

**步骤：**

- [ ] **步骤 1：修改 registration.ts submit mutation**

```typescript
submit: publicQuery
  .input(
    z.object({
      code: z.string(),
      surveyAnswers: z.array(z.string()),
      teams: z.tuple([
        z.string(),
        z.string(),
        z.string(),
        z.string(),
      ]),
    })
  )
  .mutation(async ({ input }) => {
    const db = getDb();
    
    const qrList = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.code, input.code.toUpperCase()));
    
    if (qrList.length === 0) {
      throw new Error("Code not found");
    }
    
    const qr = qrList[0];
    if (qr.status === "filled") {
      throw new Error("Code already used");
    }
    
    await db.insert(nameRecords).values({
      qrCodeId: qr.id,
      surveyAnswers: JSON.stringify(input.surveyAnswers),
      team1: input.teams[0],
      team2: input.teams[1],
      team3: input.teams[2],
      team4: input.teams[3],
    });
    
    await db.update(qrCodes)
      .set({ status: "filled" })
      .where(eq(qrCodes.id, qr.id));
    
    return { success: true };
  }),
```

- [ ] **步骤 2：Commit**

```bash
git add app/api/routers/registration.ts
git commit -m "feat: extend registration submit to store survey answers and team predictions"
```

---

### 任务 13：客户管理 API

**文件：**
- 修改：`app/api/routers/qrCode.ts`

**步骤：**

- [ ] **步骤 1：在 qrCode.ts 中添加客户路由**

```typescript
// 新增到 qrCodeRouter
customers: publicQuery.query(async () => {
  const db = getDb();
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}),

createCustomer: authenticatedQuery
  .input(z.object({
    name: z.string().min(1),
    country: z.string().optional(),
    contact: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const db = getDb();
    const result = await db.insert(customers).values(input);
    return { id: Number(result[0].insertId) };
  }),

// 修改 generate 接收 customerId
generate: authenticatedQuery
  .input(
    z.object({
      count: z.number().min(1).max(1000),
      customerId: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // ... 在 insert qrCodes 时加入 customerId: input.customerId
  }),
```

- [ ] **步骤 2：Commit**

```bash
git add app/api/routers/qrCode.ts
git commit -m "feat: add customer management APIs"
```

---

### 任务 14：中奖筛选 API

**文件：**
- 修改：`app/api/routers/qrCode.ts`

**步骤：**

- [ ] **步骤 1：添加 winners 路由**

```typescript
winners: authenticatedQuery
  .input(
    z.object({
      team1: z.string(),
      team2: z.string(),
      team3: z.string(),
      team4: z.string(),
    })
  )
  .query(async ({ input }) => {
    const db = getDb();
    const actualTeams = [input.team1, input.team2, input.team3, input.team4].sort();
    
    const allRecords = await db
      .select({
        record: nameRecords,
        code: qrCodes.code,
        customerName: customers.name,
      })
      .from(nameRecords)
      .innerJoin(qrCodes, eq(nameRecords.qrCodeId, qrCodes.id))
      .leftJoin(customers, eq(qrCodes.customerId, customers.id));
    
    const winners = allRecords.filter(({ record }) => {
      const userTeams = [
        record.team1,
        record.team2,
        record.team3,
        record.team4,
      ].filter(Boolean).sort();
      
      return userTeams.join(',') === actualTeams.join(',');
    });
    
    return winners.map(w => ({
      code: w.code,
      customerName: w.customerName,
      teams: [w.record.team1, w.record.team2, w.record.team3, w.record.team4],
      surveyAnswers: w.record.surveyAnswers,
    }));
  }),
```

- [ ] **步骤 2：Commit**

```bash
git add app/api/routers/qrCode.ts
git commit -m "feat: add winner filtering by actual top 4 teams"
```

---

### 任务 15：更新 App.tsx 路由

**文件：**
- 修改：`app/src/App.tsx`

**步骤：**

- [ ] **步骤 1：添加新页面路由**

```typescript
import Survey from './pages/Survey';
import Prediction from './pages/Prediction';
import Success from './pages/Success';

// 在路由中添加：
<Route path="/survey" element={<Survey />} />
<Route path="/prediction" element={<Prediction />} />
<Route path="/success" element={<Success />} />
// 保留 /register 但重定向到 /survey 或直接移除
```

- [ ] **步骤 2：Commit**

```bash
git add app/src/App.tsx
git commit -m "feat: update routes for new survey-prediction-success flow"
```

---

### 任务 16：更新 Home.tsx 世界杯主题

**文件：**
- 修改：`app/src/pages/Home.tsx`

**步骤：**

- [ ] **步骤 1：修改 Home.tsx**

- 背景改为 `bg-gradient-to-b from-green-50 to-gray-50`
- 标题改为 "2026 FIFA World Cup Top 4 Prediction"
- 添加 LanguageSwitcher 组件
- 添加虎头电池 logo（如果可用）

- [ ] **步骤 2：Commit**

```bash
git add app/src/pages/Home.tsx
git commit -m "style: update home page with world cup theme and language switcher"
```

---

### 任务 17：更新 Admin.tsx 新增功能

**文件：**
- 修改：`app/src/pages/Admin.tsx`

**步骤：**

- [ ] **步骤 1：添加客户管理、中奖筛选、导出 CSV**

- 新增"客户管理"标签页
- 生成编码时显示客户下拉选择
- 新增"中奖筛选"标签页：4 个球队选择器 + 筛选按钮 + 结果表格 + 导出 CSV
- 二维码列表显示客户列

- [ ] **步骤 2：Commit**

```bash
git add app/src/pages/Admin.tsx
git commit -m "feat: add customer management, winner filtering, and CSV export to admin"
```

---

### 任务 18：最终测试和验证

**步骤：**

- [ ] **步骤 1：运行类型检查**

```bash
cd app
npx tsc --noEmit
```

- [ ] **步骤 2：运行构建**

```bash
npm run build
```

- [ ] **步骤 3：验证关键流程**

1. 访问首页 → 切换语言（EN/AR/FR）
2. 输入编码 → 进入问卷 → 回答问题 → 选择 4 支球队 → 提交 → 成功页
3. 管理后台登录 → 生成编码（分配客户）→ 查看列表 → 筛选中奖者 → 导出 CSV

- [ ] **步骤 4：最终 Commit**

```bash
git add .
git commit -m "release: world cup prediction platform v1.0"
```

---

## 自检

**1. 规格覆盖度检查：**

| 规格需求 | 实现任务 |
|---------|---------|
| JWT 认证替代硬编码密码 | 任务 2, 3, 4, 5 |
| customers 表 + 编码分配 | 任务 1, 13 |
| name_records 扩展字段 | 任务 1, 12 |
| 调研问卷页面（4 题） | 任务 6, 9 |
| 球队预测页面（48 队） | 任务 6, 10 |
| 多语言 EN/AR/FR | 任务 7, 8, 16 |
| 世界杯轻度主题 | 任务 16 |
| 中奖筛选（4 支全对） | 任务 14 |
| 导出 CSV | 任务 17 |
| 提交成功页 | 任务 11 |
| GitHub 发布准备 | 全部（无敏感信息） |

✅ 无遗漏

**2. 占位符扫描：**

- 无 "TODO"、"待定" 等占位符
- 球队列表需要补充完整 48 支球队（当前示例只列了 3 支，实际实现时需完整）
- 调研问题需要补充完整 4 个问题（当前只列了 1 道）

**3. 类型一致性：**

- `surveyAnswers` 在 schema 中为 JSON，API 中使用 `z.array(z.string())`，提交时 `JSON.stringify()` ✅
- `teams` 在 API 中为 tuple `[string, string, string, string]`，数据库中为 team1-4 ✅
- JWT token 存储在 localStorage，trpc header 中读取 ✅

---

## 执行选项

**计划已完成。**

**两种执行方式：**

**1. 子代理驱动（推荐）** — 每个任务调度新子代理，任务间审查，快速迭代

**2. 内联执行** — 在当前会话中批量执行任务，设有检查点供审查

**请选择执行方式，或指定从哪个任务开始执行。**
