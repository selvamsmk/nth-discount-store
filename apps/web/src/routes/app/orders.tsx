import React, { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { trpc } from '@/utils/trpc'
import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { formatPrice } from '@/utils/format'

import type { ColumnDef, Row } from '@tanstack/react-table'

export const Route = createFileRoute('/app/orders')({ component: RouteComponent })

type OrderRow = {
  id: number
  totalCents: number
  createdAt: string
  itemCount: number
  items: {
    id: number;
    name?: string | null;
    itemId: number;
    price: number;
    quantity: number;
  }[]
}

export function OrdersTable({ data }: { data: OrderRow[] }) {
  const columns = useMemo<ColumnDef<OrderRow>[]>(() => [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => (
          <button onClick={row.getToggleExpandedHandler()} className='p-1'>
            {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
      ),
    },
    { accessorKey: 'id', header: 'Order #' },
    { accessorKey: 'itemCount', header: 'Items' },
    { accessorKey: 'totalCents', header: 'Total', cell: ({ row }) => formatPrice(row.getValue('totalCents')) },
    { accessorKey: 'createdAt', header: 'Date' },
  ], [])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getExpandedRowModel: getExpandedRowModel(), getRowCanExpand: (row) => (row.original as any).items && (row.original as any).items.length > 0 })

  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id}>
              {hg.headers.map(h => (
                <th key={h.id} className='text-left p-2'>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
            <React.Fragment key={row.id}>
              <TableRow>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow>
                  <TableCell colSpan={row.getVisibleCells().length}>
                    {/* Subcomponent: list order items */}
                    <div className='p-2'>
                      <strong>Items</strong>
                      <div className='mt-2 space-y-2'>
                        {(row.original.items ?? []).map((it, idx: number) => (
                          <div key={idx} className='flex justify-between border rounded p-2'>
                            <div className='font-medium'>{it.name ?? `#${String(it.itemId)}`}</div>
                            <div>Qty: {it.quantity}</div>
                            <div>{formatPrice(it.price)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className='h-24 text-center'>No orders.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function RouteComponent() {
  const q = useQuery(trpc.orders.myOrders.queryOptions())
  const rows = (q.data ?? []).map((o) => ({ 
    id: o.id, 
    totalCents: o.totalCents, 
    createdAt: new Date(o.createdAt).toLocaleString(), 
    itemCount: Array.isArray(o.items) ? o.items.length : 0 ,
    items: o.items
  }))

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <h1 className='text-3xl font-bold'>Orders</h1>
        <p className='text-sm text-muted-foreground mt-1'>Your past orders.</p>
      </div>

      <OrdersTable data={rows} />
    </div>
  )
}

export default RouteComponent;
