import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Laugh, 
  Star, 
  Clock, 
  TrendingUp, 
  Target,
  MessageCircle,
  Calendar,
  Zap,
  Filter,
  Search,
  MapPin,
  Award,
  ChevronRight,
  Heart,
  BookOpen,
  Globe,
  Crown,
  Gift,
  Sparkles,
  Brain,
  Mic,
  Video,
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Timer,
  Trophy,
  Users,
  Gamepad2,
  Lock
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { skillsDatabase, getSkillById } from '../data/skillsDatabase';
import { GeminiService } from '../services/geminiService';
import { tavusService } from '../services/tavusService';
import { useAuth } from '../contexts/AuthContext';
import BoltBadge from './BoltBadge';
import SillyLeaderboard, { type LeaderboardEntry } from './SillyLeaderboard';

interface SillyCoach {
  id: string;
  name: string;
  personality: string;
  avatar: string;
  specialty: string;
  catchphrase: string;
  funFacts: string[];
  sillyLevel: number;
  unlocked: boolean;
  description: string;
  voiceStyle: string;
  animations: string[];
  aiService: 'gemini' | 'elevenlabs' | 'tavus';
}

interface SillyGame {
  id: string;
  title: string;
  description: string;
  type: 'voice' | 'video' | 'text' | 'interactive';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  points: number;
  aiService: 'gemini' | 'elevenlabs' | 'tavus';
  completed: boolean;
  bestScore?: number;
}

export default function SillySkillMode() {
  const { user } = useAuth();
  const [selectedCoach, setSelectedCoach] = useState<SillyCoach | null>(null);
  const [activeGame, setActiveGame] = useState<SillyGame | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [sillyPoints, setSillyPoints] = useState(1250);
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameResponse, setGameResponse] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [gameScore, setGameScore] = useState(0);
  const [showTavusSession, setShowTavusSession] = useState(false);
  const [activeTavusConversation, setActiveTavusConversation] = useState<any>(null);

  const sillyCoaches: SillyCoach[] = [
    {
      id: '1',
      name: 'Captain Confidence',
      personality: 'Superhero motivator',
      avatar: '🦸‍♂️',
      specialty: 'Public Speaking',
      catchphrase: 'With great speaking comes great responsibility!',
      funFacts: [
        'Once gave a speech to a room full of rubber ducks',
        'Can make anyone laugh with terrible puns',
        'Believes every presentation needs a cape'
      ],
      sillyLevel: 8,
      unlocked: true,
      description: 'A superhero coach who makes public speaking feel like saving the world!',
      voiceStyle: 'Dramatic and heroic',
      animations: ['cape-flutter', 'power-pose', 'flying'],
      aiService: 'gemini'
    },
    {
      id: '2',
      name: 'Professor Giggles',
      personality: 'Mad scientist comedian',
      avatar: '🧪',
      specialty: 'Learning Techniques',
      catchphrase: 'Learning is my favorite experiment!',
      funFacts: [
        'Invented the laugh-o-meter',
        'Has 47 different types of silly putty',
        'Once taught a parrot to code in Python'
      ],
      sillyLevel: 9,
      unlocked: true,
      description: 'A wacky scientist who makes learning feel like a fun experiment!',
      voiceStyle: 'Excited and bubbly',
      animations: ['bubbling', 'explosion', 'eureka'],
      aiService: 'elevenlabs'
    },
    {
      id: '3',
      name: 'DJ Motivation',
      personality: 'Party DJ life coach',
      avatar: '🎧',
      specialty: 'Confidence Building',
      catchphrase: 'Turn up the volume on your potential!',
      funFacts: [
        'Can beatbox while giving advice',
        'Has a playlist for every emotion',
        'Once DJed a silent disco therapy session'
      ],
      sillyLevel: 7,
      unlocked: true,
      description: 'A DJ who mixes beats with life advice and makes confidence contagious!',
      voiceStyle: 'Rhythmic and energetic',
      animations: ['dancing', 'mixing', 'light-show'],
      aiService: 'tavus'
    },
    {
      id: '4',
      name: 'Chef Wisdom',
      personality: 'Cooking show host philosopher',
      avatar: '👨‍🍳',
      specialty: 'Life Skills',
      catchphrase: 'Life is like cooking - add more spice!',
      funFacts: [
        'Can make metaphors out of any recipe',
        'Believes every problem can be solved with soup',
        'Has a secret ingredient: laughter'
      ],
      sillyLevel: 6,
      unlocked: sillyPoints >= 500,
      description: 'A chef who serves up life lessons with a side of humor!',
      voiceStyle: 'Warm and nurturing',
      animations: ['cooking', 'tasting', 'serving'],
      aiService: 'gemini'
    },
    {
      id: '5',
      name: 'Space Cadet Sam',
      personality: 'Astronaut dreamer',
      avatar: '🚀',
      specialty: 'Goal Setting',
      catchphrase: 'Shoot for the stars, land on the moon!',
      funFacts: [
        'Practices zero-gravity presentations',
        'Has a pet alien named Zorp',
        'Believes every goal needs rocket fuel'
      ],
      sillyLevel: 10,
      unlocked: sillyPoints >= 1000,
      description: 'An astronaut coach who makes your dreams feel out of this world!',
      voiceStyle: 'Dreamy and cosmic',
      animations: ['floating', 'rocket-launch', 'star-gazing'],
      aiService: 'elevenlabs'
    },
    {
      id: '6',
      name: 'Ninja Sensei Silly',
      personality: 'Clumsy martial arts master',
      avatar: '🥷',
      specialty: 'Focus & Discipline',
      catchphrase: 'The way of the silly warrior is strong!',
      funFacts: [
        'Can meditate while juggling',
        'Trips over his own feet but never his words',
        'Teaches ancient art of "Laugh-Fu"'
      ],
      sillyLevel: 8,
      unlocked: sillyPoints >= 750,
      description: 'A ninja master who teaches focus through fun and fails!',
      voiceStyle: 'Zen but silly',
      animations: ['ninja-moves', 'meditation', 'stumbling'],
      aiService: 'tavus'
    }
  ];

  // Helper to play ElevenLabs TTS and stop on demand
  const elevenLabsAudioRef = useRef<HTMLAudioElement | null>(null);
  const stopElevenLabsAudio = () => {
    if (elevenLabsAudioRef.current) {
      elevenLabsAudioRef.current.pause();
      elevenLabsAudioRef.current.currentTime = 0;
      elevenLabsAudioRef.current = null;
    }
  };

  // Helper to play text as conversation using ElevenLabs
  const playElevenLabsConversation = async (text: string, voiceId = 'EXAVITQu4vr4xnSDxMaL') => {
    stopElevenLabsAudio();
    if (!text) return;
    // Split into sentences/parts for a more natural convo
    const parts = text.match(/[^.!?]+[.!?]+/g) || [text];
    for (const part of parts) {
      if (!part.trim()) continue;
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({ text: part.trim() })
        });
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          elevenLabsAudioRef.current = audio;
          await new Promise((resolve) => {
            audio.onended = resolve;
            audio.onerror = resolve;
            audio.play();
          });
        }
      } catch (err) {
        // fallback: skip
      }
      // If game ended/exited, break
      if (!activeGame) break;
    }
  };

  const sillyGames: SillyGame[] = [
    {
      id: '1',
      title: 'Superhero Speech Challenge',
      description: 'Practice dramatic speeches with Captain Confidence! Deliver heroic monologues and get AI feedback.',
      type: 'voice',
      difficulty: 'medium',
      duration: 10,
      points: 150,
      aiService: 'gemini',
      completed: false
    },
    {
      id: '2',
      title: 'Mad Science Explanation Lab',
      description: 'Explain complex topics in simple terms with Professor Giggles! Get voice coaching from ElevenLabs.',
      type: 'voice',
      difficulty: 'hard',
      duration: 15,
      points: 200,
      aiService: 'elevenlabs',
      completed: false
    },
    {
      id: '3',
      title: 'DJ Confidence Mixer',
      description: 'Practice confident speaking with rhythm and flow! Video session with DJ Motivation.',
      type: 'video',
      difficulty: 'medium',
      duration: 12,
      points: 175,
      aiService: 'tavus',
      completed: false
    },
    {
      id: '4',
      title: 'Cooking Up Courage',
      description: 'Learn to speak with confidence using cooking metaphors! Interactive text game with Chef Wisdom.',
      type: 'text',
      difficulty: 'easy',
      duration: 8,
      points: 100,
      aiService: 'gemini',
      completed: false
    },
    {
      id: '5',
      title: 'Zero Gravity Goal Setting',
      description: 'Set and present your goals in space! Voice practice with Space Cadet Sam.',
      type: 'voice',
      difficulty: 'hard',
      duration: 20,
      points: 250,
      aiService: 'elevenlabs',
      completed: false
    },
    {
      id: '6',
      title: 'Ninja Focus Challenge',
      description: 'Practice mindful speaking and concentration! Video meditation with Ninja Sensei Silly.',
      type: 'video',
      difficulty: 'medium',
      duration: 15,
      points: 180,
      aiService: 'tavus',
      completed: false
    },
    {
      id: '7',
      title: 'Silly Storytelling Sprint',
      description: 'Tell the most ridiculous story possible! AI judges creativity and delivery.',
      type: 'interactive',
      difficulty: 'easy',
      duration: 5,
      points: 75,
      aiService: 'gemini',
      completed: false
    },
    {
      id: '8',
      title: 'Accent Adventure',
      description: 'Practice different accents and speaking styles! Voice coaching with multiple AI personalities.',
      type: 'voice',
      difficulty: 'hard',
      duration: 18,
      points: 220,
      aiService: 'elevenlabs',
      completed: false
    },
    {
      id: '9',
      title: 'React Rocket Launch',
      description: 'Build and launch a React-powered rocket! Complete coding challenges and get AI feedback as you go.',
      type: 'interactive',
      difficulty: 'medium',
      duration: 15,
      points: 200,
      aiService: 'elevenlabs',
      completed: false
    },
    {
      id: '10',
      title: 'Space State Management',
      description: 'Manage your rocket’s state with React hooks! Solve state puzzles and get voice coaching.',
      type: 'voice',
      difficulty: 'hard',
      duration: 18,
      points: 250,
      aiService: 'elevenlabs',
      completed: false
    },
    {
      id: '11',
      title: 'Component Cosmos',
      description: 'Travel through the cosmos by composing React components! Each challenge unlocks a new planet.',
      type: 'interactive',
      difficulty: 'medium',
      duration: 20,
      points: 220,
      aiService: 'gemini',
      completed: false
    }
  ];

  useEffect(() => {
    fetchUserStats();
    fetchLeaderboard();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && activeGame) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeGame]);

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('silly_mode_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user stats:', error);
        return;
      }

      if (data) {
        setUserStats(data);
        setSillyPoints(data.total_points || 1250);
      } else {
        // Create initial stats
        const { data: newStats } = await supabase
          .from('silly_mode_stats')
          .insert({
            user_id: user.id,
            total_points: 1250,
            games_completed: 0,
            favorite_coach: 'Captain Confidence',
            streak_days: 0
          })
          .select()
          .single();
        
        if (newStats) {
          setUserStats(newStats);
        }
      }
    } catch (error) {
      console.error('Error with user stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Step 1: Fetch top 10 silly_mode_stats
      const { data: stats, error: statsError } = await supabase
        .from('silly_mode_stats')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10);

      if (statsError) {
        console.error('Error fetching leaderboard:', statsError);
        return;
      }

      // Step 2: Fetch corresponding profiles
      const userIds = stats?.map((entry) => entry.user_id) || [];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id,email')
          .in('id', userIds);
        if (!profilesError && profiles) {
          profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
        }
      }

      // Step 3: Merge data
      const leaderboardData: LeaderboardEntry[] = stats?.map((entry, index) => {
        const profile = profilesMap[entry.user_id];
        return {
          id: entry.id,
          user_id: entry.user_id,
          username: profile?.email || entry.user_id?.slice(0, 8) || 'Anonymous',
          total_points: entry.total_points || 0,
          games_completed: entry.games_completed || 0,
          favorite_coach: entry.favorite_coach || 'Captain Confidence',
          streak_days: entry.streak_days || 0,
          avatar: (profile?.email ? profile.email.substring(0, 2).toUpperCase() : entry.user_id?.slice(0, 2).toUpperCase() || 'AN'),
          rank: index + 1
        };
      }) || [];

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const startGame = async (game: SillyGame) => {
    setActiveGame(game);
    setGameTime(0);
    setIsPlaying(true);
    setGameScore(0);
    setGameResponse('');
    setUserInput('');

    // Initialize game based on AI service
    if (game.aiService === 'gemini') {
      await startGeminiGame(game);
    } else if (game.aiService === 'elevenlabs') {
      await startElevenLabsGame(game);
    } else if (game.aiService === 'tavus') {
      await startTavusGame(game);
    }
  };

  const startGeminiGame = async (game: SillyGame) => {
    setIsLoading(true);
    try {
      const coach = sillyCoaches.find(c => c.specialty.toLowerCase().includes(game.title.toLowerCase().split(' ')[0])) || sillyCoaches[0];
      const prompt = `You are ${coach.name}, ${coach.personality}. ${coach.catchphrase} 
      
      Start the "${game.title}" game. ${game.description}
      
      Be silly, encouraging, and fun! Give the user a creative challenge or prompt to begin the game. 
      Keep your response under 100 words and end with a specific task or question for the user.`;

      const response = await GeminiService.generateResponse(prompt);
      setGameResponse(response.text);
    } catch (error) {
      console.error('Error starting Gemini game:', error);
      setGameResponse("Let's start this silly adventure! What would you like to practice today?");
    } finally {
      setIsLoading(false);
    }
  };

  const startElevenLabsGame = async (game: SillyGame) => {
    setIsLoading(true);
    stopElevenLabsAudio();
    try {
      const coach = sillyCoaches.find(c => c.aiService === 'elevenlabs') || sillyCoaches[1];
      const prompt = `You are ${coach.name}, ${coach.personality}. ${coach.catchphrase}\n\nStart the "${game.title}" voice coaching game. ${game.description}\n\nThis is a VOICE-focused game! Give the user specific speaking exercises, vocal warm-ups, or pronunciation challenges.\nBe energetic and encouraging! Include voice coaching tips and end with a specific vocal exercise.`;
      const response = await GeminiService.generateResponse(prompt);
      setGameResponse(`🎙️ ${coach.name}: ${response.text}`);
      await playElevenLabsConversation(response.text);
    } catch (error) {
      console.error('Error starting ElevenLabs game:', error);
      setGameResponse("🎙️ Let's warm up those vocal cords! Try saying 'Red leather, yellow leather' five times fast!");
    } finally {
      setIsLoading(false);
    }
  };

  const startTavusGame = async (game: SillyGame) => {
    setIsLoading(true);
    try {
      // For Tavus games, we'll create an actual video conversation
      const coach = sillyCoaches.find(c => c.aiService === 'tavus') || sillyCoaches[2];
      
      // Create Tavus conversation for video coaching
      const conversation = await tavusService.createConversation({
        replica_id: import.meta.env.VITE_TAVUS_REPLICA_ID || 'default_replica',
        persona_id: import.meta.env.VITE_TAVUS_PERSONA_ID || 'default_persona',
        conversation_name: `${game.title} with ${coach.name}`,
        conversational_context: `You are ${coach.name}, ${coach.personality}. ${coach.catchphrase} 
        
        You're running the "${game.title}" game. ${game.description}
        
        Be silly, fun, and encouraging! This is a video session, so use gestures and expressions. 
        Give the user interactive challenges and provide real-time feedback on their performance.`,
        custom_greeting: `Hey there! I'm ${coach.name}! Ready for some silly skill building? Let's make this fun!`,
        properties: {
          max_call_duration: game.duration * 60,
          enable_recording: true,
          enable_closed_captions: true,
          language: 'english'
        }
      });

      setActiveTavusConversation(conversation);
      setShowTavusSession(true);
      setGameResponse(`🎥 Starting video session with ${coach.name}! Get ready for some silly fun!`);
    } catch (error) {
      console.error('Error starting Tavus game:', error);
      setGameResponse("🎥 Video session starting soon! Get ready to have some silly fun on camera!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserResponse = async (input: string) => {
    if (!activeGame || !input.trim()) return;
    setIsLoading(true);
    setUserInput('');
    stopElevenLabsAudio();
    try {
      const coach = sillyCoaches.find(c => c.specialty.toLowerCase().includes(activeGame.title.toLowerCase().split(' ')[0])) || sillyCoaches[0];
      let prompt = `You are ${coach.name}, ${coach.personality}. The user just responded: "${input}"\n\nThis is part of the "${activeGame.title}" game. Give encouraging, silly feedback and either:\n1. Give them another challenge/task\n2. If they've done well, congratulate them and suggest ending the game\n\nBe fun, encouraging, and silly! Keep responses under 80 words.`;
      if (activeGame.aiService === 'elevenlabs') {
        prompt += " This is a VOICE game, so focus on vocal techniques and speaking skills.";
      } else if (activeGame.aiService === 'tavus') {
        prompt += " This is a VIDEO game, so mention body language and visual presentation.";
      }
      const response = await GeminiService.generateResponse(prompt);
      let formattedResponse = response.text;
      if (activeGame.aiService === 'elevenlabs') {
        formattedResponse = `🎙️ ${coach.name}: ${response.text}`;
        await playElevenLabsConversation(response.text);
      } else if (activeGame.aiService === 'tavus') {
        formattedResponse = `🎥 ${coach.name}: ${response.text}`;
      }
      setGameResponse(formattedResponse);
      const scoreIncrease = Math.floor(Math.random() * 30) + 20;
      setGameScore(prev => prev + scoreIncrease);
    } catch (error) {
      console.error('Error processing user response:', error);
      setGameResponse("That's great! Keep going, you're doing amazing! 🎉");
    } finally {
      setIsLoading(false);
    }
  };

  const completeGame = async () => {
    if (!activeGame || !user) return;

    setIsPlaying(false);
    
    // Calculate final score
    const timeBonus = Math.max(0, (activeGame.duration * 60 - gameTime) * 2);
    const finalScore = gameScore + timeBonus;
    const pointsEarned = Math.floor(finalScore * (activeGame.points / 100));

    try {
      // Update user stats
      const newTotalPoints = sillyPoints + pointsEarned;
      const newGamesCompleted = (userStats?.games_completed || 0) + 1;

      await supabase
        .from('silly_mode_stats')
        .upsert({
          user_id: user.id,
          total_points: newTotalPoints,
          games_completed: newGamesCompleted,
          favorite_coach: selectedCoach?.name || 'Captain Confidence',
          streak_days: (userStats?.streak_days || 0) + 1,
          last_played: new Date().toISOString()
        });

      // Record game completion
      await supabase
        .from('silly_game_completions')
        .insert({
          user_id: user.id,
          game_id: activeGame.id,
          score: finalScore,
          points_earned: pointsEarned,
          duration: gameTime,
          ai_service: activeGame.aiService,
          completed_at: new Date().toISOString()
        });

      setSillyPoints(newTotalPoints);
      setUnlockedRewards([`${pointsEarned} Silly Points`, 'Game Completion Badge', `${activeGame.title} Master`]);
      
      // Refresh leaderboard
      await fetchLeaderboard();
      await fetchUserStats();
      
    } catch (error) {
      console.error('Error completing game:', error);
    }

    setActiveGame(null);
    setGameTime(0);
    setGameScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSillyLevelColor = (level: number) => {
    if (level >= 9) return 'text-purple-600 bg-purple-100';
    if (level >= 7) return 'text-pink-600 bg-pink-100';
    if (level >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAIServiceIcon = (service: string) => {
    switch (service) {
      case 'gemini': return '🤖';
      case 'elevenlabs': return '🎙️';
      case 'tavus': return '🎥';
      default: return '🤖';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Laugh className="w-6 h-6 text-pink-500" />
            <span>Silly Skill Mode</span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </h2>
          <p className="text-gray-600">Learn with laughter! Real AI sessions, games, and silly challenges 🎉</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span className="font-bold">{sillyPoints}</span>
              <span className="text-sm">Silly Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Random BoltBadge floating in SillySkillMode header */}
      <BoltBadge variant="float" className="top-0 right-1/4 absolute" />

      {/* Active Game Session */}
      {activeGame && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 rounded-xl p-6 border-2 border-dashed border-pink-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Gamepad2 className="w-5 h-5 text-purple-600" />
                <span>{activeGame.title}</span>
                <span className="text-sm">{getAIServiceIcon(activeGame.aiService)}</span>
              </h3>
              <p className="text-gray-600">{activeGame.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{formatTime(gameTime)}</div>
              <div className="text-sm text-gray-500">Score: {gameScore}</div>
            </div>
          </div>

          {/* Game Interface */}
          <div className="space-y-4">
            {/* AI Response */}
            {gameResponse && (
              <div className="bg-white/80 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div className="flex-1">
                    <p className="text-gray-800">{gameResponse}</p>
                    {isLoading && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* User Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUserResponse(userInput)}
                placeholder="Type your response..."
                className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={() => handleUserResponse(userInput)}
                disabled={!userInput.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                Send
              </button>
            </div>

            {/* Game Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={completeGame}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Complete Game
              </button>
              <button
                onClick={() => setActiveGame(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Exit Game
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tavus Video Session Modal */}
      {showTavusSession && activeTavusConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-[80vw] h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <div className="font-semibold">Silly Video Session: {activeGame?.title}</div>
                <div className="text-xs text-gray-500">AI Service: Tavus Video Coaching</div>
              </div>
              <button
                onClick={() => {
                  setShowTavusSession(false);
                  setActiveTavusConversation(null);
                  if (activeGame) completeGame();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                End Session
              </button>
            </div>
            {activeTavusConversation.conversation_url && (
              <iframe
                src={activeTavusConversation.conversation_url}
                title="Silly Tavus Video Session"
                allow="camera; microphone; fullscreen; autoplay"
                className="flex-1 w-full h-full bg-black rounded-b-2xl"
                frameBorder={0}
              />
            )}
          </div>
        </div>
      )}

      {/* Games Grid */}
      {!activeGame && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-purple-600" />
            <span>Silly Practice Games</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sillyGames.map((game, index) => {
              const coach = sillyCoaches.find(c => c.aiService === game.aiService);
              const isLocked = coach && !coach.unlocked;
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer relative ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => !isLocked && startGame(game)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getAIServiceIcon(game.aiService)}</span>
                      <span className="font-bold text-gray-900">{game.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(game.difficulty)}`}>{game.difficulty}</span>
                      <span className="text-sm text-gray-500">{game.duration} min</span>
                      <span className="text-yellow-500 font-bold">+{game.points} pts</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{game.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {game.completed && (
                      <Trophy className="w-4 h-4 text-green-500" />
                    )}
                    {game.bestScore && (
                      <span className="text-xs text-gray-500">Best: {game.bestScore}</span>
                    )}
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-xl">
                      <Lock className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-500 text-sm">Unlock with more Silly Points!</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <SillyLeaderboard leaderboard={leaderboard} />
    </div>
  );
}