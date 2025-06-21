import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Share2, 
  Star,
  Clock,
  Calendar,
  Eye,
  MessageSquare,
  TrendingUp,
  Award,
  Filter,
  Search,
  Video,
  Mic,
  Brain,
  Users,
  BookOpen,
  Target,
  BarChart3
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface SessionReplay {
  id: string;
  title: string;
  type: 'ai_coaching' | 'skill_exchange' | 'group_session';
  date: string;
  duration: number;
  skill: string;
  thumbnail: string;
  videoUrl?: string;
  audioUrl?: string;
  transcript?: string;
  metrics: {
    overallScore: number;
    eyeContact: number;
    speechClarity: number;
    confidence: number;
    engagement: number;
  };
  feedback: string[];
  improvements: string[];
  participants?: string[];
  tags: string[];
  isPublic: boolean;
  views: number;
  likes: number;
  comments: number;
  aiInsights: string[];
  keyMoments: {
    timestamp: number;
    description: string;
    type: 'highlight' | 'improvement' | 'milestone';
  }[];
}

export default function SessionReplays() {
  const [replays, setReplays] = useState<SessionReplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReplay, setSelectedReplay] = useState<SessionReplay | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchReplays();
  }, []);

  const fetchReplays = async () => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch user's completed sessions
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'completed')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      // Transform sessions into replay format with mock data
      const mockReplays: SessionReplay[] = sessions?.map((session, index) => ({
        id: session.id,
        title: session.title,
        type: session.type,
        date: session.date,
        duration: session.duration,
        skill: session.skill || 'General',
        thumbnail: `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=225&fit=crop`,
        videoUrl: `https://example.com/replay/${session.id}.mp4`,
        audioUrl: `https://example.com/replay/${session.id}.mp3`,
        transcript: generateMockTranscript(),
        metrics: {
          overallScore: Math.floor(Math.random() * 20) + 80,
          eyeContact: Math.floor(Math.random() * 30) + 70,
          speechClarity: Math.floor(Math.random() * 20) + 80,
          confidence: Math.floor(Math.random() * 25) + 75,
          engagement: Math.floor(Math.random() * 15) + 85
        },
        feedback: generateMockFeedback(),
        improvements: generateMockImprovements(),
        participants: session.type === 'group_session' ? generateMockParticipants() : undefined,
        tags: generateMockTags(session.skill),
        isPublic: Math.random() > 0.7,
        views: Math.floor(Math.random() * 100) + 10,
        likes: Math.floor(Math.random() * 20) + 5,
        comments: Math.floor(Math.random() * 10) + 2,
        aiInsights: generateMockInsights(),
        keyMoments: generateMockKeyMoments(session.duration)
      })) || [];

      setReplays(mockReplays);
    } catch (error) {
      console.error('Error fetching replays:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTranscript = () => {
    return "Welcome to today's session. I'm excited to share some insights about effective communication and presentation skills. Let's start by discussing the key elements that make a presentation engaging...";
  };

  const generateMockFeedback = () => {
    const feedback = [
      "Excellent eye contact throughout the presentation",
      "Clear and confident speaking voice",
      "Good use of gestures to emphasize points",
      "Well-structured content flow",
      "Engaging storytelling techniques"
    ];
    return feedback.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const generateMockImprovements = () => {
    const improvements = [
      "Try to slow down during complex explanations",
      "Add more pauses for emphasis",
      "Vary your tone to maintain engagement",
      "Use more specific examples",
      "Practice smoother transitions between topics"
    ];
    return improvements.slice(0, Math.floor(Math.random() * 2) + 1);
  };

  const generateMockParticipants = () => {
    const names = ['Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa'];
    const count = Math.floor(Math.random() * 4) + 2;
    return names.slice(0, count);
  };

  const generateMockTags = (skill: string) => {
    const baseTags = ['presentation', 'communication', 'confidence'];
    const skillTags = skill ? [skill.toLowerCase()] : [];
    const additionalTags = ['practice', 'improvement', 'feedback'];
    return [...baseTags, ...skillTags, ...additionalTags.slice(0, 2)];
  };

  const generateMockInsights = () => {
    const insights = [
      "Your confidence has improved by 15% compared to last session",
      "Speech clarity is consistently above 85%",
      "Eye contact duration increased significantly",
      "Filler words reduced by 40% this month",
      "Engagement score is in the top 20% of users"
    ];
    return insights.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const generateMockKeyMoments = (duration: number) => {
    const moments = [];
    const count = Math.floor(duration / 10); // One moment per 10 minutes
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      moments.push({
        timestamp: Math.floor((duration * 60 * i) / count),
        description: [
          "Strong opening statement",
          "Excellent example usage",
          "Confident Q&A handling",
          "Smooth transition",
          "Powerful conclusion"
        ][i] || "Key moment",
        type: ['highlight', 'improvement', 'milestone'][Math.floor(Math.random() * 3)] as any
      });
    }
    
    return moments;
  };

  const filteredReplays = replays.filter(replay => {
    const matchesType = filterType === 'all' || replay.type === filterType;
    const matchesSearch = replay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         replay.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         replay.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const sortedReplays = [...filteredReplays].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'score':
        return b.metrics.overallScore - a.metrics.overallScore;
      case 'duration':
        return b.duration - a.duration;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_coaching': return <Brain className="w-4 h-4" />;
      case 'skill_exchange': return <Users className="w-4 h-4" />;
      case 'group_session': return <BookOpen className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Video className="w-6 h-6 text-indigo-600" />
            <span>Session Replays</span>
          </h2>
          <p className="text-gray-600">Review and analyze your past sessions</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium">
            Pro Feature
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search replays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="ai_coaching">AI Coaching</option>
              <option value="skill_exchange">Skill Exchange</option>
              <option value="group_session">Group Sessions</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="duration">Sort by Duration</option>
              <option value="views">Sort by Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Replays', value: replays.length.toString(), icon: Video, color: 'bg-blue-500' },
          { label: 'Avg Score', value: Math.round(replays.reduce((acc, r) => acc + r.metrics.overallScore, 0) / replays.length || 0).toString(), icon: Star, color: 'bg-green-500' },
          { label: 'Total Hours', value: Math.round(replays.reduce((acc, r) => acc + r.duration, 0) / 60).toString(), icon: Clock, color: 'bg-purple-500' },
          { label: 'Public Replays', value: replays.filter(r => r.isPublic).length.toString(), icon: Eye, color: 'bg-orange-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Replays Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedReplays.map((replay, index) => (
          <motion.div
            key={replay.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedReplay(replay)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-900">
              <img
                src={`https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop`}
                alt={replay.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-900 ml-1" />
                </div>
              </div>
              <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/70 px-2 py-1 rounded">
                {getTypeIcon(replay.type)}
                <span className="text-white text-xs">{replay.type.replace('_', ' ')}</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(replay.duration * 60)}
              </div>
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getScoreColor(replay.metrics.overallScore)}`}>
                {replay.metrics.overallScore}%
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{replay.title}</h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(replay.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{replay.skill}</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {replay.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{replay.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{replay.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{replay.comments}</span>
                  </div>
                </div>
                {replay.isPublic && (
                  <span className="text-green-600 text-xs font-medium">Public</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Replays */}
      {sortedReplays.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No replays found</h3>
          <p className="text-gray-600">Complete some sessions to see your replays here.</p>
        </div>
      )}

      {/* Replay Modal */}
      {selectedReplay && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row h-full">
              {/* Video Player */}
              <div className="lg:w-2/3 bg-black">
                <div className="aspect-video bg-gray-900 relative">
                  <img
                    src={`https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop`}
                    alt={selectedReplay.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-gray-900" />
                      ) : (
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      )}
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-2 text-white text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex-1 bg-white/30 rounded-full h-1">
                        <div
                          className="bg-white rounded-full h-1 transition-all"
                          style={{ width: `${(currentTime / (selectedReplay.duration * 60)) * 100}%` }}
                        ></div>
                      </div>
                      <span>{formatDuration(selectedReplay.duration * 60)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedReplay.title}</h3>
                    <button
                      onClick={() => setSelectedReplay(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{new Date(selectedReplay.date).toLocaleDateString()}</span>
                    <span>{formatDuration(selectedReplay.duration * 60)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(selectedReplay.metrics.overallScore)}`}>
                      {selectedReplay.metrics.overallScore}% Score
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Metrics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedReplay.metrics).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-sm font-medium">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* AI Insights */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">AI Insights</h4>
                    <div className="space-y-2">
                      {selectedReplay.aiInsights.map((insight, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <Brain className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Key Moments */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Moments</h4>
                    <div className="space-y-2">
                      {selectedReplay.keyMoments.map((moment, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentTime(moment.timestamp)}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{moment.description}</span>
                            <span className="text-xs text-gray-500">{formatTime(moment.timestamp)}</span>
                          </div>
                          <div className={`text-xs mt-1 ${
                            moment.type === 'highlight' ? 'text-green-600' :
                            moment.type === 'improvement' ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {moment.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Feedback */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Feedback</h4>
                    <div className="space-y-2">
                      {selectedReplay.feedback.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Improvements */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {selectedReplay.improvements.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-4 border-t space-y-2">
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    Practice Similar Session
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}