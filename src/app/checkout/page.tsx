import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSetting } from '@/lib/db';
import CheckoutClient from './CheckoutClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order from The Sacred Hearts ministry.',
};

export default async function CheckoutPage() {
  const shopMaintenance = (await getSetting('shop_maintenance_mode')) === 'true';
  if (shopMaintenance) redirect('/shop');

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
