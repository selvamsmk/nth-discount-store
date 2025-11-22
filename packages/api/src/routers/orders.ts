import { router, protectedProcedure } from '../index'
import { db } from '@nth-discount-store/db'
import { orders, orderItems } from '@nth-discount-store/db/schema/orders'
import { carts, cartItems } from '@nth-discount-store/db/schema/cart'
import { items } from '@nth-discount-store/db/schema/items'
import { eq, inArray, desc } from 'drizzle-orm'

export const ordersRouter = router({
  // Create an order from the current user's cart and clear the cart.
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // find cart
    const cartRows = await db.select().from(carts).where(eq(carts.userId, String(userId))).limit(1)
    const cart = cartRows[0]
    if (!cart) throw new Error('Cart is empty')

    const cartItemRows = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id))
    if (!cartItemRows || cartItemRows.length === 0) throw new Error('Cart is empty')

    // fetch item prices
    const itemIds = cartItemRows.map((c) => c.itemId)
    const itemRows = await db.select().from(items).where(itemIds.length ? inArray(items.id, itemIds) : eq(items.id, -1))
    const priceMap = new Map<number, number>()
    for (const it of itemRows) priceMap.set(it.id as number, it.price as number)

    let totalCents = 0
    for (const ci of cartItemRows) {
      const price = priceMap.get(ci.itemId) ?? 0
      totalCents += (price * (ci.quantity ?? 1))
    }

    const discountCents = 0

    // insert order
    const inserted = await db.insert(orders).values({ userId: String(userId), totalCents, discountCents, createdAt: new Date() }).returning({ id: orders.id })
    if (!inserted || inserted.length === 0) throw new Error('Failed to create order')
    const orderId = inserted[0]!.id

    // insert order items
    for (const ci of cartItemRows) {
      const price = priceMap.get(ci.itemId) ?? 0
      await db.insert(orderItems).values({ orderId, itemId: ci.itemId, price, quantity: ci.quantity })
    }

    // clear cart items and cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id))
    await db.delete(carts).where(eq(carts.id, cart.id))

    // return created order with items
    const oi = await db
      .select({ id: orderItems.id, itemId: orderItems.itemId, price: orderItems.price, quantity: orderItems.quantity, name: items.name })
      .from(orderItems)
      .leftJoin(items, eq(orderItems.itemId, items.id))
      .where(eq(orderItems.orderId, orderId))

    return { id: orderId, userId: String(userId), totalCents, discountCents, createdAt: new Date(), items: oi }
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
