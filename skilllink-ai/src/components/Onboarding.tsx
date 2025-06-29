import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Star, ArrowRight, Brain, Users, Video, Award } from 'lucide-react';
import BoltBadge from './BoltBadge';

interface OnboardingSceneProps {
  onComplete: () => void;
}

export default function OnboardingScene({ onComplete }: OnboardingSceneProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const steps = [
    {
      id: 'lightning',
      duration: 2000,
      component: <LightningFlash />
    },
    {
      id: 'bolt-words',
      duration: 3000,
      component: <BoltWordsAnimation />
    },
    {
      id: 'skilllink-intro',
      duration: 4000,
      component: <SkillLinkIntro />
    },
    {
      id: 'features',
      duration: 3000,
      component: <FeaturesShowcase />
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setTimeout(onComplete, 1000);
      }
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 text-center max-w-4xl mx-auto px-8"
          >
            {steps[currentStep].component}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors text-sm"
      >
        Skip intro →
      </button>
    </div>
  );
}

// Lightning Flash Component
function LightningFlash() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative"
    >
      <motion.div
        className="text-yellow-300"
        animate={{ 
          filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 0.5, repeat: 3 }}
      >
        <Zap className="w-32 h-32 mx-auto" />
      </motion.div>
      
      {/* Lightning effect */}
      <motion.div
        className="absolute inset-0 bg-yellow-300/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 2, 1],
          opacity: [0, 0.8, 0]
        }}
        transition={{ duration: 1, repeat: 2 }}
      />
    </motion.div>
  );
}

// Bolt Words Animation Component
function BoltWordsAnimation() {
  const words = ['Built', 'with', 'Bolt.new'];
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-6xl md:text-8xl font-bold text-white"
      >
        {words.map((word, index) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.3,
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
            className="inline-block mr-6"
          >
            {word}
            {index === words.length - 1 && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="inline-block ml-4"
              >
                <Zap className="w-16 h-16 text-yellow-300 inline" />
              </motion.span>
            )}
          </motion.span>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="text-xl text-indigo-200"
      >
        The future of AI-powered development
      </motion.div>
    </div>
  );
}

// SkillLink Intro Component
function SkillLinkIntro() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, type: "spring" }}
        className="relative"
      >
        <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          SkillLink AI
        </h1>
        
        {/* Floating elements around the title */}
        <motion.div
          className="absolute -top-8 -left-8"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
        >
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </motion.div>
        
        <motion.div
          className="absolute -top-4 -right-12"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Star className="w-6 h-6 text-pink-300" />
        </motion.div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
      >
        Where AI meets human potential. Master any skill with personalized coaching, 
        connect with learners worldwide, and unlock your full potential.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="flex justify-center"
      >
        <BoltBadge variant="pulse" className="text-lg" />
      </motion.div>
    </div>
  );
}

// Features Showcase Component
function FeaturesShowcase() {
  const features = [
    { icon: Brain, title: 'AI Coaching', color: 'text-blue-400' },
    { icon: Users, title: 'Skill Exchange', color: 'text-green-400' },
    { icon: Video, title: 'Live Sessions', color: 'text-purple-400' },
    { icon: Award, title: 'Achievements', color: 'text-yellow-400' }
  ];

  return (
    <div className="space-y-12">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-white"
      >
        Everything you need to grow
      </motion.h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.2,
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
            className="text-center group"
          >
            <motion.div
              className={`w-16 h-16 mx-auto mb-4 ${feature.color} group-hover:scale-110 transition-transform`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <feature.icon className="w-full h-full" />
            </motion.div>
            <h3 className="text-white font-semibold">{feature.title}</h3>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="flex justify-center"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20">
          <span className="text-white font-medium flex items-center space-x-2">
            <span>Ready to begin your journey?</span>
            <ArrowRight className="w-5 h-5" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}