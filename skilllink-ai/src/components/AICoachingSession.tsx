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
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

      // Here you would send audio/video to AI services for analysis
      // Example: ElevenLabs for voice analysis, OpenAI for content analysis
      
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

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Coaching Session</h2>
              <p className="text-gray-600">Real-time feedback powered by AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-500">Session Time</div>
            </div>
            
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

        {/* Controls */}
        <div className="flex items-center space-x-4">
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
              )}
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
        </div>
      </div>
    </div>
  );
}