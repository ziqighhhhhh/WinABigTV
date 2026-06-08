import { relations } from "drizzle-orm";
import { customers, nameRecords, qrCodes, scanRecords } from "./schema";

export const customersRelations = relations(customers, ({ many }) => ({
  qrCodes: many(qrCodes),
}));

export const qrCodesRelations = relations(qrCodes, ({ many, one }) => ({
  nameRecords: many(nameRecords),
  scanRecords: many(scanRecords),
  customer: one(customers, {
    fields: [qrCodes.customerId],
    references: [customers.id],
  }),
}));

export const nameRecordsRelations = relations(nameRecords, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [nameRecords.qrCodeId],
    references: [qrCodes.id],
  }),
}));

export const scanRecordsRelations = relations(scanRecords, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [scanRecords.qrCodeId],
    references: [qrCodes.id],
  }),
}));
