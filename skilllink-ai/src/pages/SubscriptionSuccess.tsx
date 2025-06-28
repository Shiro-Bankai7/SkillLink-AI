import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Crown, 
  ArrowRight, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { StripeService } from '../services/stripeService';
import { useAuth } from '../contexts/AuthContext';
import BoltBadge from '../components/BoltBadge';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      verifySubscription();
    }
  }, [user]);

  const verifySubscription = async () => {
    try {
      // Wait a moment for webhook processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userSubscription = await StripeService.getUserSubscription();
      
      if (userSubscription && userSubscription.subscription_status) {
        const activeStatuses = ['active', 'trialing'];
        if (activeStatuses.includes(userSubscription.subscription_status)) {
          setSubscription(userSubscription);
        } else {
          setError('Subscription verification pending. Please check back in a few minutes.');
        }
      } else {
        setError('Unable to verify subscription. Please contact support if this persists.');
      }
    } catch (err) {
      console.error('Error verifying subscription:', err);
      setError('Unable to verify subscription. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying your subscription...
          </h2>
          <p className="text-gray-600">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verification Issue
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={verifySubscription}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Animated BoltBadge */}
      <BoltBadge variant="pulse" className="top-8 right-8 absolute" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Pro! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your subscription is now active and you have access to all premium features.
          </p>
        </motion.div>

        {/* Subscription Details */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Crown className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Subscription Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-600 font-medium capitalize">
                    {subscription.subscription_status}
                  </span>
                </div>
              </div>
              
              {subscription.current_period_end && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Next Billing Date</h3>
                  <p className="text-gray-600">
                    {StripeService.formatDate(subscription.current_period_end)}
                  </p>
                </div>
              )}
              
              {subscription.payment_method_brand && subscription.payment_method_last4 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                  <p className="text-gray-600 capitalize">
                    {subscription.payment_method_brand} ending in {subscription.payment_method_last4}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Auto-Renewal</h3>
                <p className="text-gray-600">
                  {subscription.cancel_at_period_end ? 'Disabled' : 'Enabled'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Premium Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">What's New for You</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              'Unlimited AI coaching sessions',
              'Advanced analytics & insights',
              'Priority customer support',
              'Session recordings & replays',
              'Custom AI coach personalities',
              'Exclusive community features'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-4"
        >
          <button
            onClick={handleContinue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-gray-600 text-sm">
            Ready to unlock your full potential? Let's get started!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}