import type { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order from The Sacred Hearts ministry.',
};

export default function CheckoutPage() {
  return (
    <>
      <div className="page-hero" style={{ padding: '3rem 2rem 2.5rem' }}>
        <h1>Checkout</h1>
        <p>Secure checkout · All major cards accepted</p>
      </div>
      <CheckoutClient />
    </>
  );
}
