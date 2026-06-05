# 虎头电池世界杯前四强预测活动平台设计文档

> 设计日期：2025-06-05
> 方案：方案A（最小改动方案）
> 目标：支持虎头电池在摩洛哥、尼日利亚、伊拉克、阿尔及利亚的世界杯前四强预测活动

---

## 项目概述

将现有编码登记系统升级为世界杯前四强预测活动平台。用户通过编码/QR码进入，完成虎头电池市场调研问卷，选择4支预测球队，提交后参与世界杯前四强预测活动。

## 目标国家

- 摩洛哥（阿拉伯语、法语）
- 尼日利亚（英语）
- 伊拉克（阿拉伯语、英语）
- 阿尔及利亚（阿拉伯语、法语）

## 核心功能

### 1. 前端用户流程

```
首页输入编码 → 调研问卷（4题）→ 球队预测（4支）→ 提交成功
```

### 2. 多语言支持

- 前台：英语（默认）+ 阿拉伯语 + 法语，手动切换
- 后台：中文
- 阿拉伯语支持RTL布局

### 3. 安全性

- JWT认证替代硬编码密码
- bcrypt密码哈希
- Admin API受保护

### 4. 客户管理

- 生成编码时分配给特定客户（当地分发者）
- 追踪编码分发情况

### 5. 中奖筛选

- 后台手动输入实际前四强球队
- 系统自动筛选预测完全匹配（4支全对）的中奖者
- 支持导出CSV

## 数据模型

### 新增表

**customers**
- `id`: 主键
- `name`: 客户名称
- `country`: 国家
- `contact`: 联系人
- `createdAt`: 创建时间

**admins**
- `id`: 主键
- `username`: 用户名
- `passwordHash`: bcrypt哈希密码
- `createdAt`: 创建时间

### 扩展表

**qr_codes** 新增：
- `customerId`: 分配的客户ID

**name_records** 新增：
- `surveyAnswers`: JSON格式调研答案
- `team1-4`: 预测的4支球队

## 前端页面

1. **Home.tsx** - 首页，输入编码
2. **Survey.tsx** - 调研问卷（4道单选题）
3. **Prediction.tsx** - 球队预测（48支球队中选择4支）
4. **Success.tsx** - 提交成功
5. **AdminLogin.tsx** - 管理员登录（JWT）
6. **Admin.tsx** - 管理后台（客户管理、编码生成、中奖筛选、导出CSV）

## 世界杯主题

- 轻度主题化：淡绿渐变背景（草坪感）
- 足球元素点缀
- 虎头电池logo
- 保持简洁风格

## 硬编码配置

1. **球队列表** (`app/src/lib/worldcup-teams.ts`)：48支2026世界杯参赛队
2. **调研问题** (`app/src/lib/survey-questions.ts`)：4道题，英/阿/法三语

## API变更

### 新增路由
- `admin.login` - 管理员登录，返回JWT
- `qrCode.customers` - 获取客户列表
- `qrCode.createCustomer` - 创建客户
- `qrCode.winners` - 筛选中奖者

### 修改路由
- `registration.submit` - 扩展接收surveyAnswers和teams
- `qrCode.generate` - 扩展接收customerId
- 保护admin路由：使用authenticatedQuery

## 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- tRPC + Drizzle ORM + MySQL
- i18next（多语言）
- jsonwebtoken + bcryptjs（认证）

## GitHub发布准备

- 移除硬编码密码
- 使用环境变量配置敏感信息
- 提供部署文档
- 无敏感信息泄露
