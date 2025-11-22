import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/node";
import { user } from "./schema/auth";

const client = createClient({
	url: process.env.DATABASE_URL || "file:/data/nth-discount-store-pr.sqlite3",
});

export const db = drizzle({ client });

// re-export useful types from schema for consumers (type-only export)
export type { Item, NewItem } from './schema/items';
export type { Order, NewOrder, OrderItem, NewOrderItem } from './schema/orders';
export type { Coupon, NewCoupon } from './schema/coupons';
export type { Setting, NewSetting } from './schema/settings';
export { user as UserTable }


