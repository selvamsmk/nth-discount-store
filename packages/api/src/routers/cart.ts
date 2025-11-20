import z from 'zod'
import { router, protectedProcedure } from '../index'
import { carts, cartItems } from '@nth-discount-store/db/schema/cart'
import { items } from '@nth-discount-store/db/schema/items'
import { eq, and } from 'drizzle-orm'
import { db } from '@nth-discount-store/db'

export const cartRouter = router({
  fetchItemsInCart: protectedProcedure.query(async ({ ctx }) => {
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

      return rows
    }),

  addToCart: protectedProcedure
    .input(z.object({ itemId: z.number(), quantity: z.number().optional() }))
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
    .input(z.object({ itemId: z.number(), quantity: z.number().optional() }))
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
})

export default cartRouter
