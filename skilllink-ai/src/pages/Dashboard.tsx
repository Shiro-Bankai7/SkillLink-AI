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
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import AICoachingSession from '../components/AICoachingSession';
import SkillExchange from '../components/SkillExchange';
import SmartMatchMaking from '../components/SmartMatchMaking';
import SillySkillMode from '../components/SillySkillMode';
import SessionReplays from '../components/SessionReplays';
import VideoAnalysis from '../components/VideoAnalysis';

interface UserProfile {
  id: string;
  bio: string;
  skills: string[];
  lookingFor: string;
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

  useEffect(() => {
    fetchProfile();
    fetchSessions();
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

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Here you would integrate with ElevenLabs for voice analysis
    // and Tavus for video processing
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

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills, sessions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
            >
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user?.email?.split('@')[0]}! 👋
              </h2>
              <p className="text-indigo-100 mb-6">
                Ready to level up your skills today? You have 2 upcoming sessions and 3 new skill matches.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>Start AI Coaching</span>
                </button>
                <button className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Find Skill Partners</span>
                </button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Sessions Completed', value: '24', icon: Video, color: 'bg-blue-500' },
                { label: 'Skills Learned', value: '8', icon: BookOpen, color: 'bg-green-500' },
                { label: 'Hours Practiced', value: '47', icon: Clock, color: 'bg-purple-500' },
                { label: 'Community Rank', value: '#156', icon: TrendingUp, color: 'bg-orange-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Sessions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {sessions.filter(s => s.status === 'upcoming').map((session) => (
                    <div key={session.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
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
                </div>
              </motion.div>

              {/* Recent Achievements */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
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
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-8">
            {/* AI Coaching Studio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Coaching Studio</h2>
              <AICoachingSession />
            </motion.div>
            {/* Skill Video Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Analysis</h2>
              <VideoAnalysis />
            </motion.div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Sessions</h2>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Book Session</span>
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
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
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        {getTypeIcon(session.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                        <p className="text-gray-600 capitalize">{session.type.replace('_', ' ')}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Exchange Marketplace</h3>
              <SkillExchange />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Matchmaking</h3>
              <SmartMatchMaking />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Silly Skill Mode</h3>
              <SillySkillMode />
            </div>

            {/* Community Leaderboard */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Development</h3>
                <div className="space-y-4">
                  {[
                    { skill: 'Public Speaking', level: 85, change: '+12%' },
                    { skill: 'UI/UX Design', level: 72, change: '+8%' },
                    { skill: 'Programming', level: 68, change: '+15%' },
                    { skill: 'Language Learning', level: 45, change: '+5%' }
                  ].map((item, index) => (
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

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
                  <div className="text-3xl font-bold text-purple-600 mb-2">23</div>
                  <div className="text-sm text-gray-600">Skills Improved</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}