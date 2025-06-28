import VideoCall from './VideoCall';
import Whiteboard from './Whiteboard';
import AIAssistant from "./AIAssistant";
import ErrorBoundary from "./ErrorBoundary";
import AIBubble from "./AIBubble";
import AISuggestionBubble from "./AISuggestionBubble";
import { useState } from "react";
import { Bot, Lightbulb, Mic, PhoneOff } from 'lucide-react';

export default function Call() {
  const [aiOpen, setAiOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("Try using the whiteboard to sketch your ideas!");
  const [showSuggestion, setShowSuggestion] = useState(true);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-start relative overflow-x-hidden">
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between px-6 py-3 bg-white/95 border-b border-gray-200 shadow-sm rounded-t-2xl mt-6 z-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 rounded-full bg-indigo-200 items-center justify-center text-2xl font-bold text-indigo-700 shadow">SL</span>
          <span className="text-xl font-bold text-indigo-700 tracking-tight">SkillLink Room</span>
        </div>
        <div className="flex gap-2 items-center">
          <button className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 active:bg-indigo-300 transition flex items-center gap-2">
            <Mic className="w-5 h-5" /> Mute
          </button>
          <button className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 active:bg-red-300 transition flex items-center gap-2">
            <PhoneOff className="w-5 h-5" /> Leave
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col md:flex-row gap-6 px-2 py-8 items-stretch z-0">
        {/* Video Panel */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-200 p-4 min-h-[320px] max-h-[480px]">
          <ErrorBoundary>
            <VideoCall key="main-video-call" />
          </ErrorBoundary>
        </div>
        {/* Whiteboard Panel */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-200 p-4 min-h-[320px] max-h-[480px]">
          <Whiteboard />
        </div>
      </div>
      {/* AI Assistant Bubble */}
      <button
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-xl w-16 h-16 flex items-center justify-center text-3xl hover:scale-105 transition-all border-4 border-white focus:outline-none"
        onClick={() => setAiOpen((v) => !v)}
        aria-label="Open AI Assistant"
        style={{ cursor: 'pointer' }}
      >
        <Bot className="w-8 h-8" />
      </button>
      {/* AI Assistant Modal */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-8 pointer-events-none">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-blue-200 p-4 pointer-events-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base font-semibold text-blue-600 flex items-center gap-2"><Bot className="w-5 h-5" /> AI Assistant</span>
              <button className="text-gray-400 hover:text-red-500 text-xl font-bold" onClick={() => setAiOpen(false)} aria-label="Close AI">×</button>
            </div>
            <AIAssistant />
          </div>
        </div>
      )}
      {/* AI Suggestion Bubble */}
      {showSuggestion && suggestion && (
        <div className="fixed bottom-28 right-8 z-40 bg-white border border-blue-200 shadow-lg rounded-xl px-4 py-2 flex items-center gap-2 animate-fade-in">
          <Lightbulb className="w-5 h-5 text-blue-400" />
          <span className="text-blue-700 font-medium">{suggestion}</span>
          <button
            className="ml-2 text-xs text-gray-400 hover:text-red-500 font-bold"
            onClick={() => setShowSuggestion(false)}
            aria-label="Dismiss suggestion"
          >
            ×
          </button>
        </div>
      )}
      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto text-center text-xs text-gray-400 py-2 mb-2 z-10">SkillLink &copy; 2025  Built with ⚡ Bolt.new</div>
    </div>
  );
}
