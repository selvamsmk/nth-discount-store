import ItemList from '@/components/item-list';
import { Separator } from '@/components/ui/separator';
import { queryClient, trpc } from '@/utils/trpc';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/format';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/app/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  const cartQuery = useQuery(trpc.cart.fetchItemsInCart.queryOptions());
  const orderCreate = useMutation(trpc.orders.create.mutationOptions());

  const items = cartQuery.data ?? [];
  const subtotalCents = items.reduce((sum: number, it: any) => sum + ((it.price ?? 0) * (it.quantity ?? 1)), 0);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const VALID_DISCOUNT_CODES = new Set(['SAVE10', 'TENOFF']);

  const handleApplyDiscount = () => {
    const code = (discountCode ?? '').trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a discount code');
      return;
    }
    if (VALID_DISCOUNT_CODES.has(code)) {
      setDiscountPercent(10);
      setAppliedCode(code);
      toast.success('Discount applied — 10% off');
    } else {
      toast.error('Invalid discount code');
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountPercent(0);
    setAppliedCode(null);
    setDiscountCode('');
    toast('Discount removed');
  };

  const handleCheckout = () => {
    // Placeholder: no orders API implemented — show a toast and log the cart.
    // Keep the old behavior for non-dialog flows (not used now).
    toast.success('Checkout not implemented in this demo.');
    // In a real app: call your orders.create mutation or redirect to payment.
    console.log('Checkout items:', items);
  }

  // Order dialog state
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    // Call server to create order from cart; server clears the cart.
    orderCreate.mutate(undefined, {
      onSuccess: () => {
        toast.success('Order placed successfully');
        setOrderDialogOpen(false);
        void cartQuery.refetch();
        void queryClient.invalidateQueries(trpc.cart.fetchItemsCount.queryOptions().queryKey as any);
        navigate({ to: '/app/orders' });
      },
      onError: (err: any) => {
        toast.error(err?.message ?? 'Failed to place order');
      },
    })
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='ml-3 mt-4 mb-3'>
        <h1 className='text-4xl font-bold'>Cart</h1>
      </div>
    <div className='flex flex-row h-full'>
      <div className='h-full w-2/3'>
        <ItemList filterItemsForCart={true}/>
      </div>
      <Separator orientation='vertical' className='my-3'/>
      <div className='w-1/3 p-4'>
        <h2 className='text-xl font-semibold mb-4'>Checkout</h2>
        {items.length === 0 ? (
          <div className='text-sm text-muted-foreground'>Your cart is empty.</div>
        ) : (
          <div className='space-y-4'>
            <div className='mb-4 flex items-center gap-2'>
              <Input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder='Discount code'
                className='w-40'
              />
              <Button onClick={handleApplyDiscount} size='sm'>Apply</Button>
              {appliedCode ? (
                <Button variant='destructive' size='sm' onClick={handleRemoveDiscount}>Remove</Button>
              ) : null}
            </div>

            <ul className='space-y-2'>
              {items.map((it: any) => (
                <li key={it.cartItemId} className='flex justify-between'>
                  <div>
                    <div className='font-medium'>{it.name}</div>
                    <div className='text-sm text-muted-foreground'>Qty: {it.quantity}</div>
                  </div>
                  <div className='text-right'>
                    <div>{formatPrice((it.price ?? 0))}</div>
                    <div className='text-sm text-muted-foreground'>
                      {formatPrice((it.price ?? 0) * (it.quantity ?? 1))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className='border-t pt-4'>
              <div className='flex justify-between font-medium'>
                <div>Subtotal</div>
                <div>{formatPrice(subtotalCents)}</div>
              </div>
              {discountPercent > 0 && (
                <div className='flex justify-between text-sm text-muted-foreground mt-2'>
                  <div>Discount ({discountPercent}%)</div>
                  <div>-{formatPrice(Math.round(subtotalCents * discountPercent / 100))}</div>
                </div>
              )}
              <div className='flex justify-between text-sm text-muted-foreground mt-2'>
                <div>Tax</div>
                <div>{formatPrice(0)}</div>
              </div>
              <div className='flex justify-between font-semibold mt-4 text-lg'>
                <div>Total</div>
                <div>{formatPrice(subtotalCents - Math.round(subtotalCents * discountPercent / 100))}</div>
              </div>

              <div className='mt-4'>
                <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Checkout</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select payment method</DialogTitle>
                      <DialogDescription>
                        Choose how you'd like to pay for your order.
                      </DialogDescription>
                    </DialogHeader>

                    <div className='mt-4 space-y-3'>
                      <label className='flex items-center gap-2'>
                        <input type='radio' name='payment' checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                        <span>Credit / Debit Card</span>
                      </label>
                      <label className='flex items-center gap-2'>
                        <input type='radio' name='payment' checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                        <span>PayPal</span>
                      </label>
                      <label className='flex items-center gap-2'>
                        <input type='radio' name='payment' checked={paymentMethod === 'apple'} onChange={() => setPaymentMethod('apple')} />
                        <span>Apple Pay</span>
                      </label>
                    </div>

                    <div className='mt-6 flex justify-end gap-2'>
                      <Button variant='ghost' onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handlePlaceOrder}>Place order</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
