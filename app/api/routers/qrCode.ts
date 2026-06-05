import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { qrCodes, categories, nameRecords } from "@db/schema";
import { eq, desc, like, and, count } from "drizzle-orm";

function generateUUID() {
  return crypto.randomUUID().replace(/-/g, "");
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const qrCodeRouter = createRouter({
  generate: publicQuery
    .input(
      z.object({
        count: z.number().min(1).max(1000),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const category = input.category || "default";
      const generated: { id: number; code: string; url: string }[] = [];

      for (let i = 0; i < input.count; i++) {
        let code = generateCode();
        let uuid = generateUUID();
        let url = `/register?code=${code}`;

        // 确保编码唯一
        let exists = await db.select().from(qrCodes).where(eq(qrCodes.code, code));
        while (exists.length > 0) {
          code = generateCode();
          url = `/register?code=${code}`;
          exists = await db.select().from(qrCodes).where(eq(qrCodes.code, code));
        }

        const result = await db.insert(qrCodes).values({
          code,
          uuid,
          url,
          category,
        });
        generated.push({
          id: Number(result[0].insertId),
          code,
          url,
        });
      }

      return {
        generatedCodes: generated.map((g) => g.code),
        count: generated.length,
      };
    }),

  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        category: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit, category, status, search } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (category && category !== "all") {
        conditions.push(eq(qrCodes.category, category));
      }
      if (status && status !== "all") {
        conditions.push(eq(qrCodes.status, status as "unbound" | "filled"));
      }
      if (search) {
        conditions.push(like(qrCodes.code, `%${search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(qrCodes)
        .where(whereClause)
        .orderBy(desc(qrCodes.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ value: count() })
        .from(qrCodes)
        .where(whereClause);

      const total = totalResult[0]?.value || 0;

      return { items, total };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(qrCodes).where(eq(qrCodes.id, input.id));
      return { success: true };
    }),

  categories: publicQuery.query(async () => {
    const db = getDb();
    const cats = await db.select().from(categories).orderBy(desc(categories.createdAt));
    return cats;
  }),

  getDetail: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const qrList = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.id, input.id));

      if (qrList.length === 0) return null;

      const qr = qrList[0];

      const records = await db
        .select()
        .from(nameRecords)
        .where(eq(nameRecords.qrCodeId, qr.id));

      const record = records.length > 0 ? records[0] : null;

      return {
        ...qr,
        names: record
          ? {
              name1: record.name1,
              name2: record.name2,
              name3: record.name3,
              name4: record.name4,
              lastModified: record.lastModified,
            }
          : null,
      };
    }),

  createCategory: publicQuery
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      try {
        await db.insert(categories).values({ name: input.name });
        return { success: true };
      } catch {
        return { success: false, error: "分类已存在" };
      }
    }),
});
