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
  const [generatedCoupon, setGeneratedCoupon] = useState<any | null>(null);

  const items = cartQuery.data ?? [];
  const subtotalCents = items.reduce((sum: number, it: any) => sum + ((it.price ?? 0) * (it.quantity ?? 1)), 0);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const validateCoupon = useMutation(trpc.coupons.validate.mutationOptions());

  const handleApplyDiscount = () => {
    const code = (discountCode ?? '').trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a discount code');
      return;
    }
    validateCoupon.mutate(
      { code },
      {
        onSuccess: (res: any) => {
          setDiscountPercent(res.percent ?? 0)
          setAppliedCode(code)
          toast.success(`Discount applied — ${res.percent}% off`)
        },
        onError: (err: any) => {
          toast.error(err?.message ?? 'Invalid discount code')
        },
      }
    )
  };

  const handleRemoveDiscount = () => {
    setDiscountPercent(0);
    setAppliedCode(null);
    setDiscountCode('');
    toast('Discount removed');
  };

  const handleCheckout = () => {
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
    const payload = appliedCode ? { discountCode: appliedCode } : undefined
    orderCreate.mutate(payload, {
      onSuccess: (data: any) => {
        // If server returned a generatedCoupon, show it in the dialog and keep it open
        if (data?.generatedCoupon) {
          setGeneratedCoupon(data.generatedCoupon)
          setOrderDialogOpen(true)
          toast.success('Order placed — you earned a coupon!')
          // do not refetch the cart yet (so UI still shows items while user views coupon)
          return
        }
        // no coupon generated: refresh cart and navigate to orders
        void cartQuery.refetch();
        void queryClient.invalidateQueries(trpc.cart.fetchItemsCount.queryOptions().queryKey as any);
        toast.success('Order placed successfully');
        setOrderDialogOpen(false);
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
                    {generatedCoupon ? (
                      <>
                        <DialogHeader>
                          <DialogTitle>Congratulations — here is your coupon</DialogTitle>
                          <DialogDescription>
                            We created a one-time use coupon for your next order. Copy it or go to your orders to view details.
                          </DialogDescription>
                        </DialogHeader>

                        <div className='p-3 mb-4 border rounded bg-muted'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <div className='text-sm text-muted-foreground'>You earned a coupon!</div>
                              <div className='font-medium'>Code: <span className='uppercase'>{generatedCoupon.code}</span></div>
                              <div className='text-xs text-muted-foreground'>Value: {generatedCoupon.percent}%</div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Button size='sm' onClick={() => { void navigator.clipboard.writeText(generatedCoupon.code); toast.success('Copied code') }}>Copy</Button>
                              <Button variant='secondary' size='sm' onClick={() => {
                                // clear coupon state, refresh cart state, then navigate to orders
                                setGeneratedCoupon(null);
                                setOrderDialogOpen(false);
                                void cartQuery.refetch();
                                void queryClient.invalidateQueries(trpc.cart.fetchItemsCount.queryOptions().queryKey as any);
                                navigate({ to: '/app/orders' });
                              }}>View orders</Button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <DialogHeader>
                        <DialogTitle>Select payment method</DialogTitle>
                        <DialogDescription>
                          Choose how you'd like to pay for your order.
                        </DialogDescription>
                      </DialogHeader>
                    )}

                    {!generatedCoupon ? (
                      <>
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
                      </>
                    ) : null}
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
