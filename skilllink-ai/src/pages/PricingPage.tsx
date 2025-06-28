import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Star, 
  Zap, 
  Crown,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StripeService } from '../services/stripeService';
import { stripeProducts } from '../stripe-config';
import BoltBadge from '../components/BoltBadge';

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (user) {
      checkCurrentSubscription();
    }
  }, [user]);

  const checkCurrentSubscription = async () => {
    try {
      const [plan, isActive] = await Promise.all([
        StripeService.getCurrentPlan(),
        StripeService.hasActiveSubscription()
      ]);
      
      setCurrentPlan(plan);
      setHasActiveSubscription(isActive);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(priceId);
    
    try {
      const { url } = await StripeService.createCheckoutSession({
        priceId,
        mode,
        successUrl: `${window.location.origin}/subscription-success`,
        cancelUrl: `${window.location.origin}/pricing`
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (priceId: string) => {
    return currentPlan?.priceId === priceId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Random BoltBadge in corner */}
      <BoltBadge variant="corner" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Unlock Your Full Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan to accelerate your learning journey with AI-powered coaching and unlimited skill exchanges.
          </p>
        </motion.div>

        {/* Current Plan Status */}
        {hasActiveSubscription && currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-semibold">Current Plan: {currentPlan.name}</span>
            </div>
            <p className="text-green-700">You're all set! Enjoy your premium features.</p>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 relative"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                '3 AI coaching sessions/month',
                '5 skill exchanges/month',
                'Basic analytics',
                'Community access',
                'Mobile app access'
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-xl font-semibold cursor-not-allowed"
            >
              Current Plan
            </button>
          </motion.div>

          {/* Pro Plans */}
          {stripeProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative ${
                product.interval === 'year' 
                  ? 'border-indigo-500 ring-4 ring-indigo-100' 
                  : 'border-gray-200'
              }`}
            >
              {product.interval === 'year' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </span>
                </div>
              )}

              {isCurrentPlan(product.priceId) && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Current
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${product.price}
                  <span className="text-lg font-normal text-gray-600">
                    /{product.interval}
                  </span>
                </div>
                <p className="text-gray-600">{product.description}</p>
                {product.interval === 'year' && (
                  <p className="text-green-600 font-semibold text-sm mt-2">
                    Save 2 months compared to monthly!
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {product.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(product.priceId, product.mode)}
                disabled={loading === product.priceId || isCurrentPlan(product.priceId)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isCurrentPlan(product.priceId)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : product.interval === 'year'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {loading === product.priceId ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isCurrentPlan(product.priceId) ? (
                  'Current Plan'
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose Pro?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Unlimited AI Coaching',
                description: 'Get unlimited access to our advanced AI coaches for personalized feedback and improvement.'
              },
              {
                icon: Star,
                title: 'Advanced Analytics',
                description: 'Track your progress with detailed insights, performance charts, and personalized recommendations.'
              },
              {
                icon: Crown,
                title: 'Priority Support',
                description: 'Get priority customer support and access to new features before anyone else.'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'We offer a generous free plan that lets you try our core features. You can upgrade anytime to unlock premium features.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards and debit cards through our secure payment processor, Stripe.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}