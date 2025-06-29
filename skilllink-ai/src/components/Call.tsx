import VideoCall from './VideoCall';
import Whiteboard from './Whiteboard';
import AIAssistant from "./AIAssistant";
import ErrorBoundary from "./ErrorBoundary";
import { useState } from "react";
import { Bot, Lightbulb, Mic, PhoneOff, Users, Video, MessageSquare, Monitor, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserInfo {
  id: string;
  name: string;
  email?: string;
}

export default function Call({ currentUser, matchedUser }: { currentUser: UserInfo; matchedUser: UserInfo }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("Try using the whiteboard to sketch your ideas!");
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [activeView, setActiveView] = useState<'video' | 'whiteboard' | 'both'>('both');

  const handleCallEnd = () => {
    // Handle call end logic here
    console.log('Call ended');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-900 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 rounded-b-2xl mt-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">SkillLink Studio</h1>
              <p className="text-sm text-gray-300">Collaborative Learning Space</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveView('video')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'video' 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Video Only
            </button>
            <button
              onClick={() => setActiveView('both')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'both' 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setActiveView('whiteboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'whiteboard' 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Whiteboard
            </button>
          </div>
          
          <button className="px-4 py-2 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm">
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex gap-6 px-6 py-6 max-w-7xl mx-auto w-full">
        {/* Video Panel */}
        {(activeView === 'video' || activeView === 'both') && (
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${
              activeView === 'both' ? 'flex-1' : 'w-full'
            } bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden`}
          >
            <ErrorBoundary>
              <VideoCall onCallEnd={handleCallEnd} currentUser={currentUser} matchedUser={matchedUser} />
            </ErrorBoundary>
          </motion.div>
        )}

        {/* Whiteboard Panel */}
        {(activeView === 'whiteboard' || activeView === 'both') && (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${
              activeView === 'both' ? 'flex-1' : 'w-full'
            } bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden`}
          >
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Collaborative Whiteboard
                </h3>
                <p className="text-sm text-gray-300 mt-1">Draw, sketch, and brainstorm together</p>
              </div>
              <div className="flex-1 p-4">
                <div className="h-full bg-white rounded-xl shadow-inner">
                  <Whiteboard />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Assistant Bubble */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20 backdrop-blur-sm"
        onClick={() => setAiOpen(!aiOpen)}
        aria-label="Open AI Assistant"
      >
        <Bot className="w-8 h-8" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
      </motion.button>

      {/* AI Assistant Modal */}
      {aiOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-28 right-8 z-50 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                  <p className="text-sm text-indigo-100">Your learning companion</p>
                </div>
              </div>
              <button 
                className="text-white/80 hover:text-white text-2xl font-bold transition-colors" 
                onClick={() => setAiOpen(false)} 
                aria-label="Close AI"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6">
            <AIAssistant />
          </div>
        </motion.div>
      )}

      {/* AI Suggestion Bubble */}
      {showSuggestion && suggestion && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed bottom-28 right-28 z-40 bg-white/95 backdrop-blur-md border border-indigo-200 shadow-xl rounded-xl px-4 py-3 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">💡 Pro Tip</p>
              <p className="text-sm text-gray-700">{suggestion}</p>
            </div>
            <button
              className="text-gray-400 hover:text-red-500 text-lg font-bold flex-shrink-0"
              onClick={() => setShowSuggestion(false)}
              aria-label="Dismiss suggestion"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 w-full max-w-7xl mx-auto text-center text-xs text-white/60 py-4 px-6"
      >
        <div className="flex items-center justify-center gap-4">
          <span>SkillLink Studio &copy; 2025</span>
          <span>•</span>
          <span>Powered by WebRTC & PeerJS</span>
          <span>•</span>
          <span>Built with ⚡ Bolt.new</span>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}