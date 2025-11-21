import ItemList from '@/components/item-list';
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='h-full'>
      <ItemList filterItemsForCart/>
    </div>
    )
}
