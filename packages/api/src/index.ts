import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

// Re-export DB types for consumers so other packages can import types from @nth-discount-store/api
// Import the types directly from the DB package schema path to avoid relying on DB package root re-exports
import type { Item, NewItem } from "@nth-discount-store/db";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export type { Item, NewItem };

// API-level serializable types (trpc/JSON). Drizzle's Item may use Date for timestamps;
// API responses are serialized to strings, so expose a DTO type that matches the runtime shape.
export type ApiItem = Omit<Item, 'createdAt'> & { createdAt: string };
