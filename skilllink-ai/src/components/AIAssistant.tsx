import { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

export default function AIAssistant() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    
    try {
      // Use the highest free Gemini model (gemini-1.5-flash)
      const response = await GeminiService.generateResponse(
        message,
        'You are a helpful AI assistant for SkillLink AI, a platform for skill learning and exchange. Provide encouraging, practical advice for learning and skill development.',
        'gemini-1.5-flash'
      );

      setChat([...chat, `🧑: ${message}`, `🤖 Gemini: ${response.text}`]);
      setMessage('');
    } catch (error) {
      console.error('Gemini AI error:', error);
      setChat([...chat, `🧑: ${message}`, `🤖: Sorry, I'm having trouble connecting right now. Please try again!`]);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="max-h-60 overflow-y-auto text-sm">
        {chat.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            <div className="text-2xl mb-2">🤖</div>
            <p>Hi! I'm your AI assistant powered by Google Gemini.</p>
            <p>Ask me anything about learning, skills, or SkillLink AI!</p>
          </div>
        )}
        {chat.map((c, i) => (
          <p key={i} className={`mb-2 ${c.startsWith('🤖') ? 'text-blue-700 font-medium' : 'text-gray-800'}`}>
            {c}
          </p>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          className="border flex-1 px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && askAI()}
          placeholder="Ask the SkillLink AI powered by Gemini..."
          disabled={loading}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 hover:bg-blue-700 transition-colors"
          disabled={!message.trim() || loading}
          onClick={askAI}
        >
          {loading ? (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Thinking...</span>
            </div>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  );
}