import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Settings,
  MessageSquare,
  Clock,
  Users,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';
import { tavusService, type TavusConversation } from '../services/tavusService';
import { supabase } from '../services/supabase';

interface TavusConversationSessionProps {
  sessionType: 'teaching' | 'coaching';
  skillName?: string;
  coachingType?: string;
  onSessionEnd?: (conversation: TavusConversation) => void;
}

export default function TavusConversationSession({ 
  sessionType, 
  skillName, 
  coachingType,
  onSessionEnd 
}: TavusConversationSessionProps) {
  const [conversation, setConversation] = useState<TavusConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const startConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let newConversation: TavusConversation;
      
      if (sessionType === 'teaching' && skillName) {
        newConversation = await tavusService.createTeachingSession(
          skillName, 
          'friendly and knowledgeable expert', 
          'intermediate'
        );
      } else if (sessionType === 'coaching' && coachingType) {
        newConversation = await tavusService.createCoachingSession(coachingType);
      } else {
        throw new Error('Invalid session configuration');
      }

      setConversation(newConversation);
      setIsInCall(true);
      setSessionTime(0);

      // Save session to database
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('sessions').insert({
          user_id: user.user.id,
          title: newConversation.conversation_name,
          type: 'ai_coaching',
          status: 'in_progress',
          date: new Date().toISOString(),
          duration: 0,
          skill: skillName || coachingType || 'General',
          tavus_conversation_id: newConversation.conversation_id
        });
      }

    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    if (!conversation) return;

    setIsLoading(true);
    try {
      await tavusService.endConversation(conversation.conversation_id);
      
      // Update session in database
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('sessions')
          .update({ 
            status: 'completed',
            duration: Math.floor(sessionTime / 60) // Convert to minutes
          })
          .eq('tavus_conversation_id', conversation.conversation_id);
      }

      setIsInCall(false);
      if (onSessionEnd) {
        onSessionEnd(conversation);
      }
    } catch (err) {
      console.error('Error ending conversation:', err);
      setError('Failed to end conversation properly.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTitle = () => {
    if (sessionType === 'teaching' && skillName) {
      return `${skillName} Teaching Session`;
    }
    if (sessionType === 'coaching' && coachingType) {
      return `${coachingType.replace('-', ' ')} Coaching`;
    }
    return 'AI Conversation Session';
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Video className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getSessionTitle()}</h2>
              <p className="text-gray-600">AI-powered conversational learning</p>
            </div>
          </div>
          
          {isInCall && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-500">Session Time</div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!isInCall ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to start your session?</h3>
              <p className="text-gray-600">
                Connect with an AI {sessionType === 'teaching' ? 'teacher' : 'coach'} for personalized learning
              </p>
            </div>
            
            <button
              onClick={startConversation}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium flex items-center space-x-2 mx-auto"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Starting...' : 'Start Session'}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tavus Video Fullscreen Modal */}
            {isInCall && conversation && conversation.conversation_url && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                <div className="relative w-[80vw] h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b">
                    <div>
                      <div className="font-semibold">Session: {conversation.conversation_name || 'AI Session'}</div>
                      <div className="text-xs text-gray-500">Status: {conversation.status || 'active'}</div>
                    </div>
                    <button
                      onClick={endConversation}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      End Video Session
                    </button>
                  </div>
                  <iframe
                    src={conversation.conversation_url}
                    title="Tavus AI Video Session"
                    allow="camera; microphone; fullscreen; autoplay"
                    className="flex-1 w-full h-full bg-black rounded-b-2xl"
                    frameBorder={0}
                  />
                </div>
              </div>
            )}
            {/* Video Call Interface (fallback if no join_url) */}
            <div className="bg-gray-900 rounded-xl aspect-video relative overflow-hidden">
              {conversation && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Connected to AI {sessionType === 'teaching' ? 'Teacher' : 'Coach'}</h3>
                    <p className="text-gray-300">Conversation ID: {conversation.conversation_id}</p>
                  </div>
                </div>
              )}
              {/* Session Status */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">LIVE</span>
              </div>
            </div>
            {/* Call Controls */}
            <div className="flex items-center justify-center space-x-4 mt-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button
                onClick={endConversation}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PhoneOff className="w-5 h-5" />
                )}
              </button>
              <button className="p-3 rounded-full bg-gray-100 text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Session Info */}
      {conversation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Session Name:</span>
              <p className="text-gray-900">{conversation.conversation_name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <p className="text-gray-900 capitalize">{conversation.status}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Started:</span>
              <p className="text-gray-900">{new Date(conversation.created_at).toLocaleTimeString()}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Duration:</span>
              <p className="text-gray-900">{formatTime(sessionTime)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}