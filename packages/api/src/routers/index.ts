import { protectedProcedure, publicProcedure, router } from "../index";
import { cartRouter } from "./cart";
import { itemsRouter } from "./items";

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
	cart: cartRouter
});
export type AppRouter = typeof appRouter;
