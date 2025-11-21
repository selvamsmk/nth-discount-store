import React from 'react'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/format';
import type { ApiItem as StoreItemType } from '@nth-discount-store/api';

type StoreItemProps = {
  item: StoreItemType;
  isInCart: boolean;
  quantity?: number;
  onAdd: (itemId: number) => void;
  onRemove: (itemId: number) => void;
  addLoading?: boolean;
  removeLoading?: boolean;
}

const StoreItem = ({ item, isInCart, quantity, onAdd, onRemove, addLoading = false, removeLoading = false }: StoreItemProps) => {
  return (
    <Item variant={"outline"}>
      <ItemContent>
        <ItemTitle>{item.name}</ItemTitle>
        <ItemDescription>
          {item.description}
        </ItemDescription>
        <div className='mt-2 flex items-center justify-start gap-2 text-sm text-muted-foreground'>
          <div>{formatPrice(item.price ?? 0)}</div>
          <div>Qty: {quantity}</div>
        </div>
      </ItemContent>
      <ItemActions>
        {isInCart ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(item.id)}
            disabled={Boolean(removeLoading)}
          >
            Remove from cart
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdd(item.id)}
            disabled={Boolean(addLoading)}
          >
            Add to cart
          </Button>
        )}
      </ItemActions>
    </Item>
  )
}

export default StoreItem;
