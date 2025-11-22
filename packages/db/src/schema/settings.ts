import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

/**
 * Settings table
 * - Keep a flexible key/value for misc settings
 * - Add `n_value` (integer) to store the "Nth order" value used to issue coupons
 */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  // explicit numeric column for the Nth-order value (e.g. 3 for every 3rd order)
  nValue: integer('n_value'),
})

export type Setting = InferSelectModel<typeof settings>
export type NewSetting = InferInsertModel<typeof settings>
