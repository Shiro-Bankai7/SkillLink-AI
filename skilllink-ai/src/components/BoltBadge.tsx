import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface BoltBadgeProps {
  variant?: 'float' | 'corner' | 'footer' | 'pulse';
  className?: string;
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ variant = 'float', className = '' }) => {
  let animationProps = {};
  let style = '';

  switch (variant) {
    case 'corner':
      animationProps = {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        transition: { duration: 1, type: 'spring' }
      };
      style = 'fixed top-4 right-4 z-50';
      break;
    case 'footer':
      animationProps = {
        initial: { scale: 0.8, opacity: 0.5 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 1, repeat: Infinity, repeatType: 'reverse' }
      };
      style = 'mx-auto';
      break;
    case 'pulse':
      animationProps = {
        animate: { scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] },
        transition: { duration: 2, repeat: Infinity }
      };
      style = '';
      break;
    default:
      animationProps = {
        animate: { y: [0, -10, 0] },
        transition: { duration: 2, repeat: Infinity }
      };
      style = 'absolute left-1/2 -translate-x-1/2 -top-8';
  }

  return (
    <motion.div
      {...animationProps}
      className={`flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full shadow-lg font-semibold text-sm ${style} ${className}`}
      style={{ pointerEvents: 'auto' }}
    >
      <Zap className="w-4 h-4 text-yellow-500 animate-spin-slow" />
      Built with <span className="font-bold">⚡Bolt.new</span>
    </motion.div>
  );
};

export default BoltBadge;
