import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/node";

const client = createClient({
	url: process.env.DATABASE_URL || "file:/data/nth-discount-store-pr.sqlite3",
});

export const db = drizzle({ client });


