import z from 'zod'
import { router, publicProcedure, protectedProcedure } from '../index'
import { settings } from '@nth-discount-store/db/schema/settings'
import { db } from '@nth-discount-store/db';

export const settingsRouter = router({
  // Fetch the Nth-order value. Returns { nValue: number | null }
  getNth: publicProcedure.query(async () => {
    const rows = await db.select().from(settings).limit(1)
    const row = rows[0]
    // Prefer the explicit integer column `n_value` (mapped to `nValue`). If it's
    // missing (older rows), fall back to parsing the textual `value` column.
    if (row) {
      if (row.nValue) return { nValue: row.nValue }
      const parsed = row.value ? parseInt(row.value, 10) : 2
      return { nValue: Number.isFinite(parsed) ? parsed : null }
    }
    return { nValue: null }
  }),

  // Update the Nth-order value. Admin-only.
  updateNth: protectedProcedure
    .input(z.object({ nValue: z.number().int().min(1) }))
    .mutation(async ({ input }) => {
      const key = 'n_value';
      const existingRows = await db.select().from(settings).limit(1)
      const existing = existingRows[0]
      if (existing) {
        await db.update(settings).set({ value: String(input.nValue), nValue: input.nValue })
      } else {
        await db.insert(settings).values({ key, value: String(input.nValue), nValue: input.nValue })
      }
      return { success: true }
    }),
})

export default settingsRouter
