import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { users, accounts, sessions } from "../db/schema";
import db from "../db/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      account: accounts,
      session: sessions,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
});
