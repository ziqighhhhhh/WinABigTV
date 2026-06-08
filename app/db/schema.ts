import {
  sqliteTable,
  integer,
  text,
} from "drizzle-orm/sqlite-core";

// 客户表（当地分发者）
export const customers = sqliteTable("customers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull(),
  country: text("country", { length: 50 }),
  contact: text("contact", { length: 100 }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 管理员表
export const admins = sqliteTable("admins", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash", { length: 256 }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 二维码表（编码表）
export const qrCodes = sqliteTable("qr_codes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  code: text("code", { length: 20 }).notNull().unique(),
  uuid: text("uuid", { length: 64 }).notNull().unique(),
  url: text("url", { length: 512 }).notNull(),
  status: text("status", { length: 20 }).notNull().default("unbound"),
  category: text("category", { length: 100 }).notNull().default("default"),
  customerId: integer("customer_id", { mode: "number" }),
  maxScans: integer("max_scans", { mode: "number" }).notNull().default(1),
  currentScans: integer("current_scans", { mode: "number" }).notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 名字记录表（预测记录）
export const nameRecords = sqliteTable("name_records", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  qrCodeId: integer("qr_code_id", { mode: "number" }).notNull(),
  name1: text("name1", { length: 100 }),
  name2: text("name2", { length: 100 }),
  name3: text("name3", { length: 100 }),
  name4: text("name4", { length: 100 }),
  surveyAnswers: text("survey_answers"),
  team1: text("team1", { length: 50 }),
  team2: text("team2", { length: 50 }),
  team3: text("team3", { length: 50 }),
  team4: text("team4", { length: 50 }),
  lastModified: integer("last_modified", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 报名分类表
export const categories = sqliteTable("categories", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const scanRecords = sqliteTable("scan_records", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  qrCodeId: integer("qr_code_id", { mode: "number" }).notNull(),
  name: text("name", { length: 100 }).notNull(),
  contact: text("contact", { length: 200 }).notNull(),
  country: text("country", { length: 50 }),
  surveyAnswers: text("survey_answers"),
  team1: text("team1", { length: 50 }),
  team2: text("team2", { length: 50 }),
  team3: text("team3", { length: 50 }),
  team4: text("team4", { length: 50 }),
  scannedAt: integer("scanned_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
