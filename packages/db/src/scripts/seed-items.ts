import dotenv from "dotenv";
import { seed } from "drizzle-seed";
import { faker } from "@faker-js/faker";
import { items } from "../schema/items";

// Resolve .env relative to this script file (not process.cwd())
const envUrl = new URL("../../../../apps/server/.env", import.meta.url);
dotenv.config({ path: envUrl.pathname });

async function main() {
  // import db dynamically so dotenv config runs after dotenv.config()
  const { db } = await import("../index");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Checked file:", envUrl.pathname);
    throw new Error("DATABASE_URL empty");
  }

  const COUNT = Number(process.env.SEED_COUNT ?? 20);

  // Build arrays of values using faker
  const names: string[] = [];
  const descriptions: string[] = [];
  const prices: number[] = [];
  const skus: string[] = [];
  const createdAt: Date[] = [];

  const seenSkus = new Set<string>();
  while (names.length < COUNT) {
    const name = faker.commerce.productName();
    const desc = faker.commerce.productDescription();
    const price = Math.round(parseFloat(faker.commerce.price({ min: 1, max: 200, dec: 2 })) * 100);
    // create readable SKU and ensure uniqueness in this generation pass
    const base = faker.helpers.slugify(name).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
    let sku = `${base}-${faker.string.alphanumeric(4).toUpperCase()}`;
    if (seenSkus.has(sku)) {
      // append random numeric to avoid collision
      sku = `${base}-${faker.string.numeric(4)}`;
    }
    if (seenSkus.has(sku)) continue; // very unlikely, but safe
    seenSkus.add(sku);

    names.push(name);
    descriptions.push(desc);
    prices.push(price);
    skus.push(sku);
    createdAt.push(new Date());
  }

  console.log("Prepared seed arrays, sample:", {
    name: names[0],
    description: descriptions[0],
    price: prices[0],
    sku: skus[0],
  });

  console.log(`Seeding ${COUNT} items via drizzle-seed...`);

  await seed(db, { items }, { count: COUNT })
    .refine((funcs) => ({
      items: {
        columns: {
          name: funcs.valuesFromArray({ values: names, isUnique: true }),
          description: funcs.valuesFromArray({ values: descriptions }),
          price: funcs.valuesFromArray({ values: prices }),
          sku: funcs.valuesFromArray({ values: skus, isUnique: true }),
          //@ts-ignore
          createdAt: funcs.valuesFromArray({ values: createdAt }),
        },
      },
    }));

  console.log("Seeding complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});