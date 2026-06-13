import { NextRequest, NextResponse } from 'next/server';

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY || 'shippo_test_dc2753f1272bcb293a8c5285e44346b46a79a665';

const FROM_ADDRESS = {
  name: 'The Sacred Hearts',
  street1: '5440 Moeller Avenue',
  street2: 'Suite 101',
  city: 'Cincinnati',
  state: 'OH',
  zip: '45212',
  country: 'US',
  phone: '5137413400',
  email: 'info@thesacredhearts.org',
};

export async function POST(req: NextRequest) {
  try {
    const { toAddress, weightOz, hasFreeShipping } = await req.json();

    // Validate required fields
    if (!toAddress?.street1 || !toAddress?.city || !toAddress?.state || !toAddress?.zip) {
      return NextResponse.json({ error: 'Incomplete address' }, { status: 400 });
    }

    // Create shipment via Shippo REST API
    const shipmentRes = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_from: FROM_ADDRESS,
        address_to: {
          name: toAddress.name || 'Customer',
          street1: toAddress.street1,
          street2: toAddress.street2 || '',
          city: toAddress.city,
          state: toAddress.state,
          zip: toAddress.zip,
          country: toAddress.country || 'US',
        },
        parcels: [{
          length: '12',
          width: '10',
          height: '3',
          distance_unit: 'in',
          weight: String(Math.max(weightOz, 4)),
          mass_unit: 'oz',
        }],
        async: false,
      }),
    });

    if (!shipmentRes.ok) {
      const err = await shipmentRes.text();
      console.error('Shippo error:', err);
      return NextResponse.json({ error: 'Failed to fetch shipping rates' }, { status: 500 });
    }

    const shipment = await shipmentRes.json();

    // Filter and sort rates
    const rates = (shipment.rates || [])
      .filter((r: any) => r.amount && parseFloat(r.amount) > 0)
      .map((r: any) => ({
        id: r.object_id,
        carrier: r.provider,
        service: r.servicelevel?.name || r.service_level_name || r.provider_image_75,
        amount: parseFloat(r.amount),
        amountFormatted: `$${parseFloat(r.amount).toFixed(2)}`,
        currency: r.currency,
        estimatedDays: r.estimated_days,
        duration_terms: r.duration_terms || null,
      }))
      .sort((a: any, b: any) => a.amount - b.amount);

    // If all items have free shipping, prepend a $0 option
    const freeOption = hasFreeShipping ? [{
      id: 'free',
      carrier: 'Standard',
      service: 'Free Shipping',
      amount: 0,
      amountFormatted: 'Free',
      currency: 'USD',
      estimatedDays: 7,
      duration_terms: '5–10 business days',
    }] : [];

    return NextResponse.json({ rates: [...freeOption, ...rates] });

  } catch (error) {
    console.error('Shipping rates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
