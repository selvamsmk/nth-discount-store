import React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc, queryClient } from '@/utils/trpc';
import StoreItem from './store-item';
import { toast } from 'sonner';

type Props = {
    filterItemsForCart?: boolean
}

const ItemList = (props: Props) => {
  const { filterItemsForCart = false } = props;

  const items = useQuery(trpc.items.getAll.queryOptions());
  const cartQuery = useQuery(trpc.cart.fetchItemsInCart.queryOptions());
  const addToCart = useMutation(trpc.cart.addToCart.mutationOptions());
  const removeFromCart = useMutation(trpc.cart.removeFromCart.mutationOptions());
  const inCartIds = new Set<number>((cartQuery.data ?? []).map((c: any) => c.itemId))
  const cartQuantityMap = new Map<number, number>((cartQuery.data ?? []).map((c: any) => [c.itemId, c.quantity]))
  const displayedItems = (items.data ?? []).filter((item: any) => {
    if (!filterItemsForCart) return true;
    return inCartIds.has(item.id);
  });

  const handleAdd = (itemId: number) => {
    addToCart.mutate(
      { itemId },
      {
        onSuccess: () => {
          const item = (items.data ?? []).find((i: any) => i.id === itemId);
          toast.success(`${item?.name ?? 'Item'} added to cart`);
          void cartQuery.refetch();
          void queryClient.invalidateQueries(trpc.cart.fetchItemsCount.queryOptions().queryKey as any);
        },
        onError: (err: any) => {
          toast.error(err?.message ?? 'Failed to add to cart');
        },
      }
    );
  };

  const handleRemove = (itemId: number) => {
    removeFromCart.mutate(
      { itemId },
      {
        onSuccess: () => {
          const item = (items.data ?? []).find((i: any) => i.id === itemId);
          toast.success(`${item?.name ?? 'Item'} removed from cart`);
          void cartQuery.refetch();
          void queryClient.invalidateQueries(trpc.cart.fetchItemsCount.queryOptions().queryKey as any);
        },
        onError: (err: any) => {
          toast.error(err?.message ?? 'Failed to remove from cart');
        },
      }
    );
  };

  return (
     <ul className='h-full overflow-y-auto space-y-4 p-4'>
      {displayedItems.map(item => {
        const isInCart = inCartIds.has(item.id)
        const qty = cartQuantityMap.get(item.id);
        const normalizedItem = { ...item, description: item.description ?? null, sku: item.sku ?? null }

        return (
          <li key={item.id} className='w-full'>
            <StoreItem
              item={normalizedItem}
              isInCart={isInCart}
              quantity={qty ?? 1}
              onAdd={handleAdd}
              onRemove={handleRemove}
              addLoading={('isLoading' in addToCart ? Boolean((addToCart as any).isLoading) : false)}
              removeLoading={('isLoading' in removeFromCart ? Boolean((removeFromCart as any).isLoading) : false)}
            />
          </li>
        )
      })}
      </ul>
  )
}

export default ItemList