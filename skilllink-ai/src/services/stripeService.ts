import { supabase } from './supabase';
import { stripeProducts, type StripeProduct } from '../stripe-config';

export interface CheckoutSessionRequest {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface UserSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface UserOrder {
  customer_id: string;
  order_id: number;
  checkout_session_id: string;
  payment_intent_id: string;
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  order_date: string;
}

export class StripeService {
  static async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('User not authenticated');
      }

      const defaultSuccessUrl = `${window.location.origin}/subscription-success`;
      const defaultCancelUrl = `${window.location.origin}/pricing`;

      const response = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: request.priceId,
          mode: request.mode,
          success_url: request.successUrl || defaultSuccessUrl,
          cancel_url: request.cancelUrl || defaultCancelUrl,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error('Stripe checkout error:', response.error);
        if (response.data) {
          console.error('Stripe checkout response data:', response.data);
        }
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      return response.data as CheckoutSessionResponse;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  static async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching user subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  static async getUserOrders(): Promise<UserOrder[]> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription();
      
      if (!subscription || !subscription.subscription_status) {
        return false;
      }

      const activeStatuses = ['active', 'trialing'];
      return activeStatuses.includes(subscription.subscription_status);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  static async getCurrentPlan(): Promise<StripeProduct | null> {
    try {
      const subscription = await this.getUserSubscription();
      
      if (!subscription || !subscription.price_id) {
        return null;
      }

      const product = stripeProducts.find(p => p.priceId === subscription.price_id);
      return product || null;
    } catch (error) {
      console.error('Error getting current plan:', error);
      return null;
    }
  }

  static formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
  }

  static getSubscriptionStatusDisplay(status: string): { text: string; color: string } {
    const statusMap: Record<string, { text: string; color: string }> = {
      active: { text: 'Active', color: 'text-green-600' },
      trialing: { text: 'Trial', color: 'text-blue-600' },
      past_due: { text: 'Past Due', color: 'text-orange-600' },
      canceled: { text: 'Canceled', color: 'text-red-600' },
      incomplete: { text: 'Incomplete', color: 'text-yellow-600' },
      incomplete_expired: { text: 'Expired', color: 'text-red-600' },
      unpaid: { text: 'Unpaid', color: 'text-red-600' },
      paused: { text: 'Paused', color: 'text-gray-600' },
      not_started: { text: 'Not Started', color: 'text-gray-600' },
    };

    return statusMap[status] || { text: status, color: 'text-gray-600' };
  }
}