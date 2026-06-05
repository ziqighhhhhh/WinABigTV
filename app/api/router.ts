import { createRouter, publicQuery } from "./middleware";
import { qrCodeRouter } from "./routers/qrCode";
import { registrationRouter } from "./routers/registration";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  qrCode: qrCodeRouter,
  registration: registrationRouter,
});

export type AppRouter = typeof appRouter;
