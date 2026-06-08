import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { nameRecords, qrCodes, scanRecords } from "@db/schema";

const submitInput = z
  .object({
    code: z.string(),
    names: z.tuple([z.string(), z.string(), z.string(), z.string()]).optional(),
    surveyAnswers: z.array(z.string()).optional(),
    teams: z.tuple([z.string(), z.string(), z.string(), z.string()]).optional(),
    responderName: z.string().optional(),
    responderContact: z.string().optional(),
    responderCountry: z.string().optional(),
  })
  .refine((data) => data.names || data.teams, {
    message: "Either names or teams must be provided",
  });

export const registrationRouter = createRouter({
  verifyCode: publicQuery
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const qrList = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.code, input.code.toUpperCase()));

      if (qrList.length === 0) {
        return { valid: false, reason: "not_found" as const };
      }

      const qr = qrList[0];
      const canScan = qr.currentScans < qr.maxScans;

      if (!canScan) {
        return { valid: false, reason: "used" as const };
      }

      return {
        valid: true,
        code: qr.code,
        maxScans: qr.maxScans,
        currentScans: qr.currentScans,
        canScan,
      };
    }),

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
        maxScans: qr.maxScans,
        currentScans: qr.currentScans,
        canScan: qr.currentScans < qr.maxScans,
        createdAt: qr.createdAt,
      };
    }),

  submit: publicQuery.input(submitInput).mutation(async ({ input }) => {
    const db = getDb();
    const qrList = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.code, input.code.toUpperCase()));

    if (qrList.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Code not found" });
    }

    const qr = qrList[0];
    if (qr.currentScans >= qr.maxScans) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This QR code has reached its maximum scan limit",
      });
    }

    const serializedSurveyAnswers = input.surveyAnswers
      ? JSON.stringify(input.surveyAnswers)
      : null;

    await db.insert(nameRecords).values({
      qrCodeId: qr.id,
      name1: input.names?.[0] ?? null,
      name2: input.names?.[1] ?? null,
      name3: input.names?.[2] ?? null,
      name4: input.names?.[3] ?? null,
      surveyAnswers: serializedSurveyAnswers,
      team1: input.teams?.[0] ?? null,
      team2: input.teams?.[1] ?? null,
      team3: input.teams?.[2] ?? null,
      team4: input.teams?.[3] ?? null,
    });

    await db.insert(scanRecords).values({
      qrCodeId: qr.id,
      name: input.responderName?.trim() || "Anonymous",
      contact: input.responderContact?.trim() || "Not provided",
      country: input.responderCountry?.trim() || null,
      surveyAnswers: serializedSurveyAnswers,
      team1: input.teams?.[0] ?? null,
      team2: input.teams?.[1] ?? null,
      team3: input.teams?.[2] ?? null,
      team4: input.teams?.[3] ?? null,
    });

    const nextScanCount = qr.currentScans + 1;
    await db
      .update(qrCodes)
      .set({
        currentScans: nextScanCount,
        status: nextScanCount >= qr.maxScans ? "filled" : "unbound",
      })
      .where(eq(qrCodes.id, qr.id));

    return { success: true };
  }),
});
