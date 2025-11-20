import { createFileRoute } from '@tanstack/react-router'
import ItemList from '@/components/item-list';

export const Route = createFileRoute('/app/store')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='h-full'>
      <ItemList/>
    </div>
  )
}
