import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
        <>
            <Header />
            <main className="rounded-lg border p-6">
                <article className="max-w-4xl prose prose-lg prose-neutral dark:prose-invert text-left leading-relaxed space-y-6 ml-6">
                    <h1 className="text-4xl md:text-5xl font-bold">Nth Discount Store</h1>

                    <p>
                        Simple ecommerce demo: add items to a cart, checkout, and automatically receive a 10% coupon every
                        nth order.
                    </p>

                    <h2 className="text-2xl md:text-3xl font-semibold mt-4">What you'll find here</h2>
                    <ul>
                        <li>Add items to cart and place orders via backend APIs.</li>
                        <li>Every nth order issues a single-use 10% coupon for the next order.</li>
                        <li>Admin endpoints to generate coupons and view aggregated stats (items sold, total revenue, discounts).</li>
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-semibold mt-4">Logging in</h2>
                    <p>
                        Use the Sign In button in the header to authenticate. Once signed in your cart is persisted to your
                        account and you can complete checkout. If you're not signed in, the cart is session-scoped and may be
                        lost when you close the browser.
                    </p>

                    <h2 className="text-2xl md:text-3xl font-semibold mt-4">Store page</h2>
                    <p>
                        The Store page lists available products. For each product you can:
                    </p>
                    <ul>
                        <li>Browse product details (name, description, price).</li>
                        <li>Add items to your cart or remove them from the cart.</li>
                        <li>Open the Cart page to review quantities, apply coupons, and place orders.</li>
                    </ul>

                    <div className="mt-4">
                        <Button asChild>
                            <Link to="/app/store">Browse store</Link>
                        </Button>
                    </div>
                </article>
            </main>
        </>
	);
}
