import { z } from 'zod'
import { router, protectedProcedure } from '../index'
import { db } from '@nth-discount-store/db'
import { coupons } from '@nth-discount-store/db/schema/coupons'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const couponsRouter = router({
  // Validate a coupon code for the current user and return its percent if valid.
  validate: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const code = input.code.trim()
      const rows = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1)
      const c = rows[0]
      if (!c) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid coupon code' })
      if (c.used) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Coupon already used' })
      if (c.invalidatedAt) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Coupon invalidated' })
      // if coupon has ownerUserId, ensure it belongs to the requester
      if (c.ownerUserId && String(c.ownerUserId) !== String(ctx.session.user.id)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Coupon does not belong to you' })
      }
      return { percent: c.percent }
    }),
})

export default couponsRouter
