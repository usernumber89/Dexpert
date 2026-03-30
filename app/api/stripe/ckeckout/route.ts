import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const PRICE_MAP: Record<string, string> = {
  BASIC:    process.env.STRIPE_PRICE_BASIC!,
  ASSISTED: process.env.STRIPE_PRICE_ASSISTED!,
  PREMIUM:  process.env.STRIPE_PRICE_PREMIUM!,
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();
  const priceId = PRICE_MAP[plan];
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pyme/dashboard?success=true&plan=${plan}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/pyme/dashboard?canceled=true`,
    metadata: { userId, plan },
  });

  return NextResponse.json({ url: session.url });
}