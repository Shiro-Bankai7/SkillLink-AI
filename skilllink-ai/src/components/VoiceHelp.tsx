import React, { useState } from 'react';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const agentId = "agent_01jy82m97xe2nv83sdtfpfmepc";
const client = new ElevenLabsClient({ apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY });

export default function VoiceHelp() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (question: string) => {
    setLoading(true);
    try {
      // Use the correct API payload for simulateConversation
      const result = await client.conversationalAi.agents.simulateConversation(agentId, {
        simulationSpecification: {
          simulatedUserConfig: {
            firstMessage: question,
            language: "en"
          }
        }
      });
      // Log the result to inspect its structure
      console.log('Agent response:', result);
      setResponse(result ? JSON.stringify(result) : 'No response from agent.');
    } catch (err) {
      setResponse("Sorry, there was an error with the voice agent.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow border max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">Voice Help (AI Agent)</h2>
      <div className="mb-4">
        <input
          type="text"
          className="w-full border rounded p-2"
          placeholder="Ask the AI coach anything..."
          onKeyDown={e => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              handleAsk(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
      <div className="min-h-[60px] text-gray-700">
        {loading ? 'Thinking...' : response}
      </div>
    </div>
  );
}
