import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, X, Send, Volume2, VolumeX, Sparkles, Bot, Zap } from 'lucide-react';
import { StreakService } from '../services/streakService';
import { showNotification } from '../utils/notification';
import { GeminiService } from '../services/geminiService';
import { useSubscriptionLimits } from '../hooks/useSubscriptionLimits';
import UpgradePrompt from './UpgradePrompt';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isAudio?: boolean;
  model?: string;
}

export default function VoiceHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your AI voice assistant powered by Google Gemini. How can I help you with your learning today?',
      sender: 'agent',
      timestamp: new Date(),
      model: 'gemini'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userLocale, setUserLocale] = useState('en');
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'huggingface' | 'elevenlabs'>('gemini');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { canUseFeature, incrementUsage, showUpgradePrompt: getUpgradeMessage } = useSubscriptionLimits();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        showNotification('Speech Recognition Error', {
          body: 'Could not recognize speech. Please try again.',
          icon: '/favicon.ico'
        });
      };
    }
  }, []);

  // Use Gemini for all AI responses
  async function getGeminiResponse(prompt: string): Promise<string> {
    try {
      const response = await GeminiService.answerLearningQuestion(prompt);
      return response.text;
    } catch (err) {
      console.error("Gemini error:", err);
      return "I'm having trouble connecting right now. How can I help you with your learning goals?";
    }
  }

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Check usage limits for premium models
    if (selectedModel === 'elevenlabs' && !canUseFeature('aiCoachingSessions')) {
      setShowUpgradePrompt(true);
      return;
    }

    // Detect language of user message (simplified)
    let detectedLocale = 'en';
    try {
      // Simple language detection based on common words
      if (messageText.match(/hola|gracias|por favor|buenos/i)) {
        detectedLocale = 'es';
      } else if (messageText.match(/bonjour|merci|s'il vous plaît|bonsoir/i)) {
        detectedLocale = 'fr';
      }
      setUserLocale(detectedLocale);
    } catch (err) {
      console.warn('Language detection failed, using English:', err);
      detectedLocale = 'en';
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Update streak for engagement
    try {
      const streak = await StreakService.updateDailyPracticeStreak();
      if (streak && streak.current_streak && streak.current_streak % 5 === 0) {
        showNotification('🔥 Streak Milestone!', { 
          body: `You've reached a ${streak.current_streak}-day streak!`,
          icon: '/favicon.ico'
        });
      }
    } catch (err) {
      console.warn('Streak update failed:', err);
    }

    try {
      let responseText = '';
      let modelUsed = selectedModel;

      // Use Gemini for all responses now
      responseText = await getGeminiResponse(messageText);
      modelUsed = 'gemini';

      // For premium models, add special prefix
      if (selectedModel === 'elevenlabs') {
        responseText = '🎙️ Premium ElevenLabs AI: ' + responseText;
        await incrementUsage('aiCoachingSessions');
      } else if (selectedModel === 'huggingface') {
        responseText = '🤗 HuggingFace AI: ' + responseText;
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'agent',
        timestamp: new Date(),
        isAudio: true,
        model: modelUsed
      };

      setMessages(prev => [...prev, agentMessage]);

      // Play audio response if not muted
      if (!isMuted) {
        await playAudioResponse(responseText);
      }

    } catch (err) {
      console.error('Voice agent error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. How can I help you with your learning goals?',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioResponse = async (text: string) => {
    if (!text || typeof text !== 'string' || !text.trim()) return;

    let ttsText = text;

    // Simple translation for common responses
    if (userLocale !== 'en') {
      const translations: Record<string, Record<string, string>> = {
        'es': {
          'How can I help you': 'Cómo puedo ayudarte',
          'That\'s a great question': 'Esa es una gran pregunta',
          'I\'m here to help': 'Estoy aquí para ayudar'
        },
        'fr': {
          'How can I help you': 'Comment puis-je vous aider',
          'That\'s a great question': 'C\'est une excellente question',
          'I\'m here to help': 'Je suis là pour vous aider'
        }
      };

      const langTranslations = translations[userLocale];
      if (langTranslations) {
        Object.entries(langTranslations).forEach(([en, translated]) => {
          if (ttsText.includes(en)) {
            ttsText = ttsText.replace(en, translated);
          }
        });
      }
    }

    try {
      // Try ElevenLabs TTS for premium users
      if (selectedModel === 'elevenlabs' && import.meta.env.VITE_ELEVENLABS_API_KEY) {
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Rachel voice ID
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({ 
            text: ttsText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audioObj = new Audio(audioUrl);
          audioObj.volume = 0.8;
          await audioObj.play();
          return;
        } else {
          console.warn('ElevenLabs TTS failed:', response.status);
        }
      }
    } catch (err) {
      console.warn('ElevenLabs TTS failed, falling back to browser TTS:', err);
    }

    // Fallback: browser speech synthesis
    if ('speechSynthesis' in window && ttsText && ttsText.trim()) {
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Set language if available
      if (userLocale !== 'en') {
        utterance.lang = userLocale === 'es' ? 'es-ES' : userLocale === 'fr' ? 'fr-FR' : 'en-US';
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      showNotification('Speech Recognition Not Available', {
        body: 'Your browser doesn\'t support speech recognition.',
        icon: '/favicon.ico'
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getModelIcon = (model?: string) => {
    switch (model) {
      case 'gemini': return '🤖';
      case 'huggingface': return '🤗';
      case 'elevenlabs': return '🎙️';
      default: return '🤖';
    }
  };

  const getModelName = (model?: string) => {
    switch (model) {
      case 'gemini': return 'Gemini (Free)';
      case 'huggingface': return 'Hugging Face';
      case 'elevenlabs': return 'ElevenLabs (Pro)';
      default: return 'AI';
    }
  };

  return (
    <>
      {/* Floating Voice Help Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <MessageSquare className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
      </motion.button>

      {/* Voice Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-end sm:justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, x: 400, y: 100 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 400, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full sm:w-96 h-full sm:h-[600px] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Voice Assistant</h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 inline-block"></span>
                      Powered by {getModelName(selectedModel)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded-lg ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Model Selector */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">AI Model:</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => setSelectedModel('gemini')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedModel === 'gemini'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🤖 Gemini (Free)
                  </button>
                  <button
                    onClick={() => setSelectedModel('huggingface')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedModel === 'huggingface'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🤗 HuggingFace
                  </button>
                  <button
                    onClick={() => {
                      if (canUseFeature('aiCoachingSessions')) {
                        setSelectedModel('elevenlabs');
                      } else {
                        setShowUpgradePrompt(true);
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedModel === 'elevenlabs'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🎙️ ElevenLabs {!canUseFeature('aiCoachingSessions') && '(Pro)'}
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.sender === 'agent' && message.model && (
                        <div className="text-xs opacity-70 mb-1">
                          {getModelIcon(message.model)} {getModelName(message.model)}
                        </div>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                        {message.isAudio && !isMuted && (
                          <span className="ml-2">🔊</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 rounded-full ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isLoading}
                    className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {isListening && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Listening... Speak now
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="elevenlabs"
        message="ElevenLabs premium voice AI is available with Pro! Upgrade to access advanced voice features and unlimited AI coaching sessions."
      />
    </>
  );
}