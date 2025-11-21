import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  sku: text('sku'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Use the newer InferSelectModel / InferInsertModel helpers instead of the deprecated InferModel
export type Item = InferSelectModel<typeof items>
export type NewItem = InferInsertModel<typeof items>
