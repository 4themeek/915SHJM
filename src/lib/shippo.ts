const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY || '';

export const SHIPPO_FROM_ADDRESS = {
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

export async function shippoPost(endpoint: string, body: object) {
  const res = await fetch(`https://api.goshippo.com/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  amount: number;
  amountFormatted: string;
  currency: string;
  estimatedDays?: number;
  duration_terms: string | null;
}

interface AddressInput {
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

// Fetches live shipping rates from Shippo for a given address + weight.
// Shared by /api/shipping-rates (customer-facing rate picker) and
// /api/checkout (server-side re-verification — never trust a client-
// supplied shipping amount).
export async function getShippingRates(address: AddressInput, weightOz: number): Promise<ShippingRate[]> {
  const shipment = await shippoPost('shipments/', {
    address_from: SHIPPO_FROM_ADDRESS,
    address_to: {
      name: address.name || 'Customer',
      street1: address.street1,
      street2: address.street2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country || 'US',
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
  });

  if (!shipment.rates || shipment.rates.length === 0) {
    console.error(
      'Shippo returned no rates for address',
      `${address.city}, ${address.state} ${address.zip}`,
      '— shipment status:', shipment.status,
      '— messages:', JSON.stringify(shipment.messages || []),
      '— full response:', JSON.stringify(shipment)
    );
  }

  return (shipment.rates || [])
    .filter((r: any) => r.amount && parseFloat(r.amount) > 0)
    .map((r: any) => ({
      id: r.object_id,
      carrier: r.provider,
      service: r.servicelevel?.name || r.service_level_name || r.provider,
      amount: parseFloat(r.amount),
      amountFormatted: `$${parseFloat(r.amount).toFixed(2)}`,
      currency: r.currency,
      estimatedDays: r.estimated_days,
      duration_terms: r.duration_terms || null,
    }))
    .sort((a: ShippingRate, b: ShippingRate) => a.amount - b.amount);
}
