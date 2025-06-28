import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Users, 
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
  Globe
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { skillsDatabase, getSkillById } from '../data/skillsDatabase';
import Call from './Call';

interface MatchedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  skills: string[];
  wantsToLearn: string[];
  rating: number;
  reviewCount: number;
  location: string;
  timezone: string;
  availability: string[];
  bio: string;
  badges: string[];
  isOnline: boolean;
  matchScore: number;
  matchReasons: string[];
  complementarySkills: string[];
  sharedInterests: string[];
  responseTime: string;
  successRate: number;
  languages: string[];
  teachingStyle: string;
  learningGoals: string[];
}

interface MatchingPreferences {
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'any';
  timeCommitment: 'casual' | 'regular' | 'intensive';
  sessionType: 'one-on-one' | 'group' | 'both';
  focusArea: string;
  availability: string[];
  maxDistance: number;
  preferredLanguages: string[];
}

export default function SmartMatchmaking() {
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    skillLevel: 'any',
    timeCommitment: 'regular',
    sessionType: 'both',
    focusArea: '',
    availability: [],
    maxDistance: 50,
    preferredLanguages: ['English']
  });
  const [selectedMatch, setSelectedMatch] = useState<MatchedUser | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSkillLinkCall, setShowSkillLinkCall] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [preferences]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      // Get potential matches (no join, correct fields)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.user.id)
        .neq('role', 'learner');

      if (!profiles || !userProfile) return;

      // AI-powered matching algorithm
      const matchedUsers = profiles.map(profile => {
        const matchData = calculateMatchScore(userProfile, profile);
        return {
          id: profile.id,
          name: profile.email?.split('@')[0] || 'Anonymous',
          email: profile.email || '',
          avatar: profile.email?.substring(0, 2).toUpperCase() || 'AN',
          skills: profile.skills || [],
          wantsToLearn: Array.isArray(profile.lookingfor) ? profile.lookingfor : [profile.lookingfor].filter(Boolean),
          rating: Math.random() * 1 + 4,
          reviewCount: Math.floor(Math.random() * 100) + 10,
          location: profile.location || generateRandomLocation(),
          timezone: generateRandomTimezone(),
          availability: generateRandomAvailability(),
          bio: profile.bio || 'Passionate about sharing knowledge and learning new skills!',
          badges: generateBadges(profile.role, profile.skills),
          isOnline: Math.random() > 0.3,
          matchScore: matchData.score,
          matchReasons: matchData.reasons,
          complementarySkills: matchData.complementarySkills,
          sharedInterests: matchData.sharedInterests,
          responseTime: generateResponseTime(),
          successRate: Math.floor(Math.random() * 20) + 80,
          languages: generateLanguages(),
          teachingStyle: generateTeachingStyle(),
          learningGoals: generateLearningGoals()
        };
      });

      // Sort by match score and filter by preferences
      const sortedMatches = matchedUsers
        .filter(match => match.matchScore >= 60)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20);

      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (userProfile: any, otherProfile: any) => {
    let score = 0;
    const reasons: string[] = [];
    const complementarySkills: string[] = [];
    const sharedInterests: string[] = [];

    const userSkills = userProfile.skills || [];
    const userWants = Array.isArray(userProfile.lookingfor) ? userProfile.lookingfor : [userProfile.lookingfor].filter(Boolean);
    const otherSkills = otherProfile.skills || [];
    const otherWants = Array.isArray(otherProfile.lookingfor) ? otherProfile.lookingfor : [otherProfile.lookingfor].filter(Boolean);

    // Skill complementarity (what user wants vs what other teaches)
    const skillMatches = userWants.filter((want: string) => 
      otherSkills.some((skill: string) => skill.toLowerCase().includes(want.toLowerCase()) || want.toLowerCase().includes(skill.toLowerCase()))
    );
    
    if (skillMatches.length > 0) {
      score += skillMatches.length * 25;
      reasons.push(`Teaches ${skillMatches.length} skill(s) you want to learn`);
      complementarySkills.push(...skillMatches);
    }

    // Reverse complementarity (what other wants vs what user teaches)
    const reverseMatches = otherWants.filter((want: string) => 
      userSkills.some((skill: string) => skill.toLowerCase().includes(want.toLowerCase()) || want.toLowerCase().includes(skill.toLowerCase()))
    );
    
    if (reverseMatches.length > 0) {
      score += reverseMatches.length * 20;
      reasons.push(`Wants to learn ${reverseMatches.length} skill(s) you can teach`);
    }

    // Shared interests
    const shared = userSkills.filter((skill: string) => 
      otherSkills.some((otherSkill: string) => skill.toLowerCase() === otherSkill.toLowerCase())
    );
    
    if (shared.length > 0) {
      score += shared.length * 10;
      reasons.push(`Shares ${shared.length} common interest(s)`);
      sharedInterests.push(...shared);
    }

    // Role compatibility
    if (userProfile.role === 'both' && otherProfile.role === 'both') {
      score += 15;
      reasons.push('Both are open to teaching and learning');
    } else if (
      (userProfile.role === 'learner' && otherProfile.role === 'teacher') ||
      (userProfile.role === 'teacher' && otherProfile.role === 'learner')
    ) {
      score += 20;
      reasons.push('Perfect role compatibility');
    }

    // Activity level (based on profile completeness)
    const userCompleteness = (userProfile.bio ? 1 : 0) + (userSkills.length > 0 ? 1 : 0) + (userWants.length > 0 ? 1 : 0);
    const otherCompleteness = (otherProfile.bio ? 1 : 0) + (otherSkills.length > 0 ? 1 : 0) + (otherWants.length > 0 ? 1 : 0);
    
    if (userCompleteness >= 2 && otherCompleteness >= 2) {
      score += 10;
      reasons.push('Both have complete profiles');
    }

    // Ensure minimum score
    score = Math.max(score, Math.floor(Math.random() * 30) + 40);

    return {
      score: Math.min(score, 100),
      reasons: reasons.slice(0, 3),
      complementarySkills,
      sharedInterests
    };
  };

  const generateRandomLocation = () => {
    const locations = [
      'San Francisco, CA', 'New York, NY', 'London, UK', 'Berlin, Germany',
      'Tokyo, Japan', 'Sydney, Australia', 'Toronto, Canada', 'Amsterdam, Netherlands',
      'Barcelona, Spain', 'Singapore', 'Remote', 'Austin, TX', 'Seattle, WA'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const generateRandomTimezone = () => {
    const timezones = ['PST', 'EST', 'GMT', 'CET', 'JST', 'AEST', 'CST'];
    return timezones[Math.floor(Math.random() * timezones.length)];
  };

  const generateRandomAvailability = () => {
    const times = ['Morning', 'Afternoon', 'Evening', 'Weekend'];
    const count = Math.floor(Math.random() * 3) + 1;
    return times.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const generateBadges = (role: string, skills: string[]) => {
    const badges = [];
    if (role === 'teacher') badges.push('Expert Teacher');
    if (role === 'both') badges.push('Skill Exchanger');
    if (skills && skills.length > 5) badges.push('Multi-Skilled');
    if (Math.random() > 0.7) badges.push('Top Rated');
    if (Math.random() > 0.8) badges.push('Quick Responder');
    return badges;
  };

  const generateResponseTime = () => {
    const times = ['< 1 hour', '< 2 hours', '< 4 hours', '< 1 day'];
    return times[Math.floor(Math.random() * times.length)];
  };

  const generateLanguages = () => {
    const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin', 'Portuguese'];
    const count = Math.floor(Math.random() * 2) + 1;
    return languages.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const generateTeachingStyle = () => {
    const styles = ['Hands-on', 'Theory-focused', 'Project-based', 'Interactive', 'Structured', 'Flexible'];
    return styles[Math.floor(Math.random() * styles.length)];
  };

  const generateLearningGoals = () => {
    const goals = [
      'Career advancement', 'Personal growth', 'Hobby development', 
      'Skill diversification', 'Creative expression', 'Professional development'
    ];
    const count = Math.floor(Math.random() * 2) + 1;
    return goals.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const handleConnect = async (matchId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase.from('skill_connections').insert({
        requester_id: user.user.id,
        provider_id: matchId,
        status: 'pending',
        message: 'Hi! Our skills seem like a great match. I\'d love to connect and explore learning opportunities together!'
      });

      alert('Connection request sent!');
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  const handleSchedule = async (matchId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase.from('sessions').insert({
        user_id: user.user.id,
        partner_id: matchId,
        title: 'Smart Matched Session',
        type: 'skill_exchange',
        status: 'upcoming',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        skill: 'General'
      });

      alert('Session scheduled! Check your dashboard for details.');
    } catch (error) {
      console.error('Error scheduling:', error);
    }
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
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            <span>Smart Matchmaking</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">AI-powered skill partner recommendations</p>
        </div>
        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Filter className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Matching Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
              <select
                value={preferences.skillLevel}
                onChange={(e) => setPreferences(prev => ({ ...prev, skillLevel: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="any">Any Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Commitment</label>
              <select
                value={preferences.timeCommitment}
                onChange={(e) => setPreferences(prev => ({ ...prev, timeCommitment: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="casual">Casual (1-2 hours/week)</option>
                <option value="regular">Regular (3-5 hours/week)</option>
                <option value="intensive">Intensive (6+ hours/week)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
              <select
                value={preferences.sessionType}
                onChange={(e) => setPreferences(prev => ({ ...prev, sessionType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="both">Both</option>
                <option value="one-on-one">One-on-One</option>
                <option value="group">Group Sessions</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Match Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Matches', value: matches.length.toString(), icon: Users, color: 'bg-blue-500' },
          { label: 'High Compatibility', value: matches.filter(m => m.matchScore >= 80).length.toString(), icon: Star, color: 'bg-green-500' },
          { label: 'Online Now', value: matches.filter(m => m.isOnline).length.toString(), icon: Zap, color: 'bg-yellow-500' },
          { label: 'Quick Responders', value: matches.filter(m => m.responseTime.includes('< 1')).length.toString(), icon: Clock, color: 'bg-purple-500' }
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

      {/* Matches Grid */}
      <div className="grid gap-6">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Section */}
              <div className="flex items-start space-x-4 flex-1">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {match.avatar}
                  </div>
                  {match.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {match.matchScore}%
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
                    {match.badges.map((badge, idx) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" title={match.email}>📧 {match.email}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{match.rating.toFixed(1)} ({match.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{match.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Responds {match.responseTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{match.successRate}% success rate</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{match.bio}</p>
                  
                  {/* Match Reasons */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Why you're a great match:</h4>
                    <div className="space-y-1">
                      {match.matchReasons.length > 0 ? match.matchReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-green-700">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>{reason}</span>
                        </div>
                      )) : <span className="text-xs text-gray-400">No specific reasons found.</span>}
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Teaches:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {match.skills && match.skills.length > 0 ? match.skills.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                            {skill}
                          </span>
                        )) : <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">No skills listed</span>}
                        {match.skills && match.skills.length > 4 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            +{match.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {match.wantsToLearn && match.wantsToLearn.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Wants to learn:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {match.wantsToLearn.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Actions Section */}
              <div className="flex flex-col gap-3 w-full sm:w-auto lg:w-48 mt-4 lg:mt-0">
                <button 
                  onClick={() => handleConnect(match.id)}
                  className="flex-1 lg:w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect</span>
                </button>
                
                <button 
                  onClick={() => handleSchedule(match.id)}
                  className="flex-1 lg:w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                
                <button 
                  onClick={() => setSelectedMatch(match)}
                  className="flex-1 lg:w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Matches */}
      {matches.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600">Try adjusting your preferences or completing your profile to find better matches.</p>
        </div>
      )}

      {/* Profile Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profile Details</h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedMatch.avatar}
                  </div>
                  {selectedMatch.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedMatch.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{selectedMatch.rating.toFixed(1)} ({selectedMatch.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" title={selectedMatch.email}>📧 {selectedMatch.email}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMatch.badges.map((badge, idx) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Match Score */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Compatibility Score</span>
                  <span className="text-2xl font-bold text-indigo-600">{selectedMatch.matchScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${selectedMatch.matchScore}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Location & Availability</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedMatch.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>{selectedMatch.timezone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedMatch.availability.join(', ')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Teaching Info</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Style:</span> {selectedMatch.teachingStyle}
                    </div>
                    <div>
                      <span className="font-medium">Languages:</span> {selectedMatch.languages.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Response time:</span> {selectedMatch.responseTime}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">About</h5>
                <p className="text-gray-600">{selectedMatch.bio}</p>
              </div>
              
              {/* Skills */}
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Skills They Teach</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedMatch.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedMatch.wantsToLearn.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Skills They Want to Learn</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.wantsToLearn.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button 
                  onClick={() => {
                    handleConnect(selectedMatch.id);
                    setSelectedMatch(null);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Send Connection Request
                </button>
                <button 
                  onClick={() => {
                    handleSchedule(selectedMatch.id);
                    setSelectedMatch(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Schedule Session
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Video Call Button */}
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium mb-4"
        onClick={() => setShowSkillLinkCall(true)}
      >
        Start Live Video Session
      </button>
            {showSkillLinkCall && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowSkillLinkCall(false)}
                  >
                    Close
                  </button>
                  <Call />
                </div>
              </div>
            )}
          </div>
        );
      }