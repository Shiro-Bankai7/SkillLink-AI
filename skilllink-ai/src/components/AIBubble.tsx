import { useState } from "react";

export default function AIBubble({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="fixed bottom-8 right-8 z-40 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-xl w-16 h-16 flex items-center justify-center text-3xl hover:scale-105 transition-all border-4 border-white focus:outline-none"
      onClick={onClick}
      aria-label="Open AI Assistant"
      style={{ cursor: 'pointer' }}
    >
      🤖
    </button>
  );
}
