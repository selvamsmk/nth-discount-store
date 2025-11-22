import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  totalCents: integer('total_cents').notNull(),
  discountCents: integer('discount_cents').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull(),
  itemId: integer('item_id').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
})

// Select and insert types
export type Order = InferSelectModel<typeof orders>
export type NewOrder = InferInsertModel<typeof orders>

export type OrderItem = InferSelectModel<typeof orderItems>
export type NewOrderItem = InferInsertModel<typeof orderItems>
