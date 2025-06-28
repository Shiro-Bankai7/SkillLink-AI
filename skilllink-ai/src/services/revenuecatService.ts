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

      // Note: RevenueCat API calls from frontend are not recommended for production
      // This should be done from your backend for security
      console.warn('RevenueCat API calls should be made from backend for security');
      
      // For now, return null to avoid 403 errors
      return null;
    } catch (error) {
      console.error('Error fetching RevenueCat subscriber:', error);
      return null;
    }
  }

  static async hasActiveEntitlement(userId: string, entitlementId: string = 'premium'): Promise<boolean> {
    try {
      // Since we can't call RevenueCat API directly from frontend,
      // we'll check local subscription status instead
      const localStatus = await this.getLocalSubscriptionStatus(userId);
      return localStatus.hasActiveSubscription;
    } catch (error) {
      console.error('Error checking RevenueCat entitlement:', error);
      return false;
    }
  }

  static async syncWithStripe(userId: string, stripeSubscription?: any): Promise<void> {
    try {
      if (!this.apiKey || !stripeSubscription) return;

      // This should be done from your backend
      console.warn('RevenueCat sync should be done from backend');
      
      // For now, just log the sync attempt
      console.log('Would sync with RevenueCat:', { userId, subscriptionId: stripeSubscription.id });
    } catch (error) {
      console.error('Error syncing with RevenueCat:', error);
    }
  }

  static async logEvent(userId: string, eventName: string, properties?: Record<string, any>): Promise<void> {
    try {
      if (!this.apiKey) return;

      // This should be done from your backend
      console.warn('RevenueCat event logging should be done from backend');
      
      // For now, just log the event locally
      console.log('Would log RevenueCat event:', { userId, eventName, properties });
    } catch (error) {
      console.error('Error logging RevenueCat event:', error);
    }
  }

  static async getSubscriptionManagementUrl(userId: string): Promise<string | null> {
    try {
      // Since we can't get this from RevenueCat API directly,
      // return a fallback URL or null
      return null;
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

      // For now, we'll skip RevenueCat API calls due to CORS/auth issues
      // In production, this should be handled by your backend
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