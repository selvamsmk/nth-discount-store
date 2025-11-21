import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/node";

const client = createClient({
	url: process.env.DATABASE_URL || "",
});

export const db = drizzle({ client });


