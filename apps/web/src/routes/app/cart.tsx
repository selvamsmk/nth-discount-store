import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  const cartItems = useQuery(trpc.cart.fetchItemsInCart.queryOptions());
  return <div></div>
}
