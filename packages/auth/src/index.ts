import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, UserTable } from "@nth-discount-store/db";
import * as schema from "@nth-discount-store/db/schema/auth";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

export async function isUserAdmin(userId: string) {
  const rows = await db
    .select({ admin: UserTable.admin })
    .from(UserTable)
    .where(eq(UserTable.id, String(userId)))
    .limit(1);
  const row = rows[0];
  return !!(row?.admin ?? false);
}

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: schema,
	}),
	user: {
       additionalFields: {
          admin: {
              type: "boolean",
              input: false
            } 
        }
    },
	plugins: [
		customSession(async ({ user, session }) => {
			try {
				// call the isUserAdmin from userRouter
				const isAdmin = await isUserAdmin(user.id)
				return {
					user: {
						...user,
						admin: isAdmin,
					},
					session,
				};
			} catch (err) {
				// on error return original values
				return { user, session };
			}
		}),
	],
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});
