import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Settings,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StripeService, type UserSubscription } from '../services/stripeService';
import { getProductByPriceId } from '../stripe-config';

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const userSubscription = await StripeService.getUserSubscription();
      setSubscription(userSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-center">
          <Crown className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">Upgrade to Pro to unlock premium features</p>
          <Link to="/pricing"><button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium">
            View Plans
          </button>
          </Link>
        </div>
      </div>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const statusDisplay = StripeService.getSubscriptionStatusDisplay(subscription.subscription_status);
  const isActive = ['active', 'trialing'].includes(subscription.subscription_status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Crown className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {product?.name || 'Pro Plan'}
            </h3>
            <div className="flex items-center space-x-2">
              {isActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-500" />
              )}
              <span className={`text-sm font-medium ${statusDisplay.color}`}>
                {statusDisplay.text}
              </span>
            </div>
          </div>
        </div>
        
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {subscription.current_period_end && (
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Next billing date</p>
              <p className="font-medium text-gray-900">
                {StripeService.formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>
        )}

        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <div className="flex items-center space-x-3">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Payment method</p>
              <p className="font-medium text-gray-900 capitalize">
                {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
              </p>
            </div>
          </div>
        )}
      </div>

      {subscription.cancel_at_period_end && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-orange-800">
              Your subscription will end on {StripeService.formatDate(subscription.current_period_end!)}
            </p>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
          <ExternalLink className="w-4 h-4" />
          <span>Manage Billing</span>
        </button>
        
        {!subscription.cancel_at_period_end && (
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Update Plan
          </button>
        )}
      </div>
    </motion.div>
  );
}