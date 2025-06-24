import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX,
  Settings,
  MessageSquare,
  Brain,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { useConversation } from "@elevenlabs/react";
import { TavusConversationAPI } from '../services/aiServices';

const agentId = "agent_01jy82m97xe2nv83sdtfpfmepc";
const client = new ElevenLabsClient({ apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY });

interface CoachingFeedback {
  timestamp: number;
  type: 'positive' | 'improvement' | 'tip';
  message: string;
  category: 'speech' | 'body_language' | 'content' | 'engagement';
}

interface SessionMetrics {
  wordsPerMinute: number;
  fillerWords: number;
  eyeContactPercentage: number;
  confidenceScore: number;
  clarityScore: number;
}

export default function AICoachingSession() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [realTimeFeedback, setRealTimeFeedback] = useState<CoachingFeedback[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<SessionMetrics>({
    wordsPerMinute: 0,
    fillerWords: 0,
    eyeContactPercentage: 0,
    confidenceScore: 0,
    clarityScore: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [voiceAgentResponse, setVoiceAgentResponse] = useState<string | null>(null);
  const [voiceAgentLoading, setVoiceAgentLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ElevenLabs React SDK
  const [voiceMessages, setVoiceMessages] = useState<any[]>([]);
  const [voiceError, setVoiceError] = useState<any>(null);
  const {
    startSession: startVoiceSession,
    endSession: endVoiceSession,
    status: voiceStatus,
    isSpeaking,
    setVolume
  } = useConversation({
    onConnect: () => console.log("Connected to ElevenLabs agent!"),
    onDisconnect: () => console.log("Disconnected from agent."),
    onMessage: (msg: any) => setVoiceMessages(prev => [...prev, msg]),
    onError: (err: any) => setVoiceError(err),
  });

  // Tavus integration state
  const tavusApi = new TavusConversationAPI(import.meta.env.VITE_TAVUS_API_KEY || '');
  const [tavusConversations, setTavusConversations] = useState<any[]>([]);
  const [tavusLoading, setTavusLoading] = useState(false);
  const [tavusError, setTavusError] = useState<string | null>(null);
  const [activeTavusConversation, setActiveTavusConversation] = useState<any | null>(null);

  const [micAllowed, setMicAllowed] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
        updateMetrics();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    fetchTavusConversations();
  }, []);

  const updateMetrics = async () => {
    // Real-time metrics would be calculated from actual audio/video analysis
    setCurrentMetrics(prev => ({
      wordsPerMinute: Math.floor(Math.random() * 50) + 120,
      fillerWords: Math.floor(Math.random() * 3) + prev.fillerWords,
      eyeContactPercentage: Math.floor(Math.random() * 20) + 70,
      confidenceScore: Math.floor(Math.random() * 10) + 80,
      clarityScore: Math.floor(Math.random() * 15) + 85
    }));

    // Generate AI feedback periodically
    if (Math.random() > 0.8) {
      await generateAIFeedback();
    }
  };

  const generateAIFeedback = async () => {
    try {
      // This would integrate with your AI service (OpenAI, Claude, etc.)
      const feedbackTypes: CoachingFeedback['type'][] = ['positive', 'improvement', 'tip'];
      const categories: CoachingFeedback['category'][] = ['speech', 'body_language', 'content', 'engagement'];
      
      const messages = {
        positive: [
          "Great eye contact! Keep it up.",
          "Excellent pace and clarity.",
          "Your confidence is showing through.",
          "Nice use of gestures to emphasize points."
        ],
        improvement: [
          "Try to slow down a bit for better clarity.",
          "Maintain more consistent eye contact.",
          "Reduce filler words like 'um' and 'uh'.",
          "Stand up straighter for better presence."
        ],
        tip: [
          "Take a deep breath before continuing.",
          "Use pauses for emphasis.",
          "Vary your tone to keep engagement.",
          "Remember to smile naturally."
        ]
      };

      const type = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const message = messages[type][Math.floor(Math.random() * messages[type].length)];

      setRealTimeFeedback(prev => [
        ...prev.slice(-4),
        {
          timestamp: Date.now(),
          type,
          message,
          category
        }
      ]);
    } catch (error) {
      console.error('Error generating AI feedback:', error);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startSession = async () => {
    if (!stream) {
      await startCamera();
    }
    
    setIsSessionActive(true);
    setSessionTime(0);
    setRealTimeFeedback([]);
    setCurrentMetrics({
      wordsPerMinute: 0,
      fillerWords: 0,
      eyeContactPercentage: 0,
      confidenceScore: 0,
      clarityScore: 0
    });

    // Start recording for analysis
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start(1000); // Collect data every second
    }
  };

  const endSession = async () => {
    setIsSessionActive(false);
    setIsAnalyzing(true);

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    try {
      // Save session data to Supabase
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('sessions').insert({
          user_id: user.user.id,
          title: 'AI Coaching Session',
          type: 'ai_coaching',
          status: 'completed',
          duration: sessionTime,
          skill: 'Public Speaking',
          metrics: currentMetrics,
          feedback: realTimeFeedback
        });
      }

      // ElevenLabs Voice Analysis Integration
      // -------------------------------------
      // Example: Send audioChunksRef.current to ElevenLabs API for voice analysis
      // Replace the following with your actual ElevenLabs API call
      try {
        // const elevenLabsResult = await elevenLabsAnalyze(audioChunksRef.current);
        // console.log('ElevenLabs voice analysis result:', elevenLabsResult);
      } catch (err) {
        console.error('Error with ElevenLabs voice analysis:', err);
      }

      // Tavus Video Processing Integration
      // ----------------------------------
      // Example: Send video stream or recorded video to Tavus API for video analysis
      // Replace the following with your actual Tavus API call
      try {
        // const tavusResult = await tavusAnalyze(stream);
        // console.log('Tavus video analysis result:', tavusResult);
      } catch (err) {
        console.error('Error with Tavus video analysis:', err);
      }
      // ----------------------------------
      
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFeedbackIcon = (type: CoachingFeedback['type']) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'improvement': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'tip': return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  const getFeedbackColor = (type: CoachingFeedback['type']) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'improvement': return 'bg-orange-50 border-orange-200';
      case 'tip': return 'bg-blue-50 border-blue-200';
    }
  };

  const handleStartVoiceSession = async () => {
    if (!micAllowed) {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicAllowed(true);
    }
    await startVoiceSession({ agentId: "agent_01jy82m97xe2nv83sdtfpfmepc" });
  };

  const fetchTavusConversations = async () => {
    setTavusLoading(true);
    setTavusError(null);
    try {
      const res = await tavusApi.listConversations();
      setTavusConversations(res.conversations || []);
    } catch (e: any) {
      setTavusError(e.message);
    } finally {
      setTavusLoading(false);
    }
  };

  const startTavusConversation = async () => {
    setTavusLoading(true);
    setTavusError(null);
    try {
      const res = await tavusApi.createConversation({
        replica_id: 'r79e1c033f',
        persona_id: 'p5317866',
        callback_url: window.location.origin + '/api/tavus-webhook',
        conversation_name: 'SkillLink AI Session',
        conversational_context: 'You are an AI coach for SkillLink. Help the user practice public speaking and answer questions.',
        custom_greeting: 'Welcome to your SkillLink AI video session!',
        properties: {
          max_call_duration: 1800,
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          enable_recording: true,
          enable_closed_captions: true,
          apply_greenscreen: false,
          language: 'english',
        }
      });
      console.log('Tavus createConversation response:', res); // Debug log
      setActiveTavusConversation(res);
      fetchTavusConversations();
    } catch (e: any) {
      setTavusError(e.message);
    } finally {
      setTavusLoading(false);
    }
  };

  const endTavusConversation = async (conversationId: string) => {
    setTavusLoading(true);
    setTavusError(null);
    try {
      await tavusApi.endConversation(conversationId);
      setActiveTavusConversation(null);
      fetchTavusConversations();
    } catch (e: any) {
      setTavusError(e.message);
    } finally {
      setTavusLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow mb-2">
        <h2 className="text-2xl font-bold mb-1">Welcome to Your AI Coaching Session</h2>
        <p className="mb-2">Practice your public speaking, interviewing, or teaching skills with real-time feedback from our AI coach. Enable your camera and mic, start a session, and receive instant tips on your delivery, confidence, and clarity. You can also try a voice-only or video AI session!</p>
        <ul className="list-disc pl-5 text-indigo-100 text-sm">
          <li>Start a session to activate live feedback and metrics.</li>
          <li>Toggle your mic/camera/audio as needed.</li>
          <li>Review AI feedback and session goals in the sidebar.</li>
          <li>Try the AI video session for a more immersive experience.</li>
        </ul>
      </div>
      {/* Session Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Coaching Session</h2>
              <p className="text-gray-600">Real-time feedback powered by AI</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-500">Session Time</div>
            </div>
            <div className="flex items-center gap-2">
              {!isSessionActive ? (
                <button
                  onClick={startSession}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Session</span>
                </button>
              ) : (
                <button
                  onClick={endSession}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>End Session</span>
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Controls Grouped */}
        <div className="flex flex-wrap items-center gap-3 mt-2 mb-2">
          <button
            onClick={() => setIsMicEnabled(!isMicEnabled)}
            className={`p-3 rounded-lg ${isMicEnabled ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-600'}`}
          >
            {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsCameraEnabled(!isCameraEnabled)}
            className={`p-3 rounded-lg ${isCameraEnabled ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-600'}`}
          >
            {isCameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-3 rounded-lg ${isAudioEnabled ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-600'}`}
          >
            {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button className="p-3 rounded-lg bg-gray-100 text-gray-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-xl aspect-video relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Ready to practice?</p>
                  <p className="text-gray-400">Click start to begin your AI-powered coaching session</p>
                </div>
              </div>
            )}
            
            {/* Session Status Indicator */}
            {isSessionActive && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">LIVE</span>
              </div>
            )}

            {/* Analysis Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Analyzing your performance...</p>
                  <p className="text-sm text-gray-300">Processing with AI</p>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Metrics */}
          {isSessionActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{currentMetrics.wordsPerMinute}</div>
                  <div className="text-xs text-gray-500">WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentMetrics.fillerWords}</div>
                  <div className="text-xs text-gray-500">Filler Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentMetrics.eyeContactPercentage}%</div>
                  <div className="text-xs text-gray-500">Eye Contact</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{currentMetrics.confidenceScore}%</div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentMetrics.clarityScore}%</div>
                  <div className="text-xs text-gray-500">Clarity</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Real-time Feedback */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Feedback</h3>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {realTimeFeedback.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">AI feedback will appear here during your session</p>
                </div>
              ) : (
                realTimeFeedback.map((feedback, index) => (
                  <motion.div
                    key={feedback.timestamp}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${getFeedbackColor(feedback.type)}`}
                  >
                    <div className="flex items-start space-x-2">
                      {getFeedbackIcon(feedback.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{feedback.message}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {feedback.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )} : (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">AI feedback will appear here during your session</p>
                </div>
              )
            </div>
          </div>

          {/* Session Goals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Session Goals</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { goal: 'Maintain 80%+ eye contact', progress: currentMetrics.eyeContactPercentage, target: 80 },
                { goal: 'Keep filler words under 5', progress: currentMetrics.fillerWords <= 5 ? 100 : 0, target: 100 },
                { goal: 'Speak at 120-150 WPM', progress: currentMetrics.wordsPerMinute >= 120 && currentMetrics.wordsPerMinute <= 150 ? 100 : 50, target: 100 },
                { goal: 'Complete 5-minute practice', progress: sessionTime >= 300 ? 100 : (sessionTime / 300) * 100, target: 100 }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.goal}</span>
                    {item.progress >= item.target && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.progress >= item.target ? 'bg-green-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Coaching Session (AI Agent) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Coaching Session (AI Agent)</h3>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded mb-2"
              onClick={handleStartVoiceSession}
              disabled={voiceStatus === 'connected'}
            >
              {voiceStatus === 'connected' ? 'Session Active' : 'Start Voice-to-Voice Session'}
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded mb-2 ml-2"
              onClick={endVoiceSession}
              disabled={voiceStatus !== 'connected'}
            >
              End Session
            </button>
            <div className="min-h-[60px] text-gray-700">
              <div>Status: {voiceStatus}</div>
              <div>Speaking: {isSpeaking ? "Yes" : "No"}</div>
              <div>
                {voiceMessages && voiceMessages.map((msg: any, idx: number) => (
                  <div key={idx}>{msg.text}</div>
                ))}
              </div>
              {voiceError && <div className="text-red-500">{voiceError.message}</div>}
            </div>

            {/* Tavus Conversations */}
            <div className="mt-4">
              <h4 className="text-md font-semibold text-gray-900 mb-2">Tavus Conversations</h4>
              
              {tavusLoading && <div className="text-gray-500">Loading conversations...</div>}
              
              {tavusError && <div className="text-red-500 text-sm">{tavusError}</div>}
              
              <div className="space-y-2">
                {tavusConversations.map((conv) => (
                  <div key={conv.conversation_id} className="p-3 rounded-lg bg-gray-50 border">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{conv.conversation_name}</div>
                        <div className="text-xs text-gray-500">{conv.created_at}</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setActiveTavusConversation(conv)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs font-medium"
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => endTavusConversation(conv.conversation_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-medium"
                        >
                          End
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Conversation Details */}
              {activeTavusConversation && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
                  <div className="text-sm font-medium text-gray-900">Active Conversation</div>
                  <div className="text-xs text-gray-500">{activeTavusConversation.conversation_name}</div>
                  <div className="mt-2">
                    <button
                      onClick={() => endTavusConversation(activeTavusConversation.conversation_id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      End Active Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tavus AI Video Session Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI Video Session (Tavus)</h2>
              <p className="text-gray-600">Practice with a conversational AI video coach</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={startTavusConversation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              disabled={tavusLoading}
            >
              <Play className="w-4 h-4" />
              <span>Start AI Video Session</span>
            </button>
            {activeTavusConversation && (
              <button
                onClick={() => endTavusConversation(activeTavusConversation.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                disabled={tavusLoading}
              >
                <Square className="w-4 h-4" />
                <span>End Video Session</span>
              </button>
            )}
          </div>
        </div>
        {tavusError && <div className="text-red-500 mb-2">{tavusError}</div>}
        {tavusLoading && <div className="text-blue-500 mb-2">Loading...</div>}
        {activeTavusConversation && (activeTavusConversation.join_url || activeTavusConversation.url) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="relative w-[80vw] h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <div>
                  <div className="font-semibold">Session: {activeTavusConversation.conversation_name}</div>
                  <div className="text-xs text-gray-500">Status: {activeTavusConversation.status}</div>
                </div>
                <button
                  onClick={() => endTavusConversation(activeTavusConversation.id || activeTavusConversation.conversation_id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  End Video Session
                </button>
              </div>
              <iframe
                src={activeTavusConversation.join_url || activeTavusConversation.url}
                title="Tavus AI Video Session"
                allow="camera; microphone; fullscreen; autoplay"
                className="flex-1 w-full h-full bg-black rounded-b-2xl"
                frameBorder={0}
              />
            </div>
          </div>
        )}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Past AI Video Sessions</h3>
          <div className="space-y-2">
            {tavusConversations.length === 0 && <div className="text-gray-500">No past sessions found.</div>}
            {tavusConversations.map((conv) => (
              <div key={conv.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{conv.conversation_name}</div>
                  <div className="text-xs text-gray-500">{conv.status}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={conv.join_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    View
                  </a>
                  <button
                    onClick={() => endTavusConversation(conv.id)}
                    className="text-red-500 text-xs font-medium hover:underline"
                  >
                    End
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}