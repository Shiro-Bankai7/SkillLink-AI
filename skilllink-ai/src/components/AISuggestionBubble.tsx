import { useState } from "react";

export default function AISuggestionBubble({ suggestion, onDismiss }: { suggestion: string, onDismiss: () => void }) {
  return (
    <div className="fixed bottom-28 right-8 z-40 bg-white border border-blue-200 shadow-lg rounded-xl px-4 py-2 flex items-center gap-2 animate-fade-in">
      <span className="text-blue-700 font-medium">💡 {suggestion}</span>
      <button
        className="ml-2 text-xs text-gray-400 hover:text-red-500 font-bold"
        onClick={onDismiss}
        aria-label="Dismiss suggestion"
      >
        ×
      </button>
    </div>
  );
}
