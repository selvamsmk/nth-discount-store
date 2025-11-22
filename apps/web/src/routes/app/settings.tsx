import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { trpc, queryClient } from '@/utils/trpc'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const Route = createFileRoute('/app/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const getNth = useQuery(trpc.settings.getNth.queryOptions())
  const updateNth = useMutation(trpc.settings.updateNth.mutationOptions())

  const [nValue, setNValue] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const val = getNth.data?.nValue
    if (typeof val === 'number') setNValue(String(val))
  }, [getNth.data])

  const handleSave = () => {
    const parsed = parseInt(nValue, 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
      toast.error('Please enter a valid integer >= 1')
      return
    }
    setSaving(true)
    updateNth.mutate(
      { nValue: parsed },
      {
        onSuccess: () => {
          toast.success('Settings updated')
          void queryClient.invalidateQueries(trpc.settings.getNth.queryOptions().queryKey as any)
        },
        onError: (err: any) => {
          toast.error(err?.message ?? 'Failed to update settings')
        },
        onSettled: () => setSaving(false),
      }
    )
  }

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <h1 className='text-3xl font-bold'>Settings</h1>
        <p className='text-sm text-muted-foreground mt-1'>Application-wide configuration for promotions and coupons.</p>
      </div>

      <div className='max-w-md'>
        <label className='block text-sm font-medium mb-2'>Nth-order coupon value</label>
        <p className='text-xs text-muted-foreground mb-2'>When set, a coupon will be issued every Nth order (for example, 3 issues a coupon on the 3rd order).</p>
        <div className='flex items-center gap-2'>
          <Input value={nValue} onChange={(e: any) => setNValue(e.target.value)} className='w-28' />
          <Button onClick={handleSave} disabled={saving}>
            Save
          </Button>
        </div>
        {getNth.data?.nValue == null && (
          <p className='text-xs text-muted-foreground mt-2'>No Nth-order value is set.</p>
        )}
      </div>
    </div>
  )
}
