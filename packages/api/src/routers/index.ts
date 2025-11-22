import { protectedProcedure, publicProcedure, router } from "../index";
import { cartRouter } from "./cart";
import { itemsRouter } from "./items";
import { settingsRouter } from "./settings";
import { ordersRouter } from "./orders";
import { couponsRouter } from "./coupons";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	items: itemsRouter,
	settings: settingsRouter,
	coupons: couponsRouter,
	orders: ordersRouter,
	cart: cartRouter,
});
export type AppRouter = typeof appRouter;
