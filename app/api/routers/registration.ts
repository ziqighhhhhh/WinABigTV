import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { qrCodes, nameRecords } from "@db/schema";
import { eq } from "drizzle-orm";

export const registrationRouter = createRouter({
  // 根据编码验证二维码是否存在及是否已使用
  verifyCode: publicQuery
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const qrList = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.code, input.code.toUpperCase()));

      if (qrList.length === 0) {
        return { valid: false, reason: "not_found" };
      }

      const qr = qrList[0];

      if (qr.status === "filled") {
        return { valid: false, reason: "used" };
      }

      return { valid: true, code: qr.code };
    }),

  // 根据编码获取详情（仅未使用时可用）
  getDetails: publicQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();

      const qrList = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.code, input.code.toUpperCase()));

      if (qrList.length === 0) {
        return null;
      }

      const qr = qrList[0];

      return {
        id: qr.id,
        code: qr.code,
        status: qr.status,
        category: qr.category,
        createdAt: qr.createdAt,
      };
    }),

  // 提交名字记录（编码使用后立即标记为filled，不可再次进入）
  submit: publicQuery
    .input(
      z.object({
        code: z.string(),
        names: z.tuple([
          z.string().min(1).max(100),
          z.string().min(1).max(100),
          z.string().min(1).max(100),
          z.string().min(1).max(100),
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
        throw new Error("编码不存在");
      }

      const qr = qrList[0];

      if (qr.status === "filled") {
        throw new Error("该编码已被使用");
      }

      // 创建名字记录
      await db.insert(nameRecords).values({
        qrCodeId: qr.id,
        name1: input.names[0],
        name2: input.names[1],
        name3: input.names[2],
        name4: input.names[3],
      });

      // 标记编码为已使用
      await db
        .update(qrCodes)
        .set({ status: "filled" })
        .where(eq(qrCodes.id, qr.id));

      return { success: true };
    }),
});
