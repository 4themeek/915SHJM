'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart-context';

// This page only loads after Stripe redirects back from a successful
// payment, so arriving here is the correct signal to empty the cart.
export default function ClearCartOnLoad() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
