import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase';
import { Mic, Send, Volume2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  content: string;
  created_at: string;
  type: 'text' | 'voice';
  voice_url?: string;
}

const CommunityChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch and subscribe to messages
  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel('community_chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_chat' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('community_chat')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
  };

  const sendMessage = async (content: string, type: 'text' | 'voice', voice_url?: string) => {
    if (!user) return;
    setSending(true);
    await supabase.from('community_chat').insert({
      user_id: user.id,
      username: user.email?.split('@')[0] || 'User',
      avatar: user.email?.substring(0, 2).toUpperCase() || 'AN',
      content,
      type,
      voice_url: voice_url || null,
    });
    setSending(false);
    setInput('');
    setAudioUrl(null);
  };

  // Voice recording logic
  const startRecording = async () => {
    setRecording(true);
    audioChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      // Upload to Supabase Storage
      const fileName = `voice_${user?.id || 'anon'}_${Date.now()}.webm`;
      const { data, error } = await supabase.storage.from('community-voice').upload(fileName, audioBlob, { upsert: true });
      if (!error && data) {
        const { data: publicUrl } = supabase.storage.from('community-voice').getPublicUrl(fileName);
        if (publicUrl?.publicUrl) {
          await sendMessage('[Voice message]', 'voice', publicUrl.publicUrl);
        }
      }
    };
    mediaRecorder.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-96 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex-1 overflow-y-auto space-y-3 mb-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start space-x-3 ${msg.user_id === user?.id ? 'justify-end' : ''}`}>
            <div className="flex-shrink-0 bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {msg.avatar}
            </div>
            <div>
              <div className="text-xs text-gray-500">{msg.username} • {new Date(msg.created_at).toLocaleTimeString()}</div>
              {msg.type === 'text' ? (
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-900 mt-1 max-w-xs break-words">
                  {msg.content}
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-1">
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                  <audio controls src={msg.voice_url} className="max-w-xs" />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          placeholder="Share a skill, offer, or message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) sendMessage(input, 'text'); }}
          disabled={sending || recording}
        />
        <button
          className={`p-2 rounded-full ${recording ? 'bg-red-100' : 'bg-indigo-100'} text-indigo-600 hover:bg-indigo-200 transition`}
          onClick={recording ? stopRecording : startRecording}
          disabled={sending}
        >
          {recording ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
          onClick={() => input.trim() && sendMessage(input, 'text')}
          disabled={sending || !input.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-1">All messages are public and persistent. Use this chat to market your skills, find partners, or share offers!</div>
    </div>
  );
};

export default CommunityChat;
