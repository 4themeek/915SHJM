import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDonationById, markDonationThankYouSent } from '@/lib/db';
import { sendDonationThankYouEmail } from '@/lib/email';

interface Props { params: Promise<{ id: string }>; }

export async function POST(req: NextRequest, { params }: Props) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const donation = await getDonationById(Number(id));
  if (!donation) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
  if (!donation.donor_email) return NextResponse.json({ error: 'No email on file for this donor' }, { status: 400 });

  const sent = await sendDonationThankYouEmail({
    donorName: donation.donor_name,
    donorEmail: donation.donor_email,
    amount: Number(donation.amount),
  });

  if (!sent) return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });

  const updated = await markDonationThankYouSent(donation.id);
  return NextResponse.json({ donation: updated });
}
