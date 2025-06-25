import { supabase } from './supabase';
import { showNotification } from '../utils/notification';

export type UserStreak = {
  id: string;
  user_id: string;
  current_streak: number;
  last_practice_date: string;
};

export class StreakService {
  static async getUserStreak(): Promise<UserStreak | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data: streaks, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      if (error) throw error;
      return streaks as UserStreak;
    } catch (error) {
      console.error('Error fetching user streak:', error);
      return null;
    }
  }

  static async updateDailyPracticeStreak(): Promise<UserStreak | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const today = new Date().toISOString().split('T')[0];
      const { data: existingStreak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      if (fetchError) throw fetchError;

      let newCurrentStreak = 0;
      if (existingStreak) {
        const lastPracticeDate = new Date(existingStreak.last_practice_date);
        const diffTime = Math.abs(new Date(today).getTime() - lastPracticeDate.getTime());
        const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          newCurrentStreak = existingStreak.current_streak + 1;
          showNotification('🔥 Daily Streak!', { body: `You are on a ${newCurrentStreak}-day practice streak!` });
        } else if (daysDiff > 1) {
          newCurrentStreak = 1;
          showNotification('Streak Reset', { body: 'Your daily practice streak has been reset.' });
        } else if (daysDiff === 0) {
          return existingStreak;
        }

        const { data: updatedStreak, error: updateError } = await supabase
          .from('user_streaks')
          .update({ current_streak: newCurrentStreak, last_practice_date: today })
          .eq('id', existingStreak.id)
          .select('*')
          .single();
        if (updateError) throw updateError;
        return updatedStreak;
      } else {
        // Create new streak
        showNotification('🔥 Streak Started!', { body: 'You started a new daily practice streak!' });
        const { data: newStreak, error: insertError } = await supabase
          .from('user_streaks')
          .insert({ user_id: user.user.id, current_streak: 1, last_practice_date: today })
          .select('*')
          .single();
        if (insertError) throw insertError;
        return newStreak;
      }
    } catch (error) {
      console.error('Error updating daily practice streak:', error);
      return null;
    }
  }

  static async updateWeeklySessionsStreak(): Promise<UserStreak | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data: sessionsThisWeek, error: fetchError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('created_at', new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString());
      if (fetchError) throw fetchError;
      if (!sessionsThisWeek || sessionsThisWeek.length === 0) {
        return null; // No sessions this week
      }
      const { data: existingStreak, error: streakFetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      if (streakFetchError) throw streakFetchError;

      let newCurrentStreak = 0;
      if (existingStreak) {
        const lastPracticeDate = new Date(existingStreak.last_practice_date);
        const diffTime = Math.abs(new Date().getTime() - lastPracticeDate.getTime());
        const weeksDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

        if (weeksDiff === 1) {
          newCurrentStreak = existingStreak.current_streak + 1;
          showNotification('⭐ Weekly Streak!', { body: `You are on a ${newCurrentStreak}-week session streak!` });
        } else if (weeksDiff > 1) {
          newCurrentStreak = 1;
          showNotification('Weekly Streak Reset', { body: 'Your weekly session streak has been reset.' });
        } else if (weeksDiff === 0) {
          return existingStreak;
        }

        const { data: updatedStreak, error: updateError } = await supabase
          .from('user_streaks')
          .update({ current_streak: newCurrentStreak, last_practice_date: new Date().toISOString().split('T')[0] })
          .eq('id', existingStreak.id)
          .select('*')
          .single();
        if (updateError) throw updateError;
        return updatedStreak;
      } else {
        // Create new streak
        showNotification('⭐ Streak Started!', { body: 'You started a new weekly session streak!' });
        const { data: newStreak, error: insertError } = await supabase
          .from('user_streaks')
          .insert({ user_id: user.user.id, current_streak: 1, last_practice_date: new Date().toISOString().split('T')[0] })
          .select('*')
          .single();
        if (insertError) throw insertError;
        return newStreak;
      }
    } catch (error) {
      console.error('Error updating weekly sessions streak:', error);
      return null;
    }
  }

  static async getStreakStats(): Promise<{ dailyStreak: number; weeklyStreak: number } | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data: streak, error } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.user.id)
        .single();
      if (error) throw error;
      return {
        dailyStreak: streak?.current_streak || 0,
        weeklyStreak: streak?.current_streak || 0
      };
    } catch (error) {
      console.error('Error fetching streak stats:', error);
      return null;
    }
  }

  static async checkStreakAchievements(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const stats = await this.getStreakStats();
      if (!stats) return;
      const achievements = [];
      if (stats.dailyStreak >= 7) {
        achievements.push({
          user_id: user.user.id,
          achievement_type: 'week_streak',
          title: 'Week Warrior',
          description: 'Practiced for 7 days in a row',
          icon: '🔥'
        });
        showNotification('🏅 Achievement Unlocked!', { body: 'Week Warrior: Practiced for 7 days in a row!' });
      }
      if (stats.dailyStreak >= 30) {
        achievements.push({
          user_id: user.user.id,
          achievement_type: 'month_streak',
          title: 'Monthly Master',
          description: 'Practiced for 30 days in a row',
          icon: '🏆'
        });
        showNotification('🏆 Achievement Unlocked!', { body: 'Monthly Master: Practiced for 30 days in a row!' });
      }
      if (stats.dailyStreak >= 100) {
        achievements.push({
          user_id: user.user.id,
          achievement_type: 'century_streak',
          title: 'Century Champion',
          description: 'Practiced for 100 days in a row',
          icon: '💯'
        });
        showNotification('💯 Achievement Unlocked!', { body: 'Century Champion: Practiced for 100 days in a row!' });
      }
      // ...existing code...
    } catch (error) {
      console.error('Error checking streak achievements:', error);
    }
  }
}