import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  message: string;
  usageInfo?: {
    used: number;
    limit: number;
    type: string;
  };
}

export default function UpgradePrompt({ isOpen, onClose, feature, message, usageInfo }: UpgradePromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Pro</h2>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Usage info */}
        {usageInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">This Month</span>
              <span className="text-sm text-gray-500">
                {usageInfo.used} / {usageInfo.limit} {usageInfo.type}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((usageInfo.used / usageInfo.limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Pro features */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-2" />
            What you get with Pro:
          </h3>
          <ul className="space-y-2">
            {[
              'Unlimited AI coaching sessions',
              'Unlimited skill exchanges',
              'Session recordings & replays',
              'Advanced analytics & insights',
              'Priority customer support',
              'Custom AI coach personalities'
            ].map((benefit, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <Link
            to="/pricing"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
            onClick={onClose}
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-4">
          30-day money-back guarantee • Cancel anytime
        </p>
      </motion.div>
    </div>
  );
}