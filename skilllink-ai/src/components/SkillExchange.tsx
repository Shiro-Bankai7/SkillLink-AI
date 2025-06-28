import React, { useState, useEffect, useRef } from 'react';
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
  Globe,
  Video,
  Phone,
  PhoneOff
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { StreakService } from '../services/streakService';
import { showNotification } from '../utils/notification';
import Call from './Call';
import { BlockchainSessionService } from '../utils/blockchainSession';

interface SkillProvider {
  id: string;
  name: string;
  email: string;
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
}

export default function SkillExchange() {
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('skillExchangeSearchTerm') || '';
    }
    return '';
  });
  const [selectedSkill, setSelectedSkill] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('skillExchangeSelectedSkill') || '';
    }
    return '';
  });
  const [providers, setProviders] = useState<SkillProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallProvider, setVideoCallProvider] = useState<SkillProvider | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showOfferSkillsModal, setShowOfferSkillsModal] = useState(false);
  const [offerSkill, setOfferSkill] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState('');
  const [showSkillLinkCall, setShowSkillLinkCall] = useState(false);
  const [activeSessionProvider, setActiveSessionProvider] = useState<SkillProvider | null>(null);
  const [blockchainSessionId, setBlockchainSessionId] = useState<string | null>(null);
  const [blockchainLoading, setBlockchainLoading] = useState(false);

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

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchSkillProviders = async () => {
    try {
      setLoading(true);
      
      // Get current user to exclude from results
      const { data: user } = await supabase.auth.getUser();
      const currentUserId = user?.user?.id;

      // Fetch profiles from Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'learner');

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      // Transform data to match SkillProvider interface
      const transformedProviders: SkillProvider[] = profiles
        ?.filter(profile => profile.id !== currentUserId)
        ?.map(profile => ({
          id: profile.id,
          name: profile.email?.split('@')[0] || 'Anonymous',
          email: profile.email || '',
          avatar: profile.email?.substring(0, 2).toUpperCase() || 'AN',
          skills: profile.skills || [],
          wantsToLearn: Array.isArray(profile.lookingfor) ? profile.lookingfor : 
                       typeof profile.lookingfor === 'string' ? [profile.lookingfor] : [],
          rating: Math.random() * 1 + 4, // Random rating between 4-5
          reviewCount: Math.floor(Math.random() * 50) + 5,
          location: profile.location || 'Remote',
          availability: ['Weekends', 'Evenings', 'Flexible', 'Mornings'][Math.floor(Math.random() * 4)],
          bio: profile.bio || 'Passionate about sharing knowledge and learning new skills!',
          badges: profile.role === 'teacher' ? ['Expert Teacher'] : ['Skill Exchanger'],
          isOnline: Math.random() > 0.5,
        })) || [];

      setProviders(transformedProviders);
    } catch (error) {
      console.error('Error fetching skill providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error && data) setProfile(data);
    } catch (e) {
      // ignore
    } finally {
      setProfileLoading(false);
    }
  };

  // Helper: is profile complete?
  const isProfileComplete = profile && profile.bio && profile.skills && profile.skills.length > 0 && profile.lookingfor;

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

      showNotification('Connection Request Sent!', {
        body: 'Your connection request has been sent successfully.',
        icon: '/favicon.ico'
      });

      // Update streak for engagement
      await StreakService.updateDailyPracticeStreak();
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

      showNotification('Session Scheduled!', {
        body: 'Your skill exchange session has been scheduled. Check your dashboard for details.',
        icon: '/favicon.ico'
      });
    } catch (error) {
      console.error('Error scheduling:', error);
    }
  };

  // WebRTC Video Call Implementation
  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, send this to the remote peer via signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteStream(event.streams[0]);
      }
    };

    return pc;
  };

  const startVideoCall = async (provider: SkillProvider) => {
    try {
      setVideoCallProvider(provider);
      setShowVideoCall(true);
      setIsInCall(true);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      const pc = initializePeerConnection();
      setPeerConnection(pc);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create offer (in a real app, this would be coordinated via signaling server)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Update streak for video session
      await StreakService.updateDailyPracticeStreak();

      showNotification('Video Call Started!', {
        body: `Starting video call with ${provider.name}`,
        icon: '/favicon.ico'
      });

    } catch (error) {
      console.error('Error starting video call:', error);
      showNotification('Call Failed', {
        body: 'Could not start video call. Please check your camera and microphone permissions.',
        icon: '/favicon.ico'
      });
    }
  };

  const endVideoCall = () => {
    setIsInCall(false);
    setShowVideoCall(false);
    setVideoCallProvider(null);

    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    showNotification('Call Ended', {
      body: 'Video call has ended successfully.',
      icon: '/favicon.ico'
    });
  };

  // Handler to start a secure SkillLink session
  const startSkillLinkSession = async (provider: SkillProvider) => {
    if (!user) {
      alert('You must be logged in to start a session.');
      return;
    }
    setBlockchainLoading(true);
    try {
      // Generate a unique session ID
      const sessionId = `session_${Date.now()}_${user.id}_${provider.id}`;
      // Prompt for sender mnemonic (in production, use wallet connect or secure input)
      const senderMnemonic = prompt('Enter your Algorand mnemonic to start the session (for demo only):');
      if (!senderMnemonic) throw new Error('Mnemonic required');
      // Store session on blockchain
      await BlockchainSessionService.storeSessionOnBlockchain({
        sessionId,
        participants: [user.id, provider.id],
        sessionType: 'skill_exchange',
        duration: 0,
        skills: provider.skills
      }, senderMnemonic);
      setBlockchainSessionId(sessionId);
      setActiveSessionProvider(provider);
      setShowSkillLinkCall(true);
    } catch (err) {
      alert('Failed to start secure session: ' + (err as Error).message);
    } finally {
      setBlockchainLoading(false);
    }
  };

  // Persist searchTerm and selectedSkill to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillExchangeSearchTerm', searchTerm);
    }
  }, [searchTerm]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillExchangeSelectedSkill', selectedSkill);
    }
  }, [selectedSkill]);

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
                
                <button
                  onClick={() => startSkillLinkSession(provider)}
                  className="flex-1 lg:w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                  disabled={blockchainLoading}
                >
                  <Video className="w-4 h-4" />
                  <span>{blockchainLoading && activeSessionProvider?.id === provider.id ? 'Starting...' : 'Secure Video Call'}</span>
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
            {profileLoading ? (
              <p className="text-gray-600 mb-4">Loading your profile...</p>
            ) : !isProfileComplete ? (
              <>
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
                      window.location.href = '/create-profile';
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Complete Profile
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Your profile is complete! You can now offer your skills to the community.
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
                      setShowOfferSkillsModal(true);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Offer Skills
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Offer Skills Real Modal */}
      {showOfferSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit a Skill Offer</h3>
            {offerSuccess ? (
              <div className="mb-4 text-green-600 font-medium">{offerSuccess}</div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setOfferSubmitting(true);
                  setOfferSuccess('');
                  if (!user) {
                    setOfferSuccess('You must be logged in to submit an offer.');
                    setOfferSubmitting(false);
                    return;
                  }
                  try {
                    await supabase.from('skill_offers').insert({
                      user_id: user.id,
                      skill: offerSkill,
                      description: offerDescription,
                      created_at: new Date().toISOString(),
                    });
                    setOfferSuccess('Skill offer submitted!');
                    setOfferSkill('');
                    setOfferDescription('');
                    
                    // Update streak for engagement
                    await StreakService.updateDailyPracticeStreak();
                    
                    setTimeout(() => {
                      setShowOfferSkillsModal(false);
                      setOfferSuccess('');
                    }, 1200);
                  } catch (err) {
                    setOfferSuccess('Failed to submit offer.');
                  } finally {
                    setOfferSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                  <input
                    type="text"
                    value={offerSkill}
                    onChange={e => setOfferSkill(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="What skill are you offering?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={offerDescription}
                    onChange={e => setOfferDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe your skill and what you can help with..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowOfferSkillsModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={offerSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    {offerSubmitting ? 'Submitting...' : 'Submit Offer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Skill Link Call Modal (replaces old video call modal) */}
      {showSkillLinkCall && activeSessionProvider && blockchainSessionId && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => { setShowSkillLinkCall(false); setActiveSessionProvider(null); setBlockchainSessionId(null); }}
              >
                Close
              </button>
              <Call />
              <div className="mt-2 text-xs text-gray-500">Session ID: {blockchainSessionId} (encrypted & on-chain)</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}