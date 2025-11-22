import z from 'zod'
import { router, protectedProcedure } from '../index'
import { carts, cartItems } from '@nth-discount-store/db/schema/cart'
import { items } from '@nth-discount-store/db/schema/items'
import { eq, and } from 'drizzle-orm'
import { db } from '@nth-discount-store/db'

export const cartRouter = router({
  fetchItemsInCart: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/cart/items' } })
    .output(z.array(
      z.object({
        cartItemId: z.number(),
        itemId: z.number(),
        name: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        price: z.number().nullable().optional(),
        sku: z.string().nullable().optional(),
        quantity: z.number().nullable().optional(),
        addedAt: z.string().nullable().optional(),
      })
    ))
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id
      const cartRows = await db.select().from(carts).where(eq(carts.userId, String(userId))).limit(1)
      const cart = cartRows[0]
      if (!cart) return []

      const rows = await db
        .select({
          cartItemId: cartItems.id,
          itemId: items.id,
          name: items.name,
          description: items.description,
          price: items.price,
          sku: items.sku,
          quantity: cartItems.quantity,
          addedAt: cartItems.addedAt,
        })
        .from(cartItems)
        .leftJoin(items, eq(cartItems.itemId, items.id))
        .where(eq(cartItems.cartId, cart.id))

      return rows.map((r: any) => ({ ...r, addedAt: r.addedAt ? new Date(r.addedAt as unknown as number).toISOString() : null }))
    }),

  addToCart: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/cart/add' } })
    .input(z.object({ itemId: z.number(), quantity: z.number().optional() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const qty = input.quantity ?? 1
      const userId = ctx.session.user.id

      // find or create cart for user
      let cartRows = await db.select().from(carts).where(eq(carts.userId, String(userId))).limit(1)
      let cart = cartRows[0]
      if (!cart) {
        await db.insert(carts).values({ userId: String(userId), createdAt: new Date() })
        cartRows = await db.select().from(carts).where(eq(carts.userId, String(userId))).limit(1)
        cart = cartRows[0]
      }

      // find existing cart item
      const existingRows = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartId, cart!.id), eq(cartItems.itemId, input.itemId)))
        .limit(1)
      const existing = existingRows[0]

      if (existing) {
        await db.update(cartItems).set({ quantity: existing.quantity + qty }).where(eq(cartItems.id, existing.id))
      } else {
        await db.insert(cartItems).values({ cartId: cart!.id, itemId: input.itemId, quantity: qty, addedAt: new Date() })
      }

      return { success: true }
    }),

  removeFromCart: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/cart/remove' } })
    .input(z.object({ itemId: z.number(), quantity: z.number().optional() }))
    .output(z.object({ success: z.boolean(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const qty = input.quantity ?? null
      const userId = ctx.session.user.id

      const cartRows = await db.select().from(carts).where(eq(carts.userId, String(userId))).limit(1)
      const cart = cartRows[0]
      if (!cart) return { success: false, reason: 'no_cart' }

      const existingRows = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartId, cart!.id), eq(cartItems.itemId, input.itemId)))
        .limit(1)
      const existing = existingRows[0]
      if (!existing) return { success: false, reason: 'not_in_cart' }

      if (!qty || qty >= existing.quantity) {
        await db.delete(cartItems).where(eq(cartItems.id, existing.id))
      } else {
        await db.update(cartItems).set({ quantity: existing.quantity - qty }).where(eq(cartItems.id, existing.id))
      }

      return { success: true }
    }),
  fetchItemsCount: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/cart/count' } })
    .output(z.object({ count: z.number() }))
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id
      const cartRows = await db.select().from(carts).where(eq(carts.userId, String(userId))).limit(1)
      const cart = cartRows[0]
      if (!cart) return { count: 0 }

      const rows = await db.select({ quantity: cartItems.quantity }).from(cartItems).where(eq(cartItems.cartId, cart.id))
      const count = rows.reduce((sum, r) => sum + (r.quantity ?? 0), 0)
      return { count }
    }),
})

export default cartRouter
