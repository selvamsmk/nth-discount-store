import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  sku: text('sku'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
