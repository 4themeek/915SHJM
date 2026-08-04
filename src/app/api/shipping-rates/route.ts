import { NextRequest, NextResponse } from 'next/server';
import { shippoPost, getShippingRates } from '@/lib/shippo';

export async function POST(req: NextRequest) {
  try {
    const { toAddress, weightOz, hasFreeShipping } = await req.json();

    if (!toAddress?.street1 || !toAddress?.city || !toAddress?.state || !toAddress?.zip) {
      return NextResponse.json({ error: 'Incomplete address' }, { status: 400 });
    }

    // ── STEP 1: Validate address via Shippo ──────────────────────────
    const validation = await shippoPost('addresses/', {
      name: toAddress.name || 'Customer',
      street1: toAddress.street1,
      street2: toAddress.street2 || '',
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zip,
      country: toAddress.country || 'US',
      validate: true,
    });

    const validationResults = validation.validation_results;
    const isValid = validationResults?.is_valid;
    const messages = validationResults?.messages || [];

    // Build a corrected address from Shippo's response if available
    const correctedAddress = isValid ? {
      street1: validation.street1 || toAddress.street1,
      street2: validation.street2 || toAddress.street2 || '',
      city: validation.city || toAddress.city,
      state: validation.state || toAddress.state,
      zip: validation.zip || toAddress.zip,
    } : null;

    // Check if Shippo corrected anything meaningful
    const wasCorreected = correctedAddress && (
      correctedAddress.street1.toLowerCase() !== toAddress.street1.toLowerCase() ||
      correctedAddress.city.toLowerCase() !== toAddress.city.toLowerCase() ||
      correctedAddress.state !== toAddress.state ||
      correctedAddress.zip !== toAddress.zip
    );

    // If address is invalid, return error with messages
    if (!isValid) {
      const errorMessages = messages
        .filter((m: any) => m.code !== 'Unknown')
        .map((m: any) => m.text || m.code)
        .filter(Boolean);

      return NextResponse.json({
        error: 'address_invalid',
        messages: errorMessages.length > 0
          ? errorMessages
          : ['We could not verify this address. Please check and try again.'],
        validationFailed: true,
      }, { status: 422 });
    }

    // ── STEP 2: Fetch shipping rates using validated address ──────────
    const addressToUse = correctedAddress || toAddress;

    const rates = await getShippingRates(
      {
        name: toAddress.name || 'Customer',
        street1: addressToUse.street1,
        street2: addressToUse.street2 || '',
        city: addressToUse.city,
        state: addressToUse.state,
        zip: addressToUse.zip,
        country: toAddress.country || 'US',
      },
      weightOz
    );

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

    return NextResponse.json({
      rates: [...freeOption, ...rates],
      // Pass back correction info so UI can show it
      addressCorrected: wasCorreected,
      correctedAddress: wasCorreected ? correctedAddress : null,
      validationMessages: messages.map((m: any) => m.text).filter(Boolean),
    });

  } catch (error) {
    console.error('Shipping rates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
