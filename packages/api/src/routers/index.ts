import z from 'zod'
import { protectedProcedure, publicProcedure, router } from "../index";
import { cartRouter } from "./cart";
import { itemsRouter } from "./items";
import { settingsRouter } from "./settings";
import { ordersRouter } from "./orders";
import { couponsRouter } from "./coupons";
import { adminRouter } from "./admin";

export const appRouter = router({
	healthCheck: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/health' } })
    .output(z.string())
    .query(() => {
      return "OK";
    }),
	privateData: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/private' } })
    .output(z.object({ message: z.string(), user: z.any() }))
    .query(({ ctx }) => {
      return {
        message: "This is private",
        user: ctx.session.user,
      };
    }),
	items: itemsRouter,
	settings: settingsRouter,
	coupons: couponsRouter,
	admin: adminRouter,
	orders: ordersRouter,
	cart: cartRouter,
});
export type AppRouter = typeof appRouter;
