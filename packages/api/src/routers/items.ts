import z from "zod";
import { router, publicProcedure, protectedProcedure } from "../index";
import { items } from "@nth-discount-store/db/schema/items";
import { eq } from "drizzle-orm";
import { db } from "@nth-discount-store/db";

export const itemsRouter = router({
	getAll: protectedProcedure.query(async () => {
		return await db.select().from(items);
	}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			return await db.delete(items).where(eq(items.id, input.id));
		}),
});
