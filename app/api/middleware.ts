import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { verifyToken } from "./lib/auth";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// 需要认证的 procedure
export const authenticatedQuery = t.procedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing token' });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }

  return next({
    ctx: {
      ...ctx,
      user: payload,
    },
  });
});
