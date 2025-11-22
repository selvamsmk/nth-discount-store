import z from "zod";
import { router, protectedProcedure } from "../index";
import { items } from "@nth-discount-store/db/schema/items";
import { eq } from "drizzle-orm";
import { db } from "@nth-discount-store/db";

const ItemOutput = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().nullable().optional(),
	price: z.number(),
	sku: z.string().nullable().optional(),
	createdAt: z.string(),
})

export const itemsRouter = router({
	getAll: protectedProcedure
		.meta({ openapi: { method: 'GET', path: '/items' } })
		.output(z.array(ItemOutput))
		.query(async () => {
			const rows = await db.select().from(items);
			// normalize createdAt to ISO strings
			return rows.map((r: any) => ({ ...r, createdAt: new Date((r.createdAt as unknown as number) || 0).toISOString() }))
		}),

	delete: protectedProcedure
		.meta({ openapi: { method: 'DELETE', path: '/items/{id}' } })
		.input(z.object({ id: z.number() }))
		.output(z.object({ success: z.boolean(), deletedCount: z.number().optional() }))
		.mutation(async ({ input }) => {
			const res = await db.delete(items).where(eq(items.id, input.id));
			return { success: true, deletedCount: (res as any)?.rows?.length ?? 0 };
		}),
});
