import { getDb } from "../api/queries/connection";
import { categories, admins } from "./schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "../api/lib/auth";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // 插入默认分类
  await db.insert(categories).values([
    { name: "全部" },
    { name: "活动报名" },
    { name: "会议签到" },
    { name: "课程注册" },
  ]).onDuplicateKeyUpdate({ set: { name: sql`name` } });

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
  console.log("Done.");
  process.exit(0); // close MySQL connection pool
}

seed();
