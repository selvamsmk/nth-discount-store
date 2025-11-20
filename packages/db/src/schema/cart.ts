import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { items } from './items'

// One row per user/cart. `user_id` is a unique identifier for the user (string)
export const carts = sqliteTable('carts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Each row represents one item in a cart. Allows quantity tracking and a timestamp.
export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cartId: integer('cart_id').notNull().references(() => carts.id),
  itemId: integer('item_id').notNull().references(() => items.id),
  quantity: integer('quantity').notNull().default(1),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
})
