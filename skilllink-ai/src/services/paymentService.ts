import { supabase } from './supabase';

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId?: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '3 AI coaching sessions/month',
      '5 skill exchanges/month',
      'Basic analytics',
      'Community access'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited AI coaching',
      'Unlimited skill exchanges',
      'Advanced analytics',
      'Priority support',
      'Session recordings',
      'Custom AI coaches'
    ],
    stripePriceId: 'price_1234567890' // Replace with actual Stripe price ID
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Pro',
      '1-on-1 human coaching',
      'Personalized learning paths',
      'API access',
      'White-label options',
      'Enterprise features'
    ],
    stripePriceId: 'price_0987654321' // Replace with actual Stripe price ID
  }
];

export class PaymentService {
  // Create a payment intent for one-time payments
  static async createPaymentIntent(paymentData: PaymentData): Promise<any> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Call your backend API to create Stripe payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token}`
        },
        body: JSON.stringify({
          amount: Math.round(paymentData.amount * 100), // Convert to cents
          currency: paymentData.currency,
          description: paymentData.description,
          metadata: paymentData.metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { client_secret } = await response.json();
      return { client_secret };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Create a subscription
  static async createSubscription(planId: string): Promise<any> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan || !plan.stripePriceId) {
        throw new Error('Invalid plan selected');
      }

      // Call your backend API to create Stripe subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token}`
        },
        body: JSON.stringify({
          price_id: plan.stripePriceId,
          customer_email: user.user.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const subscription = await response.json();
      
      // Update user's plan in the database
      await supabase
        .from('profiles')
        .update({ plan: planId })
        .eq('id', user.user.id);

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Update user's plan to free
      await supabase
        .from('profiles')
        .update({ plan: 'free' })
        .eq('id', user.user.id);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Get user's current subscription
  static async getCurrentSubscription(): Promise<any> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const response = await fetch('/api/get-subscription', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.user.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  // Record payment in database
  static async recordPayment(paymentData: {
    amount: number;
    currency: string;
    payment_method: string;
    transaction_id: string;
    status: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      await supabase.from('payments').insert({
        user_id: user.user.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.payment_method,
        payment_provider: 'stripe',
        transaction_id: paymentData.transaction_id,
        status: paymentData.status,
        description: paymentData.description,
        metadata: paymentData.metadata || {}
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  // Get user's payment history
  static async getPaymentHistory(): Promise<any[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // Check if user has active subscription
  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.user.id)
        .single();

      return profile?.plan !== 'free';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Process in-app skill exchange payments
  static async processSkillExchangePayment(sessionId: string, amount: number): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Create payment intent for skill exchange
      const paymentIntent = await this.createPaymentIntent({
        amount,
        currency: 'USD',
        description: `Skill exchange session payment`,
        metadata: { session_id: sessionId, type: 'skill_exchange' }
      });

      // Record the payment
      await this.recordPayment({
        amount,
        currency: 'USD',
        payment_method: 'card',
        transaction_id: paymentIntent.id,
        status: 'completed',
        description: `Skill exchange session payment`,
        metadata: { session_id: sessionId, type: 'skill_exchange' }
      });

      // Update session with payment status
      await supabase
        .from('sessions')
        .update({ 
          status: 'paid',
          metadata: { payment_completed: true }
        })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error processing skill exchange payment:', error);
      throw error;
    }
  }

  // Get pricing for different session types
  static getSessionPricing() {
    return {
      ai_coaching: 0, // Free for all users
      skill_exchange_premium: 5.99, // Premium skill exchange with expert
      group_session: 2.99, // Group learning sessions
      one_on_one_human: 29.99, // 1-on-1 with human coach
      certification: 49.99 // Skill certification
    };
  }
}
