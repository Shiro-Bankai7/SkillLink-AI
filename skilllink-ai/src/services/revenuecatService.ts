import { supabase } from './supabase';

export interface RevenueCatEntitlement {
  entitlement: string;
  product_identifier: string;
  is_active: boolean;
  will_renew: boolean;
  latest_purchase_date: string;
  original_purchase_date: string;
  expires_date?: string;
  period_type: 'normal' | 'trial' | 'promotional';
  store: 'app_store' | 'play_store' | 'stripe' | 'promotional';
}

export interface RevenueCatSubscriber {
  user_id: string;
  entitlements: Record<string, RevenueCatEntitlement>;
  subscriptions: Record<string, any>;
  non_subscription_transactions: any[];
  first_seen: string;
  last_seen: string;
  management_url?: string;
}

export class RevenueCatService {
  private static apiKey = import.meta.env.VITE_REVENUECAT_SECRET_KEY;
  private static baseUrl = 'https://api.revenuecat.com/v1';

  static async getSubscriberInfo(userId: string): Promise<RevenueCatSubscriber | null> {
    try {
      if (!this.apiKey) {
        console.warn('RevenueCat API key not configured');
        return null;
      }

      const response = await fetch(`${this.baseUrl}/subscribers/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Subscriber not found
        }
        throw new Error(`RevenueCat API error: ${response.status}`);
      }

      const data = await response.json();
      return data.subscriber;
    } catch (error) {
      console.error('Error fetching RevenueCat subscriber:', error);
      return null;
    }
  }

  static async hasActiveEntitlement(userId: string, entitlementId: string = 'premium'): Promise<boolean> {
    try {
      const subscriber = await this.getSubscriberInfo(userId);
      
      if (!subscriber || !subscriber.entitlements) {
        return false;
      }

      const entitlement = subscriber.entitlements[entitlementId];
      return entitlement?.is_active || false;
    } catch (error) {
      console.error('Error checking RevenueCat entitlement:', error);
      return false;
    }
  }

  static async syncWithStripe(userId: string, stripeSubscription?: any): Promise<void> {
    try {
      if (!this.apiKey || !stripeSubscription) return;

      // Create or update subscriber in RevenueCat
      const response = await fetch(`${this.baseUrl}/subscribers/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_user_id: userId,
          fetch_token: stripeSubscription.id,
          attributes: {
            stripe_customer_id: stripeSubscription.customer,
            subscription_status: stripeSubscription.status,
          },
        }),
      });

      if (!response.ok) {
        console.error('RevenueCat sync failed:', response.status);
        return;
      }

      console.log('Successfully synced with RevenueCat');
    } catch (error) {
      console.error('Error syncing with RevenueCat:', error);
    }
  }

  static async logEvent(userId: string, eventName: string, properties?: Record<string, any>): Promise<void> {
    try {
      if (!this.apiKey) return;

      const response = await fetch(`${this.baseUrl}/subscribers/${userId}/attribution`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: 'custom',
          data: {
            event_name: eventName,
            ...properties,
          },
        }),
      });

      if (!response.ok) {
        console.error('RevenueCat event logging failed:', response.status);
      }
    } catch (error) {
      console.error('Error logging RevenueCat event:', error);
    }
  }

  static async getSubscriptionManagementUrl(userId: string): Promise<string | null> {
    try {
      const subscriber = await this.getSubscriberInfo(userId);
      return subscriber?.management_url || null;
    } catch (error) {
      console.error('Error getting management URL:', error);
      return null;
    }
  }

  // Integration with local subscription service
  static async getLocalSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    source: 'stripe' | 'revenuecat' | 'none';
    expiresAt?: Date;
  }> {
    try {
      // Check Stripe first (primary source)
      const { data: stripeSubscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (stripeSubscription && ['active', 'trialing'].includes(stripeSubscription.subscription_status)) {
        return {
          hasActiveSubscription: true,
          source: 'stripe',
          expiresAt: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : undefined,
        };
      }

      // Fallback to RevenueCat
      const hasRevenueCat = await this.hasActiveEntitlement(userId);
      if (hasRevenueCat) {
        const subscriber = await this.getSubscriberInfo(userId);
        const premiumEntitlement = subscriber?.entitlements?.premium;
        
        return {
          hasActiveSubscription: true,
          source: 'revenuecat',
          expiresAt: premiumEntitlement?.expires_date ? new Date(premiumEntitlement.expires_date) : undefined,
        };
      }

      return {
        hasActiveSubscription: false,
        source: 'none',
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        hasActiveSubscription: false,
        source: 'none',
      };
    }
  }
}