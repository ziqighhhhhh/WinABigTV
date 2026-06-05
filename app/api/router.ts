import { createRouter, publicQuery } from "./middleware";
import { qrCodeRouter } from "./routers/qrCode";
import { registrationRouter } from "./routers/registration";
import { adminRouter } from "./routers/admin";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  qrCode: qrCodeRouter,
  registration: registrationRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
