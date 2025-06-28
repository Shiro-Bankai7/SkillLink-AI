import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Clock, Award, ChevronRight } from 'lucide-react';
import { LingoService, SupportedLanguage } from '../services/lingoService';
import { useAuth } from '../contexts/AuthContext';

export default function LanguageLearningWidget() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<{
    recommended: SupportedLanguage[];
    reasons: string[];
  }>({ recommended: [], reasons: [] });
  const [stats, setStats] = useState({
    totalPracticeTime: 0,
    languagesStudied: 0,
    favoriteLanguage: 'en',
    weeklyProgress: [] as Array<{ date: string; minutes: number }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLanguageData();
    }
  }, [user]);

  const loadLanguageData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [recs, userStats] = await Promise.all([
        LingoService.getLanguageLearningRecommendations(user.id),
        LingoService.getLanguageStats(user.id),
      ]);

      setRecommendations(recs);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading language data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageByCode = (code: string) => {
    return LingoService.getSupportedLanguages().find(l => l.code === code);
  };

  const favoriteLanguage = getLanguageByCode(stats.favoriteLanguage);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Language Learning</h3>
        </div>
        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          View All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-indigo-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalPracticeTime}</div>
          <div className="text-sm text-gray-600">Minutes Practiced</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.languagesStudied}</div>
          <div className="text-sm text-gray-600">Languages Studied</div>
        </div>
      </div>

      {/* Favorite Language */}
      {favoriteLanguage && stats.totalPracticeTime > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Award className="w-4 h-4 text-yellow-500 mr-2" />
            Your Focus Language
          </h4>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">{favoriteLanguage.flag}</span>
            <div>
              <div className="font-medium text-gray-900">{favoriteLanguage.name}</div>
              <div className="text-sm text-gray-600">{favoriteLanguage.nativeName}</div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Progress */}
      {stats.weeklyProgress.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
            This Week's Progress
          </h4>
          <div className="flex items-end justify-between space-x-1 h-16">
            {stats.weeklyProgress.map((day, index) => {
              const maxMinutes = Math.max(...stats.weeklyProgress.map(d => d.minutes));
              const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-indigo-500 rounded-t-sm transition-all duration-300 min-h-[2px]"
                    style={{ height: `${Math.max(height, day.minutes > 0 ? 8 : 0)}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.recommended.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recommended Languages</h4>
          <div className="space-y-2">
            {recommendations.recommended.slice(0, 2).map((lang, index) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="font-medium text-gray-900">{lang.name}</div>
                    <div className="text-sm text-gray-600">
                      {lang.difficulty === 'easy' && '🟢 Easy'}
                      {lang.difficulty === 'medium' && '🟡 Medium'}
                      {lang.difficulty === 'hard' && '🟠 Hard'}
                      {lang.difficulty === 'very-hard' && '🔴 Very Hard'}
                      {' • '}
                      {lang.speakers}M speakers
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            ))}
          </div>
          
          {recommendations.reasons.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 {recommendations.reasons[0]}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}