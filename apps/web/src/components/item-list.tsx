import React from 'react'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

type Props = {}

const ItemList = (props: Props) => {
  const items = useQuery(trpc.items.getAll.queryOptions());
  const cartQuery = useQuery(trpc.cart.fetchItemsInCart.queryOptions());

  const addToCart = useMutation(trpc.cart.addToCart.mutationOptions());

  const removeFromCart = useMutation(trpc.cart.removeFromCart.mutationOptions());

  const inCartIds = new Set<number>((cartQuery.data ?? []).map((c: any) => c.itemId))

  return (
     <ul className='h-full overflow-y-auto space-y-4 p-4'>
      {items.data?.map(item => {
        const isInCart = inCartIds.has(item.id)
        return (
          <li key={item.id} className='w-full'>
            <Item variant={"outline"}>
              <ItemContent>
                <ItemTitle>{item.name}</ItemTitle>
                <ItemDescription>
                  {item.description}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                {isInCart ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      removeFromCart.mutate(
                        { itemId: item.id },
                        {
                          onSuccess: () => {
                            toast.success(`${item.name} removed from cart`)
                            void cartQuery.refetch()
                          },
                          onError: (err: any) => {
                            toast.error(err?.message ?? 'Failed to remove from cart')
                          },
                        }
                      )
                    }
                    disabled={('isLoading' in removeFromCart ? Boolean((removeFromCart as any).isLoading) : false)}
                  >
                    Remove from cart
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addToCart.mutate(
                        { itemId: item.id },
                        {
                          onSuccess: () => {
                            toast.success(`${item.name} added to cart`)
                            void cartQuery.refetch()
                          },
                          onError: (err: any) => {
                            toast.error(err?.message ?? 'Failed to add to cart')
                          },
                        }
                      )
                    }
                    disabled={('isLoading' in addToCart ? Boolean((addToCart as any).isLoading) : false)}
                  >
                    Add to cart
                  </Button>
                )}
              </ItemActions>
            </Item>
          </li>
        )
      })}
      </ul>
  )
}

export default ItemList