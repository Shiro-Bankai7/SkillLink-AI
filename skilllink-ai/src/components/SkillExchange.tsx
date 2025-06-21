import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  MessageCircle, 
  Calendar,
  MapPin,
  Clock,
  Users,
  Award,
  Heart,
  Share2,
  ChevronRight,
  Plus,
  Globe
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface SkillProvider {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  wantsToLearn: string[];
  rating: number;
  reviewCount: number;
  location: string;
  availability: string;
  bio: string;
  badges: string[];
  isOnline: boolean;
  email?: string;
}

export default function SkillExchange() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [providers, setProviders] = useState<SkillProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const skillCategories = [
    'All Skills',
    'Design',
    'Programming',
    'Languages',
    'Music',
    'Photography',
    'Business',
    'Marketing',
    'Writing',
    'Public Speaking'
  ];

  useEffect(() => {
    fetchSkillProviders();
  }, []);

  const fetchSkillProviders = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles from Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          bio,
          skills,
          lookingFor,
          role,
          created_at,
          email,
          users:users!inner(id),
          users:users!inner(email)
        `)
        .neq('role', 'learner'); // Only show teachers and both

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      // Transform data to match SkillProvider interface
      const transformedProviders: SkillProvider[] = profiles?.map(profile => ({
        id: profile.id,
        name: profile.users?.[0]?.email?.split('@')[0] || 'Anonymous',
        avatar: profile.users?.[0]?.email?.substring(0, 2).toUpperCase() || 'AN',
        skills: profile.skills || [],
        wantsToLearn: Array.isArray(profile.lookingFor) ? profile.lookingFor : [profile.lookingFor].filter(Boolean),
        rating: Math.random() * 1 + 4, // Random rating between 4-5
        reviewCount: Math.floor(Math.random() * 50) + 5,
        location: 'Remote', // Default location
        availability: ['Weekends', 'Evenings', 'Flexible', 'Mornings'][Math.floor(Math.random() * 4)],
        bio: profile.bio || 'Passionate about sharing knowledge and learning new skills!',
        badges: profile.role === 'teacher' ? ['Expert Teacher'] : ['Skill Exchanger'],
        isOnline: Math.random() > 0.5,
        email: profile.users?.[0]?.email
      })) || [];

      setProviders(transformedProviders);
    } catch (error) {
      console.error('Error fetching skill providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = selectedSkill === '' || selectedSkill === 'All Skills' ||
                        provider.skills.some(skill => skill.toLowerCase().includes(selectedSkill.toLowerCase()));
    return matchesSearch && matchesSkill;
  });

  const handleConnect = async (providerId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Create a connection request
      const { error } = await supabase.from('skill_connections').insert({
        requester_id: user.user.id,
        provider_id: providerId,
        status: 'pending',
        message: 'Hi! I\'d love to connect and exchange skills with you.'
      });

      if (error) {
        console.error('Error creating connection:', error);
        return;
      }

      alert('Connection request sent!');
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  const handleSchedule = async (providerId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Create a session request
      const { error } = await supabase.from('sessions').insert({
        user_id: user.user.id,
        partner_id: providerId,
        title: 'Skill Exchange Session',
        type: 'skill_exchange',
        status: 'upcoming',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration: 60,
        skill: 'General'
      });

      if (error) {
        console.error('Error scheduling session:', error);
        return;
      }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skill Exchange</h2>
          <p className="text-gray-600">Connect with others to learn and teach skills</p>
        </div>
        <button 
          onClick={() => setShowOfferModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Offer Your Skills</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills or people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {skillCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-6">
        {filteredProviders.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Profile Info */}
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {provider.avatar}
                  </div>
                  {provider.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                    {provider.badges.map((badge, idx) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{provider.rating.toFixed(1)}</span>
                      <span>({provider.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{provider.availability}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{provider.bio}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Teaches:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {provider.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {provider.wantsToLearn.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Wants to learn:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {provider.wantsToLearn.map((skill, idx) => (
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
              
              {/* Actions */}
              <div className="flex lg:flex-col gap-3 lg:w-48">
                <button 
                  onClick={() => handleConnect(provider.id)}
                  className="flex-1 lg:w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect</span>
                </button>
                
                <button 
                  onClick={() => handleSchedule(provider.id)}
                  className="flex-1 lg:w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {filteredProviders.length > 0 && (
        <div className="text-center">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium">
            Load More Results
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600">Try adjusting your search or filters to find more skill partners.</p>
        </div>
      )}

      {/* Offer Skills Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Your Skills</h3>
            <p className="text-gray-600 mb-4">
              Complete your profile to start offering your skills to the community.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  // Navigate to profile completion
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}