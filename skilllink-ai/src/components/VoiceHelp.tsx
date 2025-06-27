import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, X, Send, Volume2, VolumeX } from 'lucide-react';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import lingoDotDev from '../utils/lingoDotDev';
import { StreakService } from '../services/streakService';
import { showNotification } from '../utils/notification';

const agentId = "agent_01jy82m97xe2nv83sdtfpfmepc";
const client = new ElevenLabsClient({ apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY });

// Use the actual ElevenLabs voice ID for Rachel (replace with your real ID from ElevenLabs dashboard)
const ELEVENLABS_RACHEL_ID = 'EXAVITQu4vr4xnSDxMaL'; // <-- Replace with your real Rachel voice ID

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isAudio?: boolean;
}

export default function VoiceHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your AI voice assistant. How can I help you with your learning today?',
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userLocale, setUserLocale] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  // Add OpenAI API call helper
  async function getOpenAIResponse(prompt: string): Promise<string> {
    try {
      // You should proxy this call through your backend in production for security
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful, friendly learning and coaching assistant for SkillLink AI.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });
      if (!response.ok) throw new Error('OpenAI API error');
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
    } catch (err) {
      console.error('OpenAI error:', err);
      return 'Sorry, I could not connect to the AI right now.';
    }
  }

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Detect language of user message
    let detectedLocale = 'en';
    try {
      // Use backend proxy for LingoDotDev language detection
      const resp = await fetch('/api/lingo/recognizeLocale', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text: messageText }) 
      });
      const data = await resp.json();
      detectedLocale = data.locale || 'en';
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
      // Use OpenAI for a real LLM response
      let responseText = await getOpenAIResponse(messageText);
      // Fallback if OpenAI fails
      if (!responseText || responseText.startsWith('Sorry')) {
        responseText = generateFallbackResponse(messageText);
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'agent',
        timestamp: new Date(),
        isAudio: true
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

  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return 'I\'m here to help! You can ask me about learning strategies, skill development, or how to use SkillLink AI features.';
    } else if (lowerMessage.includes('learn') || lowerMessage.includes('skill')) {
      return 'Great question about learning! I can help you find the right learning path, connect with mentors, or suggest practice techniques.';
    } else if (lowerMessage.includes('practice') || lowerMessage.includes('improve')) {
      return 'Practice is key to improvement! I can suggest specific exercises, help you set goals, or find practice partners.';
    } else if (lowerMessage.includes('session') || lowerMessage.includes('coaching')) {
      return 'I can help you prepare for coaching sessions, suggest topics to focus on, or explain how our AI coaching works.';
    } else {
      return 'That\'s an interesting question! I\'m here to support your learning journey. What specific area would you like to focus on?';
    }
  };

  const playAudioResponse = async (text: string) => {
    if (!text || typeof text !== 'string' || !text.trim()) return;
    
    let ttsText = text;
    
    // Translate if needed
    if (userLocale !== 'en') {
      try {
        // Use backend proxy for LingoDotDev translation
        const resp = await fetch('/api/lingo/localizeText', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sourceLocale: 'en', targetLocale: userLocale })
        });
        if (resp.ok) {
          const data = await resp.json();
          ttsText = data.localizedText || text;
        } else {
          ttsText = text;
        }
      } catch (err) {
        console.warn('Translation failed, using original text:', err);
        ttsText = text;
      }
    }
    
    try {
      // Use ElevenLabs TTS
      if (ttsText && typeof ttsText === 'string' && ttsText.trim()) {
        const stream = await client.textToSpeech.convert(
          ELEVENLABS_RACHEL_ID,
          { text: ttsText }
        );
        
        if (stream && stream instanceof ReadableStream) {
          const response = new Response(stream);
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audioObj = new Audio(audioUrl);
          audioObj.volume = 0.8;
          await audioObj.play();
          return;
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
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Voice Assistant</h3>
                    <span className="text-xs text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 inline-block"></span>
                      Online
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
    </>
  );
}