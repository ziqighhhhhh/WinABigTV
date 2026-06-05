import {
  mysqlTable,
  serial,
  varchar,
  timestamp,
  mysqlEnum,
  bigint,
  json,
} from "drizzle-orm/mysql-core";

// 客户表（当地分发者）
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  country: varchar("country", { length: 50 }),
  contact: varchar("contact", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 管理员表
export const admins = mysqlTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 二维码表（编码表）
export const qrCodes = mysqlTable("qr_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  uuid: varchar("uuid", { length: 64 }).notNull().unique(),
  url: varchar("url", { length: 512 }).notNull(),
  status: mysqlEnum("status", ["unbound", "filled"]).notNull().default("unbound"),
  category: varchar("category", { length: 100 }).notNull().default("default"),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 名字记录表（预测记录）
export const nameRecords = mysqlTable("name_records", {
  id: serial("id").primaryKey(),
  qrCodeId: bigint("qr_code_id", { mode: "number", unsigned: true }).notNull(),
  name1: varchar("name1", { length: 100 }),
  name2: varchar("name2", { length: 100 }),
  name3: varchar("name3", { length: 100 }),
  name4: varchar("name4", { length: 100 }),
  surveyAnswers: json("survey_answers"),
  team1: varchar("team1", { length: 50 }),
  team2: varchar("team2", { length: 50 }),
  team3: varchar("team3", { length: 50 }),
  team4: varchar("team4", { length: 50 }),
  lastModified: timestamp("last_modified").notNull().defaultNow().onUpdateNow(),
});

// 报名分类表
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
