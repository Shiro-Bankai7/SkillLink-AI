export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  features: string[];
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SWDbLUxbZNEl9P',
    priceId: 'price_1RbBA9QPc5EseDCpASCgr3kQ',
    name: 'Pro (Monthly)',
    description: 'Monthly Pro',
    mode: 'subscription',
    price: 11.93,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited AI coaching sessions',
      'Unlimited skill exchanges',
      'Advanced analytics',
      'Priority support',
      'Session recordings',
      'Custom AI coaches'
    ]
  },
  {
    id: 'prod_SWDc4MtbyJDtL9',
    priceId: 'price_1RbBBMQPc5EseDCpT1qmPNDU',
    name: 'Pro (Yearly)',
    description: 'Yearly Pro subscription',
    mode: 'subscription',
    price: 109.62,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in Pro Monthly',
      'Annual savings (2 months free)',
      'Bonus XP rewards',
      'Priority feature access',
      'Extended session recordings',
      'Advanced AI coach customization'
    ]
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};