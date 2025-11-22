import z from 'zod'
import { router, protectedProcedure } from '../index'
import { db } from '@nth-discount-store/db'
import { orders, orderItems } from '@nth-discount-store/db/schema/orders'
import { coupons } from '@nth-discount-store/db/schema/coupons'
export const adminRouter = router({
  // Returns basic sales metrics for admin dashboard
  getMetrics: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/admin/metrics' } })
    .output(z.object({ itemsSold: z.number(), totalRevenue: z.number(), totalDiscounts: z.number(), coupons: z.array(z.object({ code: z.string(), percent: z.number(), used: z.boolean(), redeemedOrderId: z.number().nullable().optional() })) }))
    .query(async ({ ctx }) => {
  // require admin (session.user.admin may be added by auth plugin)
  if (!(ctx.session.user as any)?.admin) throw new Error('Unauthorized')

    // total items sold (sum of quantities in order_items)
    const itemsRows = await db.select({ quantity: orderItems.quantity }).from(orderItems)
    const itemsSold = itemsRows.reduce((s, r) => s + (r.quantity ?? 0), 0)

    // total revenue (sum of order totalCents)
    const orderRows = await db.select({ total: orders.totalCents, discount: orders.discountCents }).from(orders)
    const totalRevenue = orderRows.reduce((s, r) => s + (r.total ?? 0), 0)
    const totalDiscounts = orderRows.reduce((s, r) => s + (r.discount ?? 0), 0)

    // list of coupons (code, percent, used, redeemedOrderId)
    const couponRows = await db.select().from(coupons)

    // build a small list of coupons and compute total discount amount applied (from redeemed coupons)
    const couponsList = couponRows.map((c) => ({ code: c.code, percent: c.percent, used: !!c.used, redeemedOrderId: c.redeemedOrderId }))

    return {
      itemsSold,
      totalRevenue,
      totalDiscounts,
      coupons: couponsList,
    }
  }),
})

export default adminRouter
