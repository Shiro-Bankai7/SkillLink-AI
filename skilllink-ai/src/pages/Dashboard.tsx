import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Users, 
  TrendingUp, 
  Award, 
  MessageSquare, 
  Calendar,
  BookOpen,
  Mic,
  Camera,
  Play,
  Pause,
  Square,
  Settings,
  Bell,
  Search,
  Filter,
  Star,
  Clock,
  Target,
  Brain,
  Zap,
  Globe,
  ChevronRight,
  Plus,
  BarChart3,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Dialog } from '@headlessui/react';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import ConversationCoach from '../components/AICoachingSession';
import SkillExchange from '../components/SkillExchange';
import SmartMatchMaking from '../components/SmartMatchMaking';
import SillySkillMode from '../components/SillySkillMode';
import SessionReplays from '../components/SessionReplays';
import VideoAnalysis from '../components/VideoAnalysis';
import VoiceHelp from '../components/VoiceHelp';
import TavusConversationSession from '../components/TavusConversationSession';
import UserProfile from '../components/UserProfile';
import { showNotification } from '../utils/notification';
import { StreakService } from '../services/streakService';
import BoltBadge from '../components/BoltBadge';
import Call from '../components/Call';

interface UserProfile {
  id: string;
  bio: string;
  skills: string[];
  lookingfor: string | string[];
  role: 'learner' | 'teacher' | 'both';
  plan: string;
}

interface Session {
  id: string;
  title: string;
  type: 'ai_coaching' | 'skill_exchange' | 'group_session';
  status: 'upcoming' | 'in_progress' | 'completed';
  date: string;
  duration: number;
  participants?: number;
  skill: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [streakData, setStreakData] = useState<{ dailyStreak: number; weeklyStreak: number } | null>(null);
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first AI coaching session',
      icon: '🎯',
      earned: true,
      progress: 100
    },
    {
      id: '2',
      title: 'Skill Sharer',
      description: 'Teach 5 different skills',
      icon: '🎓',
      earned: false,
      progress: 60
    },
    {
      id: '3',
      title: 'Community Builder',
      description: 'Help 10 learners improve their skills',
      icon: '🤝',
      earned: false,
      progress: 30
    }
  ]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('skilllink_onboarding_complete') !== 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const onboardingSteps = [
    {
      title: 'Welcome to SkillLink AI!',
      description: 'SkillLink AI is your gamified platform for real-time skill coaching, peer barter, and AI-powered feedback. Let\'s take a quick tour!'
    },
    {
      title: 'AI Coaching Sessions',
      description: 'Practice with our AI coach for instant feedback on your speaking, body language, and more. Try the "AI Coaching" tab to get started.'
    },
    {
      title: 'Skill Exchange',
      description: 'Barter your skills 1-on-1 with peers via live video calls. Browse the Skill Exchange tab to find a match.'
    },
    {
      title: 'Track Your Progress',
      description: 'Earn achievements, track your growth, and unlock new features as you learn and teach!'
    }
  ];

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to SkillLink!', body: 'Start your first AI coaching session.' },
    { id: 2, title: 'Streak Unlocked!', body: 'You are on a 3-day practice streak.' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Add state for real progress and achievements
  const [userProgress, setUserProgress] = useState<any>(null);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [showQuickSession, setShowQuickSession] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
    fetchStreakData();
    fetchUserProgress();
    fetchUserAchievements();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchSessions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .or(`user_id.eq.${user.id},requester_id.eq.${user.id},provider_id.eq.${user.id},partner_id.eq.${user.id}`);
    if (!error && data) {
      setSessions(data);
    }
  };

  const fetchStreakData = async () => {
    try {
      const data = await StreakService.getStreakStats();
      setStreakData(data);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  // Fetch real progress data (example: from Supabase or your backend)
  const fetchUserProgress = async () => {
    if (!user) return;
    // Use profile.skills as the base skill list
    let skillNames: string[] = Array.isArray(profile?.skills) ? [...profile.skills] : [];
    // Add default skills if not present
    ["Design Thinking", "Effective Leadership"].forEach((defaultSkill) => {
      if (!skillNames.some(s => s.toLowerCase() === defaultSkill.toLowerCase())) {
        skillNames.push(defaultSkill);
      }
    });
    // Build skills array with progress
    const skills = skillNames.map(skill => {
      const completedCount = sessions.filter(s => s.skill?.toLowerCase() === skill.toLowerCase() && s.status === 'completed').length;
      // Example: each completed session = +10%, max 100%
      const level = Math.min(100, completedCount * 10);
      const change = completedCount > 0 ? `+${completedCount * 10}%` : '+0%';
      return { skill, level, change };
    });
    setUserProgress({ skills });
  };

  // Fetch real achievements (example: from Supabase or calculate)
  const fetchUserAchievements = async () => {
    if (!user) return;
    // Example: fetch from an 'achievements' table
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id);
    if (!error && data) {
      setUserAchievements(data);
    } else {
      // Fallback: calculate based on app criteria
      const achievements: Achievement[] = [];
      // First Steps: completed at least 1 AI coaching session
      if (sessions.some(s => s.type === 'ai_coaching' && s.status === 'completed')) {
        achievements.push({
          id: '1',
          title: 'First Steps',
          description: 'Complete your first AI coaching session',
          icon: '🎯',
          earned: true,
          progress: 100
        });
      }
      // Skill Sharer: taught 5 different skills
      const taughtSkills = new Set(sessions.filter(s => s.type === 'skill_exchange' && s.status === 'completed').map(s => s.skill));
      achievements.push({
        id: '2',
        title: 'Skill Sharer',
        description: 'Teach 5 different skills',
        icon: '🎓',
        earned: taughtSkills.size >= 5,
        progress: Math.min(100, (taughtSkills.size / 5) * 100)
      });
      // Community Builder: helped 10 learners
      const learnersHelped = sessions.filter(s => s.type === 'skill_exchange' && s.status === 'completed').length;
      achievements.push({
        id: '3',
        title: 'Community Builder',
        description: 'Help 10 learners improve their skills',
        icon: '🤝',
        earned: learnersHelped >= 10,
        progress: Math.min(100, (learnersHelped / 10) * 100)
      });
      // Streaks
      if (streakData?.dailyStreak && streakData.dailyStreak >= 7) {
        achievements.push({
          id: '4',
          title: 'Week Warrior',
          description: 'Practiced for 7 days in a row',
          icon: '🔥',
          earned: true,
          progress: 100
        });
      }
      if (streakData?.dailyStreak && streakData.dailyStreak >= 30) {
        achievements.push({
          id: '5',
          title: 'Monthly Master',
          description: 'Practiced for 30 days in a row',
          icon: '🏆',
          earned: true,
          progress: 100
        });
      }
      setUserAchievements(achievements);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_coaching': return <Brain className="w-4 h-4" />;
      case 'skill_exchange': return <Users className="w-4 h-4" />;
      case 'group_session': return <Globe className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const handleNextOnboarding = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowOnboarding(false);
      localStorage.setItem('skilllink_onboarding_complete', 'true');
    }
  };

  const [showCreateTavus, setShowCreateTavus] = useState(false);
  const [newTavusTopic, setNewTavusTopic] = useState('');
  const [newTavusType, setNewTavusType] = useState<'teaching' | 'coaching'>('teaching');
  const [createdTavus, setCreatedTavus] = useState<null | { topic: string; type: 'teaching' | 'coaching' }>(null);

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <Dialog open={showOnboarding} onClose={() => {}} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-40" />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 z-10">
              <Dialog.Title className="text-2xl font-bold mb-2 text-indigo-700">
                {onboardingSteps[onboardingStep].title}
              </Dialog.Title>
              <Dialog.Description className="mb-6 text-gray-600">
                {onboardingSteps[onboardingStep].description}
              </Dialog.Description>
              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  {onboardingSteps.map((_, idx) => (
                    <span key={idx} className={`h-2 w-2 rounded-full ${idx === onboardingStep ? 'bg-indigo-500' : 'bg-gray-300'}`}></span>
                  ))}
                </div>
                <button
                  onClick={handleNextOnboarding}
                  className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {onboardingStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">SkillLink AI</h1>
              </div>
              
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-1">
                {['overview', 'sessions', 'practice', 'community', 'progress'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search - Hidden on mobile */}
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills, sessions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Notifications */}
              <button
                className="relative p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                )}
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="p-4 border-b font-semibold text-gray-900">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-gray-500 text-sm">No notifications.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                            <div className="font-medium text-gray-800">{notif.title}</div>
                            <div className="text-gray-600 text-sm">{notif.body}</div>
                          </div>
                        ))

                      )
                      }
                    </div>
                  </div>
                )}
              </button>
            </div>

            {/* Profile and Menu */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowProfile(true)}
                className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4 text-white" />
                </button>
                
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                {/* Desktop logout */}
                <button
                  onClick={logout}
                  className="hidden md:block text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-4">
                <div className="flex flex-col space-y-2">
                  {['overview', 'sessions', 'practice', 'community', 'progress'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors text-left ${
                        activeTab === tab
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md text-left"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {user?.email?.split('@')[0]}! 👋
              </h2>
              <p className="text-indigo-100 mb-4 sm:mb-6">
                Ready to level up your skills today? You have {sessions.filter(s => s.status === 'upcoming').length} upcoming sessions.
              </p>
              {streakData && (
                <div className="mb-4 sm:mb-6">
                  <p className="text-indigo-100 text-sm">
                    🔥 {streakData.dailyStreak} day streak • ⭐ {streakData.weeklyStreak} week streak
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setActiveTab('practice')}
                  className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Start AI Coaching</span>
                </button>
                <button 
                  onClick={() => setActiveTab('community')}
                  className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Find Skill Partners</span>
                </button>
              </div>
            </motion.div>

            {/* Voice Help AI Agent */}
            <VoiceHelp />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Sessions Completed', value: sessions.filter(s => s.status === 'completed').length.toString(), icon: Video, color: 'bg-blue-500' },
                { label: 'Skills Learned', value: '8', icon: BookOpen, color: 'bg-green-500' },
                { label: 'Hours Practiced', value: Math.floor(sessions.reduce((acc, s) => acc + s.duration, 0) / 60).toString(), icon: Clock, color: 'bg-purple-500' },
                { label: 'Daily Streak', value: streakData?.dailyStreak?.toString() || '0', icon: TrendingUp, color: 'bg-orange-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                      <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Upcoming Sessions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
                  <button 
                    onClick={() => setActiveTab('sessions')}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {sessions.filter(s => s.status === 'upcoming').slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getTypeIcon(session.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.date).toLocaleTimeString()} • {session.duration}min
                        </p>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-700">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {sessions.filter(s => s.status === 'upcoming').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming sessions</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Recent Achievements */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                  <button 
                    onClick={() => setActiveTab('progress')}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {userAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {achievement.title}
                        </p>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      {achievement.earned && (
                        <Award className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Random Session */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Random Session</h3>
              <p className="text-gray-600 mb-4 text-center">Jump into a live SkillLink video room with whiteboard and AI assistant for instant practice or peer exchange.</p>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                onClick={() => setShowQuickSession(true)}
              >
                Start Quick Session
              </button>
            </div>
            {showQuickSession && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowQuickSession(false)}
                  >
                    Close
                  </button>
                  <Call />
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Conversation Coach Studio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Conversation Coach</h2>
              <ConversationCoach />
            </motion.div>

            {/* Tavus Conversational AI Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">AI Conversation Sessions</h2>
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateTavus(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  + Create New Conversation
                </button>
              </div>
              {showCreateTavus && (
                <div className="mb-6 bg-gray-50 p-4 rounded-xl border flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic/Skill</label>
                    <input
                      type="text"
                      value={newTavusTopic}
                      onChange={e => setNewTavusTopic(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Python, Marketing, Public Speaking"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newTavusType}
                      onChange={e => setNewTavusType(e.target.value as 'teaching' | 'coaching')}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="teaching">Teach</option>
                      <option value="coaching">Learn</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setCreatedTavus({ topic: newTavusTopic, type: newTavusType })}
                    disabled={!newTavusTopic}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium mt-2 md:mt-0"
                  >
                    Start Session
                  </button>
                  <button
                    onClick={() => setShowCreateTavus(false)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Teaching Sessions */}
                {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && profile.skills.map((skill) => (
                  <div key={skill}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Teach: {skill}</h3>
                    <TavusConversationSession
                      sessionType="teaching"
                      skillName={skill}
                      onSessionEnd={(conversation) => {
                        console.log('Teaching session ended:', conversation);
                        fetchSessions();
                      }}
                    />
                  </div>
                ))}
                {/* Coaching Sessions */}
                {profile?.lookingfor && (
                  (Array.isArray(profile.lookingfor) ? profile.lookingfor : [profile.lookingfor]).map((goal: string) => (
                    <div key={goal}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Learn: {goal}</h3>
                      <TavusConversationSession
                        sessionType="coaching"
                        coachingType={goal}
                        onSessionEnd={(conversation) => {
                          console.log('Coaching session ended:', conversation);
                          fetchSessions();
                        }}
                      />
                    </div>
                  ))
                )}
                {/* Created on demand */}
                {createdTavus && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{createdTavus.type === 'teaching' ? 'Teach' : 'Learn'}: {createdTavus.topic}</h3>
                    <TavusConversationSession
                      sessionType={createdTavus.type}
                      skillName={createdTavus.type === 'teaching' ? createdTavus.topic : undefined}
                      coachingType={createdTavus.type === 'coaching' ? createdTavus.topic : undefined}
                      onSessionEnd={() => setCreatedTavus(null)}
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Video Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Video Analysis</h2>
              <VideoAnalysis />
            </motion.div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">My Sessions</h2>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Book Session</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>All Sessions</option>
                <option>AI Coaching</option>
                <option>Skill Exchange</option>
                <option>Group Sessions</option>
              </select>
            </div>

            <div className="grid gap-6">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        {getTypeIcon(session.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                        <p className="text-gray-600 capitalize">{session.type.replace('_', ' ')}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                          <span>{session.duration} minutes</span>
                          {session.participants && <span>{session.participants} participants</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status.replace('_', ' ')}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <SessionReplays />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Community</h2>
            
            {/* Skill Exchange Marketplace */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Exchange Marketplace</h3>
              <SkillExchange />
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Matchmaking</h3>
              <SmartMatchMaking />
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Silly Skill Mode</h3>
              <SillySkillMode />
            </div>

            {/* Community Leaderboard */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Alex Thompson', points: 2450, badge: '🏆' },
                  { rank: 2, name: 'Maria Garcia', points: 2380, badge: '🥈' },
                  { rank: 3, name: 'David Kim', points: 2290, badge: '🥉' },
                  { rank: 156, name: 'You', points: 890, badge: '⭐' }
                ].map((user, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${user.name === 'You' ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{user.badge}</span>
                      <div>
                        <span className="font-medium text-gray-900">#{user.rank} {user.name}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-indigo-600">{user.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Progress Analytics</h2>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Development</h3>
                <div className="space-y-4">
                  {userProgress?.skills?.map((item: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{item.skill}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600">{item.change}</span>
                          <span className="text-sm font-medium">{item.level}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t-sm transition-all duration-300"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">94%</div>
                  <div className="text-sm text-gray-600">Session Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
                  <div className="text-sm text-gray-600">Average Feedback Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{streakData?.dailyStreak || 0}</div>
                  <div className="text-sm text-gray-600">Current Daily Streak</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    {/* Fun random BoltBadge floating in dashboard header */}
    <BoltBadge variant="float" className="top-2 left-1/3 absolute" />
    {/* Mobile Bottom Nav */}
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex md:hidden justify-around py-2 shadow-lg">
      {[
        { id: 'overview', label: 'Home', icon: Zap },
        { id: 'sessions', label: 'Sessions', icon: Calendar },
        { id: 'practice', label: 'Practice', icon: Video },
        { id: 'community', label: 'Community', icon: Users },
        { id: 'progress', label: 'Progress', icon: BarChart3 },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center flex-1 px-1 py-1 text-xs font-medium capitalize transition-colors ${
            activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'
          }`}
        >
          <tab.icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
          {tab.label}
        </button>
      ))}
    </nav>
    </>
  );
}