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

  // 提交预测记录（编码使用后立即标记为filled，不可再次进入）
  submit: publicQuery
    .input(
      z
        .object({
          code: z.string(),
          names: z
            .tuple([z.string(), z.string(), z.string(), z.string()])
            .optional(),
          surveyAnswers: z.array(z.string()).optional(),
          teams: z
            .tuple([z.string(), z.string(), z.string(), z.string()])
            .optional(),
        })
        .refine((data) => data.names || data.teams, {
          message: "Either names or teams must be provided",
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

      // 创建预测记录
      await db.insert(nameRecords).values({
        qrCodeId: qr.id,
        name1: input.names?.[0] ?? null,
        name2: input.names?.[1] ?? null,
        name3: input.names?.[2] ?? null,
        name4: input.names?.[3] ?? null,
        surveyAnswers: input.surveyAnswers
          ? JSON.stringify(input.surveyAnswers)
          : null,
        team1: input.teams?.[0] ?? null,
        team2: input.teams?.[1] ?? null,
        team3: input.teams?.[2] ?? null,
        team4: input.teams?.[3] ?? null,
      });

      // 标记编码为已使用
      await db
        .update(qrCodes)
        .set({ status: "filled" })
        .where(eq(qrCodes.id, qr.id));

      return { success: true };
    }),
});
