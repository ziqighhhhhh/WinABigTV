import { getDb } from "../api/queries/connection";
import { categories } from "./schema";
import { sql } from "drizzle-orm";

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

  console.log("Done.");
  process.exit(0); // close MySQL connection pool
}

seed();
