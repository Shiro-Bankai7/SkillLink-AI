import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StripeService } from '../services/stripeService';
import { supabase } from '../services/supabase';

export interface SubscriptionLimits {
  aiCoachingSessions: { used: number; limit: number; unlimited: boolean };
  skillExchanges: { used: number; limit: number; unlimited: boolean };
  sessionRecordings: { enabled: boolean };
  advancedAnalytics: { enabled: boolean };
  prioritySupport: { enabled: boolean };
  customAICoaches: { enabled: boolean };
}

export interface UsageStats {
  aiCoachingSessionsThisMonth: number;
  skillExchangesThisMonth: number;
  lastResetDate: string;
}

export function useSubscriptionLimits() {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [limits, setLimits] = useState<SubscriptionLimits>({
    aiCoachingSessions: { used: 0, limit: 3, unlimited: false },
    skillExchanges: { used: 0, limit: 5, unlimited: false },
    sessionRecordings: { enabled: false },
    advancedAnalytics: { enabled: false },
    prioritySupport: { enabled: false },
    customAICoaches: { enabled: false },
  });
  const [usage, setUsage] = useState<UsageStats>({
    aiCoachingSessionsThisMonth: 0,
    skillExchangesThisMonth: 0,
    lastResetDate: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionAndLimits();
    }
  }, [user]);

  const checkSubscriptionAndLimits = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check subscription status from Stripe
      const hasActiveSub = await StripeService.hasActiveSubscription();
      setHasActiveSubscription(hasActiveSub);

      // Get current usage
      const currentUsage = await getCurrentUsage();
      setUsage(currentUsage);

      // Set limits based on subscription status
      if (hasActiveSub) {
        setLimits({
          aiCoachingSessions: { used: currentUsage.aiCoachingSessionsThisMonth, limit: 999, unlimited: true },
          skillExchanges: { used: currentUsage.skillExchangesThisMonth, limit: 999, unlimited: true },
          sessionRecordings: { enabled: true },
          advancedAnalytics: { enabled: true },
          prioritySupport: { enabled: true },
          customAICoaches: { enabled: true },
        });
      } else {
        setLimits({
          aiCoachingSessions: { used: currentUsage.aiCoachingSessionsThisMonth, limit: 3, unlimited: false },
          skillExchanges: { used: currentUsage.skillExchangesThisMonth, limit: 5, unlimited: false },
          sessionRecordings: { enabled: false },
          advancedAnalytics: { enabled: false },
          prioritySupport: { enabled: false },
          customAICoaches: { enabled: false },
        });
      }
    } catch (error) {
      console.error('Error checking subscription limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUsage = async (): Promise<UsageStats> => {
    if (!user) {
      return {
        aiCoachingSessionsThisMonth: 0,
        skillExchangesThisMonth: 0,
        lastResetDate: new Date().toISOString(),
      };
    }

    try {
      // Get sessions from current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: sessions } = await supabase
        .from('sessions')
        .select('type, status, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
        .eq('status', 'completed');

      const aiCoachingSessions = sessions?.filter(s => s.type === 'ai_coaching').length || 0;
      const skillExchanges = sessions?.filter(s => s.type === 'skill_exchange').length || 0;

      return {
        aiCoachingSessionsThisMonth: aiCoachingSessions,
        skillExchangesThisMonth: skillExchanges,
        lastResetDate: startOfMonth.toISOString(),
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        aiCoachingSessionsThisMonth: 0,
        skillExchangesThisMonth: 0,
        lastResetDate: new Date().toISOString(),
      };
    }
  };

  const canUseFeature = (feature: keyof SubscriptionLimits): boolean => {
    if (hasActiveSubscription) return true;

    const limit = limits[feature];
    if (typeof limit === 'object' && 'used' in limit && 'limit' in limit) {
      return limit.used < limit.limit;
    }
    if (typeof limit === 'object' && 'enabled' in limit) {
      return limit.enabled;
    }

    return false;
  };

  const getRemainingUsage = (feature: 'aiCoachingSessions' | 'skillExchanges'): number => {
    if (hasActiveSubscription) return 999;
    const limit = limits[feature];
    return Math.max(0, limit.limit - limit.used);
  };

  const getUsagePercentage = (feature: 'aiCoachingSessions' | 'skillExchanges'): number => {
    if (hasActiveSubscription) return 0;
    const limit = limits[feature];
    return (limit.used / limit.limit) * 100;
  };

  const incrementUsage = async (feature: 'aiCoachingSessions' | 'skillExchanges') => {
    if (hasActiveSubscription) return; // No limits for premium users

    const newUsage = { ...usage };
    if (feature === 'aiCoachingSessions') {
      newUsage.aiCoachingSessionsThisMonth += 1;
    } else if (feature === 'skillExchanges') {
      newUsage.skillExchangesThisMonth += 1;
    }
    setUsage(newUsage);

    // Update limits
    await checkSubscriptionAndLimits();
  };

  const showUpgradePrompt = (feature: string): string => {
    const prompts = {
      aiCoachingSessions: `You've reached your limit of ${limits.aiCoachingSessions.limit} AI coaching sessions this month. Upgrade to Pro for unlimited access!`,
      skillExchanges: `You've used all ${limits.skillExchanges.limit} skill exchanges this month. Upgrade to Pro for unlimited connections!`,
      sessionRecordings: 'Session recordings are available with Pro. Upgrade to save and review your sessions!',
      advancedAnalytics: 'Advanced analytics help you track your progress better. Available with Pro!',
      prioritySupport: 'Get priority support and faster response times with Pro!',
      customAICoaches: 'Create custom AI coaches tailored to your learning style with Pro!',
      elevenlabs: 'ElevenLabs premium voice AI is available with Pro! Upgrade to access advanced voice features.',
    };

    return prompts[feature as keyof typeof prompts] || 'Upgrade to Pro to unlock this feature!';
  };

  return {
    hasActiveSubscription,
    limits,
    usage,
    loading,
    canUseFeature,
    getRemainingUsage,
    getUsagePercentage,
    incrementUsage,
    showUpgradePrompt,
    refreshLimits: checkSubscriptionAndLimits,
  };
}