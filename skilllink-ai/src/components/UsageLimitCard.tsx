import React from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UsageLimitCardProps {
  title: string;
  used: number;
  limit: number;
  unlimited: boolean;
  type: string;
  icon: React.ReactNode;
  color: string;
}

export default function UsageLimitCard({ 
  title, 
  used, 
  limit, 
  unlimited, 
  type, 
  icon, 
  color 
}: UsageLimitCardProps) {
  const percentage = unlimited ? 0 : (used / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit && !unlimited;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-6 shadow-sm border ${
        isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-orange-200 bg-orange-50' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{type}</p>
          </div>
        </div>
        
        {unlimited && (
          <div className="flex items-center space-x-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <Crown className="w-3 h-3" />
            <span>Pro</span>
          </div>
        )}
      </div>

      {unlimited ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">Unlimited</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-gray-600">Enjoy unlimited access with Pro</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {used} / {limit}
            </span>
            {isAtLimit && <AlertCircle className="w-5 h-5 text-red-500" />}
            {isNearLimit && !isAtLimit && <Clock className="w-5 h-5 text-orange-500" />}
          </div>

          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {limit - used} remaining this month
              </span>
              <span className={`font-medium ${
                isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {Math.round(percentage)}%
              </span>
            </div>
          </div>

          {isAtLimit && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                You've reached your monthly limit. Upgrade to Pro for unlimited access!
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700"
              >
                Upgrade Now →
              </Link>
            </div>
          )}

          {isNearLimit && !isAtLimit && (
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-800 mb-2">
                You're approaching your monthly limit. Consider upgrading to Pro!
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                View Plans →
              </Link>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}