import { router, protectedProcedure } from '../index'
import { db } from '@nth-discount-store/db'
import { orders, orderItems } from '@nth-discount-store/db/schema/orders'
import { carts, cartItems } from '@nth-discount-store/db/schema/cart'
import { items } from '@nth-discount-store/db/schema/items'
import { coupons } from '@nth-discount-store/db/schema/coupons'
import { settings } from '@nth-discount-store/db/schema/settings'
import { eq, inArray, desc } from 'drizzle-orm'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const ordersRouter = router({
  // Create an order from the current user's cart and clear the cart.
  // Accepts optional { discountCode } to apply a single-use coupon.
  create: protectedProcedure
    .input(z.object({ discountCode: z.string().optional() }).optional())
    .mutation(async ({ input, ctx }) => {
    const userId = ctx.session.user.id

    // Wrap the whole flow in a transaction to reduce race conditions
    return await db.transaction(async (tx) => {
      // find cart
      const cartRows = await tx.select().from(carts).where(eq(carts.userId, String(userId))).limit(1)
      const cart = cartRows[0]
      if (!cart) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' })

      const cartItemRows = await tx.select().from(cartItems).where(eq(cartItems.cartId, cart.id))
      if (!cartItemRows || cartItemRows.length === 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' })

      // fetch item prices
      const itemIds = cartItemRows.map((c) => c.itemId)
      const itemRows = await tx.select().from(items).where(itemIds.length ? inArray(items.id, itemIds) : eq(items.id, -1))
      const priceMap = new Map<number, number>()
      for (const it of itemRows) priceMap.set(it.id as number, it.price as number)

      let totalCents = 0
      for (const ci of cartItemRows) {
        const price = priceMap.get(ci.itemId) ?? 0
        totalCents += (price * (ci.quantity ?? 1))
      }

      let discountCents = 0
      let appliedCoupon: any = null

      // If a discount code is provided, validate it and compute discountCents
      if (input?.discountCode) {
        const code = input.discountCode.trim()
        const crows = await tx.select().from(coupons).where(eq(coupons.code, code)).limit(1)
        const crow = crows[0]
        if (!crow) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid discount code' })
        if (crow.used) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Discount code already used' })
        if (crow.invalidatedAt) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Discount code invalidated' })
        // ensure coupon belongs to this user (ownerUserId) if set
        if (crow.ownerUserId && String(crow.ownerUserId) !== String(userId)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Discount code does not belong to you' })
        }

        // compute discount
        discountCents = Math.round((totalCents * (crow.percent ?? 0)) / 100)
        appliedCoupon = crow
      }

      // insert order with discountCents
      const inserted = await tx.insert(orders).values({ userId: String(userId), totalCents, discountCents, createdAt: new Date() }).returning({ id: orders.id })
      if (!inserted || inserted.length === 0) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create order' })
      const orderId = inserted[0]!.id

      // insert order items
      for (const ci of cartItemRows) {
        const price = priceMap.get(ci.itemId) ?? 0
        await tx.insert(orderItems).values({ orderId, itemId: ci.itemId, price, quantity: ci.quantity })
      }

      // If a coupon was applied, mark it redeemed (single-use)
      if (appliedCoupon) {
        await tx.update(coupons).set({ used: true, redeemedOrderId: orderId }).where(eq(coupons.id, appliedCoupon.id))
      }

      // clear cart items and cart
      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id))
      await tx.delete(carts).where(eq(carts.id, cart.id))

      // Check settings for nth-order coupon generation
      const srows = await tx.select().from(settings).where(eq(settings.key, 'n_value')).limit(1)
      const srow = srows[0]
      let generatedCoupon: any = null
      if (srow) {
        const nVal = typeof srow.nValue === 'number' ? srow.nValue : (srow.value ? parseInt(srow.value, 10) : NaN)
        if (Number.isFinite(nVal) && nVal > 0) {
          // count user's orders (including this one)
          const userOrders = await tx.select().from(orders).where(eq(orders.userId, String(userId)))
          const orderCount = userOrders.length
          if (orderCount > 0 && orderCount % nVal === 0) {
            // generate a single-use 10% coupon for the user
            const makeCode = () => Math.random().toString(36).slice(2, 10).toUpperCase()
            const code = makeCode()
            const newCoupon = await tx.insert(coupons).values({ code, ownerUserId: String(userId), percent: 10, used: false, createdAt: new Date() }).returning({ id: coupons.id, code: coupons.code, percent: coupons.percent, createdAt: coupons.createdAt })
            generatedCoupon = newCoupon?.[0] ?? null
          }
        }
      }

      // return created order with items and any generated coupon
      const oi = await tx
        .select({ id: orderItems.id, itemId: orderItems.itemId, price: orderItems.price, quantity: orderItems.quantity, name: items.name })
        .from(orderItems)
        .leftJoin(items, eq(orderItems.itemId, items.id))
        .where(eq(orderItems.orderId, orderId))

      return { id: orderId, userId: String(userId), totalCents, discountCents, createdAt: new Date(), items: oi, generatedCoupon }
    })
  }),

  // Return orders for current user with their items
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const orderRows = await db.select().from(orders).where(eq(orders.userId, String(userId))).orderBy(desc(orders.id))
    const results = [];
    for (const o of orderRows) {
      const oi = await db
        .select({ id: orderItems.id, itemId: orderItems.itemId, price: orderItems.price, quantity: orderItems.quantity, name: items.name })
        .from(orderItems)
        .leftJoin(items, eq(orderItems.itemId, items.id))
        .where(eq(orderItems.orderId, o.id))
      results.push({ ...o, items: oi })
    }
    return results
  }),
})

export default ordersRouter
