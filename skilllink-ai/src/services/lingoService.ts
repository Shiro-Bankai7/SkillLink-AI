import { supabase } from './supabase';

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  alternatives?: Array<{ language: string; confidence: number }>;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  speakers: number;
}

export class LingoService {
  private static apiKey = import.meta.env.VITE_LINGO_DOT_DEV_API_KEY;
  private static baseUrl = 'https://engine.lingo.dev';

  // Language detection
  static async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      if (!this.apiKey) {
        return { language: 'en', confidence: 0.5 };
      }

      // Use backend proxy to avoid CORS
      const response = await fetch('/api/lingo/recognizeLocale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        language: data.locale || 'en',
        confidence: data.confidence || 0.8,
        alternatives: data.alternatives,
      };
    } catch (error) {
      console.error('Language detection error:', error);
      return { language: 'en', confidence: 0.5 };
    }
  }

  // Translation
  static async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    try {
      if (!this.apiKey) {
        return {
          translatedText: text,
          sourceLanguage: sourceLanguage || 'en',
          targetLanguage,
          confidence: 0.5,
        };
      }

      // Auto-detect source language if not provided
      let detectedSource = sourceLanguage;
      if (!detectedSource) {
        const detection = await this.detectLanguage(text);
        detectedSource = detection.language;
      }

      // Use backend proxy for translation
      const response = await fetch('/api/lingo/localizeText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLocale: detectedSource,
          targetLocale: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        translatedText: data.localizedText || text,
        sourceLanguage: detectedSource || 'en',
        targetLanguage,
        confidence: data.confidence || 0.8,
      };
    } catch (error) {
      console.error('Translation error:', error);
      return {
        translatedText: text,
        sourceLanguage: sourceLanguage || 'en',
        targetLanguage,
        confidence: 0.5,
      };
    }
  }

  // Get supported languages
  static getSupportedLanguages(): SupportedLanguage[] {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', difficulty: 'medium', speakers: 1500 },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', difficulty: 'easy', speakers: 500 },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', difficulty: 'medium', speakers: 280 },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', difficulty: 'hard', speakers: 100 },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', difficulty: 'medium', speakers: 65 },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', difficulty: 'medium', speakers: 260 },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', difficulty: 'very-hard', speakers: 918 },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', difficulty: 'very-hard', speakers: 125 },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', difficulty: 'very-hard', speakers: 77 },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', difficulty: 'very-hard', speakers: 258 },
    ];
  }

  // Language learning recommendations
  static async getLanguageLearningRecommendations(userId: string): Promise<{
    recommended: SupportedLanguage[];
    reasons: string[];
  }> {
    try {
      // Get user's current skills and interests
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills, lookingfor, location')
        .eq('id', userId)
        .single();

      const supportedLanguages = this.getSupportedLanguages();
      
      // Basic recommendation logic
      let recommended: SupportedLanguage[] = [];
      let reasons: string[] = [];

      // Recommend based on location
      if (profile?.location) {
        const location = profile.location.toLowerCase();
        if (location.includes('spain') || location.includes('mexico') || location.includes('latin')) {
          recommended.push(supportedLanguages.find(l => l.code === 'es')!);
          reasons.push('Spanish is widely spoken in your region');
        }
        if (location.includes('france') || location.includes('canada')) {
          recommended.push(supportedLanguages.find(l => l.code === 'fr')!);
          reasons.push('French is relevant to your location');
        }
      }

      // Recommend easy languages for beginners
      if (recommended.length < 3) {
        const easyLanguages = supportedLanguages.filter(l => l.difficulty === 'easy');
        recommended.push(...easyLanguages.slice(0, 3 - recommended.length));
        reasons.push('These languages are easier for English speakers to learn');
      }

      // Recommend popular languages
      if (recommended.length < 3) {
        const popularLanguages = supportedLanguages
          .sort((a, b) => b.speakers - a.speakers)
          .slice(0, 3 - recommended.length);
        recommended.push(...popularLanguages);
        reasons.push('These are the most widely spoken languages globally');
      }

      return { recommended: recommended.slice(0, 3), reasons };
    } catch (error) {
      console.error('Error getting language recommendations:', error);
      return {
        recommended: this.getSupportedLanguages().slice(0, 3),
        reasons: ['Popular languages for skill exchange'],
      };
    }
  }

  // Track language learning progress
  static async trackLanguagePractice(
    userId: string,
    languageCode: string,
    activityType: 'session' | 'exchange' | 'practice',
    duration: number
  ): Promise<void> {
    try {
      await supabase.from('language_practice_log').insert({
        user_id: userId,
        language_code: languageCode,
        activity_type: activityType,
        duration_minutes: duration,
        practiced_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking language practice:', error);
    }
  }

  // Get language learning stats
  static async getLanguageStats(userId: string): Promise<{
    totalPracticeTime: number;
    languagesStudied: number;
    favoriteLanguage: string;
    weeklyProgress: Array<{ date: string; minutes: number }>;
  }> {
    try {
      const { data: practices } = await supabase
        .from('language_practice_log')
        .select('*')
        .eq('user_id', userId)
        .gte('practiced_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!practices || practices.length === 0) {
        return {
          totalPracticeTime: 0,
          languagesStudied: 0,
          favoriteLanguage: 'en',
          weeklyProgress: [],
        };
      }

      const totalPracticeTime = practices.reduce((sum, p) => sum + p.duration_minutes, 0);
      const languagesStudied = new Set(practices.map(p => p.language_code)).size;
      
      // Find favorite language
      const languageCounts = practices.reduce((acc, p) => {
        acc[p.language_code] = (acc[p.language_code] || 0) + p.duration_minutes;
        return acc;
      }, {} as Record<string, number>);
      
      const favoriteLanguage = (Object.entries(languageCounts) as Array<[string, number]>)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'en';

      // Weekly progress
      const weeklyProgress = this.calculateWeeklyProgress(practices);

      return {
        totalPracticeTime,
        languagesStudied,
        favoriteLanguage,
        weeklyProgress,
      };
    } catch (error) {
      console.error('Error getting language stats:', error);
      return {
        totalPracticeTime: 0,
        languagesStudied: 0,
        favoriteLanguage: 'en',
        weeklyProgress: [],
      };
    }
  }

  private static calculateWeeklyProgress(practices: any[]): Array<{ date: string; minutes: number }> {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayPractices = practices.filter(p => 
        p.practiced_at.split('T')[0] === date
      );
      const minutes = dayPractices.reduce((sum, p) => sum + p.duration_minutes, 0);
      return { date, minutes };
    });
  }

  // Real-time voice translation for sessions
  static async translateVoiceMessage(
    audioBlob: Blob,
    targetLanguage: string
  ): Promise<{ transcript: string; translation: string; confidence: number }> {
    try {
      // This would integrate with a speech-to-text service
      // For now, return mock data
      return {
        transcript: 'Hello, how are you today?',
        translation: targetLanguage === 'es' ? 'Hola, ¿cómo estás hoy?' : 'Hello, how are you today?',
        confidence: 0.85,
      };
    } catch (error) {
      console.error('Voice translation error:', error);
      return {
        transcript: '',
        translation: '',
        confidence: 0,
      };
    }
  }
}