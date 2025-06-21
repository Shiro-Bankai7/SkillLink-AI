import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Laugh, 
  Zap, 
  Star, 
  Play, 
  Pause, 
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Gift,
  Crown,
  Wand2,
  Rocket,
  Rainbow,
  Cake,
  Timer // Added Timer for clock icon
} from 'lucide-react';

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
}

interface SillySession {
  id: string;
  title: string;
  description: string;
  duration: number;
  funLevel: number;
  completed: boolean;
  rewards: string[];
}

export default function SillySkillMode() {
  const [selectedCoach, setSelectedCoach] = useState<SillyCoach | null>(null);
  const [activeSession, setActiveSession] = useState<SillySession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sillyPoints, setSillyPoints] = useState(1250);
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);

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
      animations: ['cape-flutter', 'power-pose', 'flying']
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
      animations: ['bubbling', 'explosion', 'eureka']
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
      animations: ['dancing', 'mixing', 'light-show']
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
      animations: ['cooking', 'tasting', 'serving']
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
      animations: ['floating', 'rocket-launch', 'star-gazing']
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
      animations: ['ninja-moves', 'meditation', 'stumbling']
    }
  ];

  const sillySessions: SillySession[] = [
    {
      id: '1',
      title: 'Superhero Speech Training',
      description: 'Learn to speak with the power of a superhero! Practice dramatic pauses and heroic declarations.',
      duration: 15,
      funLevel: 9,
      completed: false,
      rewards: ['Cape Badge', '50 Silly Points', 'Hero Voice Effect']
    },
    {
      id: '2',
      title: 'Mad Science Presentation Lab',
      description: 'Experiment with explosive presentation techniques! Mix confidence with creativity.',
      duration: 20,
      funLevel: 8,
      completed: false,
      rewards: ['Lab Goggles Badge', '75 Silly Points', 'Bubbling Sound Effect']
    },
    {
      id: '3',
      title: 'DJ Confidence Mixer',
      description: 'Drop the beat on your fears! Learn to speak with rhythm and flow.',
      duration: 18,
      funLevel: 7,
      completed: false,
      rewards: ['Headphones Badge', '60 Silly Points', 'Beat Drop Effect']
    },
    {
      id: '4',
      title: 'Cooking Up Courage',
      description: 'Recipe for confidence: Mix preparation with a dash of humor!',
      duration: 25,
      funLevel: 6,
      completed: false,
      rewards: ['Chef Hat Badge', '80 Silly Points', 'Sizzle Sound Effect']
    },
    {
      id: '5',
      title: 'Zero Gravity Goal Setting',
      description: 'Set goals that are out of this world! Learn to aim high and land softly.',
      duration: 30,
      funLevel: 10,
      completed: false,
      rewards: ['Rocket Badge', '100 Silly Points', 'Space Echo Effect']
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && activeSession) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSession]);

  const startSession = (session: SillySession) => {
    setActiveSession(session);
    setSessionTime(0);
    setIsPlaying(true);
  };

  const completeSession = () => {
    if (activeSession) {
      setSillyPoints(prev => prev + 50);
      setUnlockedRewards(prev => [...prev, ...activeSession.rewards]);
      setActiveSession(null);
      setIsPlaying(false);
      setSessionTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSillyLevelColor = (level: number) => {
    if (level >= 9) return 'text-purple-600 bg-purple-100';
    if (level >= 7) return 'text-pink-600 bg-pink-100';
    if (level >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getFunLevelStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < level / 2 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
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
          <p className="text-gray-600">Learn with laughter! Goofy coaches make skills stick better 🎉</p>
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

      {!selectedCoach ? (
        /* Coach Selection */
        <div className="space-y-6">
          {/* Silly Points Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-pink-100 via-purple-100 to-yellow-100 rounded-xl p-6 border-2 border-dashed border-pink-300"
          >
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-4">
                <Rainbow className="w-8 h-8 text-pink-500" />
                <Cake className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Silly Skill Mode!</h3>
              <p className="text-gray-700 mb-4">
                Where learning meets laughter! Our goofy coaches use humor, games, and silly scenarios 
                to make skill-building unforgettable. Earn Silly Points to unlock even more ridiculous coaches!
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Stress-free learning</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Smile className="w-4 h-4 text-yellow-500" />
                  <span>Memorable lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Confidence boost</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coach Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Silly Coach</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sillyCoaches.map((coach, index) => (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer ${
                    coach.unlocked
                      ? 'border-pink-200 hover:border-pink-400 hover:shadow-lg'
                      : 'border-gray-200 opacity-60'
                  }`}
                  onClick={() => coach.unlocked && setSelectedCoach(coach)}
                >
                  {!coach.unlocked && (
                    <div className="absolute inset-0 bg-gray-100/80 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <Crown className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">
                          Unlock with {coach.id === '4' ? '500' : coach.id === '5' ? '1000' : '750'} Silly Points
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2 animate-bounce">{coach.avatar}</div>
                    <h4 className="font-bold text-gray-900">{coach.name}</h4>
                    <p className="text-sm text-gray-600">{coach.personality}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-center ${getSillyLevelColor(coach.sillyLevel)}`}>
                      Silly Level: {coach.sillyLevel}/10
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-700 mb-1">Specialty:</p>
                      <p className="text-sm text-purple-600 font-medium">{coach.specialty}</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-gray-700 italic">"{coach.catchphrase}"</p>
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2">{coach.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Coach Session */
        <div className="space-y-6">
          {/* Coach Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-5xl animate-pulse">{selectedCoach.avatar}</div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedCoach.name}</h3>
                  <p className="text-pink-100">{selectedCoach.personality}</p>
                  <p className="text-sm text-pink-200 italic">"{selectedCoach.catchphrase}"</p>
                </div>
              </div>
              
              <div className="text-right">
                <button
                  onClick={() => setSelectedCoach(null)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Switch Coach
                </button>
              </div>
            </div>
          </motion.div>

          {!activeSession ? (
            /* Session Selection */
            <div className="space-y-6">
              {/* Fun Facts */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span>Fun Facts About {selectedCoach.name}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCoach.funFacts.map((fact, index) => (
                    <div key={index} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Sessions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Choose Your Silly Session</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sillySessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => startSession(session)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h5 className="font-semibold text-gray-900">{session.title}</h5>
                        <div className="flex space-x-1">
                          {getFunLevelStars(session.funLevel)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{session.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Timer className="w-4 h-4" />
                          <span>{session.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Laugh className="w-4 h-4" />
                          <span>Fun Level {session.funLevel}/10</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Rewards:</p>
                        <div className="flex flex-wrap gap-1">
                          {session.rewards.map((reward, idx) => (
                            <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                              {reward}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Session */
            <div className="space-y-6">
              {/* Session Progress */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{activeSession.title}</h4>
                    <p className="text-gray-600">{activeSession.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatTime(sessionTime)}</div>
                      <div className="text-sm text-gray-500">Session Time</div>
                    </div>
                    
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`p-3 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white`}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(sessionTime / (activeSession.duration * 60)) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress: {Math.round((sessionTime / (activeSession.duration * 60)) * 100)}%</span>
                  <span>Target: {activeSession.duration} minutes</span>
                </div>
              </div>

              {/* Silly Activity Area */}
              <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 rounded-xl p-8 border-2 border-dashed border-pink-300">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-bounce">{selectedCoach.avatar}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedCoach.name} is coaching you!
                  </h3>
                  
                  <div className="bg-white/80 rounded-lg p-6 mb-6">
                    <p className="text-lg text-gray-800 mb-4">
                      "Alright, my silly student! Let's make this session absolutely ridiculous and incredibly effective!"
                    </p>
                    <div className="flex justify-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>Having fun</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>Learning fast</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span>Building confidence</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-bold text-lg transition-colors">
                      Continue Silly Session! 🎉
                    </button>
                    
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={completeSession}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Complete Session
                      </button>
                      <button
                        onClick={() => setActiveSession(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        End Early
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Rewards Preview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  <span>Session Rewards</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeSession.rewards.map((reward, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">🎁</div>
                      <p className="text-sm font-medium text-gray-900">{reward}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unlocked Rewards Modal */}
      {unlockedRewards.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Congratulations!</h3>
            <p className="text-gray-600 mb-6">You've unlocked some silly rewards!</p>
            
            <div className="space-y-2 mb-6">
              {unlockedRewards.map((reward, index) => (
                <div key={index} className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-3">
                  <span className="font-medium text-gray-900">{reward}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setUnlockedRewards([])}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold"
            >
              Awesome! 🎊
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}