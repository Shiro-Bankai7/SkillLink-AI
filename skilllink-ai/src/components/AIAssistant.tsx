import { useState } from 'react';

const HF_MODEL = import.meta.env.VITE_HF_MODEL;
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

export default function AIAssistant() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    setLoading(true);
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: message }),
    });

    const data = await response.json();
    const reply = data.generated_text || data[0]?.generated_text || '🤖 No reply.';

    setChat([...chat, `🧑: ${message}`, `🤖: ${reply}`]);
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="max-h-60 overflow-y-auto text-sm">
        {chat.map((c, i) => (
          <p key={i}>{c}</p>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          className="border flex-1 px-2 py-1 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask the SkillLink AI..."
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={!message || loading}
          onClick={askAI}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
