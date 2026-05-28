import type { Metadata } from 'next';
import DonateClient from './DonateClient';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support The Sacred Hearts ministry. All donations are tax-deductible and go directly toward producing and distributing sacred images to families in need.',
};

export default function DonatePage() {
  return (
    <>
      <div className="page-hero">
        <h1>Support Our Ministry</h1>
        <p>Your gift spreads the love of the Sacred Hearts to families everywhere</p>
      </div>
      <div className="content-block">
        <h2>Make a Donation</h2>
        <p>
          The Sacred Hearts is a registered 501(c)3 nonprofit. All donations are tax-deductible and go directly
          toward producing and distributing sacred images, supporting families in need, and expanding our ministry.
        </p>
        <p>
          Whether you give $10 or $500, your generosity helps bring the Sacred Heart of Jesus and the Immaculate
          Heart of Mary into homes across the country — and around the world.
        </p>
        <DonateClient />
      </div>
    </>
  );
}
