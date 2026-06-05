import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { admins } from "@db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken } from "../lib/auth";

export const adminRouter = createRouter({
  login: publicQuery
    .input(z.object({
      username: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const users = await db.select().from(admins).where(eq(admins.username, input.username));

      if (users.length === 0) {
        throw new Error("Invalid credentials");
      }

      const user = users[0];
      if (!verifyPassword(input.password, user.passwordHash)) {
        throw new Error("Invalid credentials");
      }

      const token = signToken({ userId: user.id, username: user.username });
      return { token, username: user.username };
    }),
});
