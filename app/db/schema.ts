import {
  mysqlTable,
  serial,
  varchar,
  timestamp,
  mysqlEnum,
  bigint,
} from "drizzle-orm/mysql-core";

// 二维码表（编码表）
export const qrCodes = mysqlTable("qr_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  uuid: varchar("uuid", { length: 64 }).notNull().unique(),
  url: varchar("url", { length: 512 }).notNull(),
  status: mysqlEnum("status", ["unbound", "filled"]).notNull().default("unbound"),
  category: varchar("category", { length: 100 }).notNull().default("default"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 名字记录表
export const nameRecords = mysqlTable("name_records", {
  id: serial("id").primaryKey(),
  qrCodeId: bigint("qr_code_id", { mode: "number", unsigned: true }).notNull(),
  name1: varchar("name1", { length: 100 }),
  name2: varchar("name2", { length: 100 }),
  name3: varchar("name3", { length: 100 }),
  name4: varchar("name4", { length: 100 }),
  lastModified: timestamp("last_modified").notNull().defaultNow().onUpdateNow(),
});

// 报名分类表
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
