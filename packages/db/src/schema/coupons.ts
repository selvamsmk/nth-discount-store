import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { orders } from './orders'

/**
 * Coupons
 * - `redeemedOrderId` references `orders.id` when a coupon is redeemed
 * - We remove `expiresAt` because coupons are invalidated when used or when the next coupon is issued
 * - `invalidatedAt` records when a coupon was invalidated by issuance of a newer coupon (or other admin action)
 */
export const coupons = sqliteTable('coupons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  ownerUserId: text('owner_user_id'),
  percent: integer('percent').notNull(),
  used: integer('used', { mode: 'boolean' }).notNull(),
  // When redeemed, point to the order row that redeemed it
  redeemedOrderId: integer('redeemed_order_id').references(() => orders.id),
  // When a new coupon is issued we can invalidate the previous one by setting this
  invalidatedAt: integer('invalidated_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export type Coupon = InferSelectModel<typeof coupons>
export type NewCoupon = InferInsertModel<typeof coupons>
