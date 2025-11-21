import { createFileRoute } from '@tanstack/react-router'
import ItemList from '@/components/item-list';

export const Route = createFileRoute('/app/store')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='h-full'>
      <div className='mb-4'>
        <h1 className='text-4xl font-bold'>Store</h1>
      </div>
      <ItemList/>
    </div>
  )
}
