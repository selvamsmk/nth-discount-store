import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'
import { formatPrice } from '@/utils/format'
import { Card } from '@/components/ui/card'
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item'

export const Route = createFileRoute('/app/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  const q = useQuery(trpc.admin.getMetrics.queryOptions())
  const data: any = q.data

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Admin Dashboard</h1>
      {!data ? (
        <div>Loading...</div>
      ) : (
        <div className='grid grid-cols-3 gap-4'>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Items sold</div>
            <div className='text-2xl font-semibold'>{data.itemsSold ?? 0}</div>
          </Card>

          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Total revenue</div>
            <div className='text-2xl font-semibold'>{formatPrice(data.totalRevenue ?? 0)}</div>
          </Card>

          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Total discounts given</div>
            <div className='text-2xl font-semibold'>{formatPrice(data.totalDiscounts ?? 0)}</div>
          </Card>

          <div className='col-span-3 mt-4'>
            <h2 className='text-lg font-semibold mb-2'>Coupons</h2>
            <div className='space-y-2'>
              { (data.coupons ?? []).map((c: any) => (
                <Item key={c.code} variant={'outline'} className='p-3'>
                  <ItemContent>
                    <ItemTitle className='font-medium'>{c.code}</ItemTitle>
                    <ItemDescription>Value: {c.percent}% — {c.used ? 'Used' : 'Unused'}</ItemDescription>
                  </ItemContent>
                  <ItemActions className='text-sm text-muted-foreground'>
                    <div>Order: {c.redeemedOrderId ?? '-'}</div>
                  </ItemActions>
                </Item>
              )) }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteComponent
