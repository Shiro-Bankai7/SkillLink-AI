// utils/lingo.ts

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  speakers: number; // in millions
  countries: string[];
  learningResources: {
    apps: string[];
    websites: string[];
    books: string[];
  };
}

export const supportedLanguages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    difficulty: 'medium',
    speakers: 1500,
    countries: ['United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand'],
    learningResources: {
      apps: ['Duolingo', 'Babbel', 'Rosetta Stone'],
      websites: ['BBC Learning English', 'EnglishCentral', 'FluentU'],
      books: ['English Grammar in Use', 'Oxford English Dictionary']
    }
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    difficulty: 'easy',
    speakers: 500,
    countries: ['Spain', 'Mexico', 'Argentina', 'Colombia', 'Peru'],
    learningResources: {
      apps: ['Duolingo', 'Babbel', 'SpanishPod101'],
      websites: ['SpanishDict', 'Conjuguemos', 'News in Slow Spanish'],
      books: ["Madrigal's Magic Key to Spanish", 'First Spanish Reader']
    }
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    difficulty: 'medium',
    speakers: 280,
    countries: ['France', 'Canada', 'Belgium', 'Switzerland', 'Morocco'],
    learningResources: {
      apps: ['Duolingo', 'Babbel', 'FrenchPod101'],
      websites: ['TV5Monde', 'RFI Savoirs', 'Bonjour de France'],
      books: ['Le Petit Prince', 'Bescherelle']
    }
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    difficulty: 'hard',
    speakers: 100,
    countries: ['Germany', 'Austria', 'Switzerland', 'Luxembourg'],
    learningResources: {
      apps: ['Duolingo', 'Babbel', 'GermanPod101'],
      websites: ['Deutsche Welle', 'Goethe Institut', 'IchLiebeGerman'],
      books: ['German Grammar Drills', 'Der Die Das']
    }
  },
  {
    code: 'zh',
    name: 'Mandarin Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    difficulty: 'very-hard',
    speakers: 918,
    countries: ['China', 'Taiwan', 'Singapore'],
    learningResources: {
      apps: ['HelloChinese', 'ChineseSkill', 'Pleco'],
      websites: ['ChinesePod', 'YoyoChinese', 'FluentU Chinese'],
      books: ['Integrated Chinese', 'New Practical Chinese Reader']
    }
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    difficulty: 'very-hard',
    speakers: 125,
    countries: ['Japan'],
    learningResources: {
      apps: ['Duolingo', 'WaniKani', 'JapanesePod101'],
      websites: ["Tae Kim's Guide", 'JapanesePod101', 'NHK World'],
      books: ['Genki', 'Minna no Nihongo']
    }
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    difficulty: 'very-hard',
    speakers: 77,
    countries: ['South Korea', 'North Korea'],
    learningResources: {
      apps: ['Duolingo', 'Memrise', 'KoreanClass101'],
      websites: ['Talk To Me In Korean', 'How to Study Korean', 'KoreanClass101'],
      books: ['Korean Grammar in Use', 'Integrated Korean']
    }
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    difficulty: 'medium',
    speakers: 260,
    countries: ['Brazil', 'Portugal', 'Angola', 'Mozambique'],
    learningResources: {
      apps: ['Duolingo', 'Babbel', 'PortuguesePod101'],
      websites: ['Conjuguemos', 'Practice Portuguese', 'PortuguesePod101'],
      books: ['Portuguese Grammar', 'Ponto de Encontro']
    }
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    difficulty: 'medium',
    speakers: 65,
    countries: ['Italy', 'San Marino', 'Vatican City', 'Switzerland'],
    learningResources: {
      apps: ['Duolingo', 'Babbel', 'ItalianPod101'],
      websites: ['ItalianPod101', 'Conjuguemos', 'News in Slow Italian'],
      books: ['Italian Grammar', 'Nuovo Espresso']
    }
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    difficulty: 'very-hard',
    speakers: 258,
    countries: ['Russia', 'Belarus', 'Kazakhstan', 'Kyrgyzstan'],
    learningResources: {
      apps: ['Duolingo', 'Babbel', 'RussianPod101'],
      websites: ['RussianPod101', 'Red Kalinka', 'Russian for Everyone'],
      books: ['The New Penguin Russian Course', 'Russian Grammar']
    }
  }
];

export class Lingo {
  static getLanguage(code: string) {
    return supportedLanguages.find(lang => lang.code === code);
  }
  static getLanguagesByDifficulty(difficulty: Language['difficulty']) {
    return supportedLanguages.filter(lang => lang.difficulty === difficulty);
  }
  static getPopularLanguages(limit: number = 5) {
    return supportedLanguages.sort((a, b) => b.speakers - a.speakers).slice(0, limit);
  }
  static getRecommendedForEnglishSpeakers() {
    return supportedLanguages.filter(lang => ['es', 'fr', 'it', 'pt'].includes(lang.code));
  }
  static getDifficultyDescription(difficulty: Language['difficulty']) {
    const descriptions = {
      'easy': 'Easy - Similar grammar and vocabulary to English. 600-750 hours to fluency.',
      'medium': 'Medium - Some grammatical differences. 900-1100 hours to fluency.',
      'hard': 'Hard - Significant grammatical differences. 1100-1800 hours to fluency.',
      'very-hard': 'Very Hard - Major differences in writing system and grammar. 2200+ hours to fluency.'
    };
    return descriptions[difficulty];
  }
  static getEstimatedLearningTime(difficulty: Language['difficulty']) {
    const timeMap = {
      'easy': 675,
      'medium': 1000,
      'hard': 1450,
      'very-hard': 2200
    };
    return timeMap[difficulty];
  }
  static searchLanguages(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return supportedLanguages.filter(lang =>
      lang.name.toLowerCase().includes(lowercaseQuery) ||
      lang.nativeName.toLowerCase().includes(lowercaseQuery) ||
      lang.countries.some(country => country.toLowerCase().includes(lowercaseQuery))
    );
  }
  static getLanguageStats() {
    const totalSpeakers = supportedLanguages.reduce((sum, lang) => sum + lang.speakers, 0);
    const difficultyDistribution = supportedLanguages.reduce((acc, lang) => {
      acc[lang.difficulty] = (acc[lang.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      totalLanguages: supportedLanguages.length,
      totalSpeakers,
      difficultyDistribution,
      mostSpoken: supportedLanguages.reduce((prev, current) => prev.speakers > current.speakers ? prev : current),
      easiestToLearn: supportedLanguages.filter(lang => lang.difficulty === 'easy'),
      hardestToLearn: supportedLanguages.filter(lang => lang.difficulty === 'very-hard')
    };
  }
  static getLearningResources(languageCode: string) {
    const language = this.getLanguage(languageCode);
    return language?.learningResources || null;
  }
  static getCountriesForLanguage(languageCode: string) {
    const language = this.getLanguage(languageCode);
    return language?.countries || [];
  }
  static isLanguageSupported(languageCode: string) {
    return supportedLanguages.some(lang => lang.code === languageCode);
  }
  static getLanguageExchangePairs(userLanguage: string, targetLanguage: string) {
    const userLang = this.getLanguage(userLanguage);
    const targetLang = this.getLanguage(targetLanguage);
    if (!userLang || !targetLang) return null;
    return {
      userTeaches: userLang,
      userLearns: targetLang,
      compatibilityScore: this.calculateCompatibilityScore(userLang, targetLang),
      estimatedExchangeTime: Math.max(
        this.getEstimatedLearningTime(userLang.difficulty),
        this.getEstimatedLearningTime(targetLang.difficulty)
      )
    };
  }
  private static calculateCompatibilityScore(lang1: Language, lang2: Language): number {
    let score = 50;
    const difficultyDiff = Math.abs(
      ['easy', 'medium', 'hard', 'very-hard'].indexOf(lang1.difficulty) -
      ['easy', 'medium', 'hard', 'very-hard'].indexOf(lang2.difficulty)
    );
    score += (3 - difficultyDiff) * 10;
    const speakerRatio = Math.min(lang1.speakers, lang2.speakers) / Math.max(lang1.speakers, lang2.speakers);
    score += speakerRatio * 20;
    const commonCountries = lang1.countries.filter(country => lang2.countries.includes(country));
    score += commonCountries.length * 5;
    return Math.min(100, Math.max(0, score));
  }
}
