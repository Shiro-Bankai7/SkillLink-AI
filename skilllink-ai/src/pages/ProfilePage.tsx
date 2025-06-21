import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

// Placeholder for ElevenLabs and Tavus integration
// You will provide the actual integration code and .env keys

export default function ProfilePage() {
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState('');
  const [role, setRole] = useState<'learner' | 'teacher' | 'both'>('both');
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [videoSample, setVideoSample] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    await supabase.from('profiles').upsert({
      id: user.id,
      bio,
      skills,
      lookingFor,
      role,
    });
    setLoading(false);
    alert('Profile updated!');
  };

  // Placeholder: Integrate ElevenLabs and Tavus here
  const handleVoiceAnalysis = async () => {
    if (!voiceSample) return;
    // Use ElevenLabs API with your .env key
    // Example: await elevenLabsAnalyze(voiceSample);
    alert('Voice analysis (ElevenLabs) would run here.');
  };

  const handleVideoAnalysis = async () => {
    if (!videoSample) return;
    // Use Tavus API with your .env key
    // Example: await tavusAnalyze(videoSample);
    alert('Video analysis (Tavus) would run here.');
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
      <form onSubmit={handleProfileSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block font-medium mb-1">Bio</label>
          <textarea
            className="w-full border rounded p-2"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Skills (comma separated)</label>
          <input
            className="w-full border rounded p-2"
            value={skills.join(', ')}
            onChange={e => setSkills(e.target.value.split(',').map(s => s.trim()))}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Looking For</label>
          <input
            className="w-full border rounded p-2"
            value={lookingFor}
            onChange={e => setLookingFor(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Role</label>
          <select
            className="w-full border rounded p-2"
            value={role}
            onChange={e => setRole(e.target.value as 'learner' | 'teacher' | 'both')}
          >
            <option value="learner">Learner</option>
            <option value="teacher">Teacher</option>
            <option value="both">Both</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded font-semibold mt-4"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold mb-2">AI Skill Analysis</h2>
        <div>
          <label className="block font-medium mb-1">Upload Voice Sample (for ElevenLabs)</label>
          <input type="file" accept="audio/*" onChange={e => setVoiceSample(e.target.files?.[0] || null)} />
          <button
            className="ml-2 bg-blue-500 text-white px-4 py-1 rounded"
            onClick={handleVoiceAnalysis}
            disabled={!voiceSample}
            type="button"
          >Analyze Voice</button>
        </div>
        <div>
          <label className="block font-medium mb-1">Upload Video Sample (for Tavus)</label>
          <input type="file" accept="video/*" onChange={e => setVideoSample(e.target.files?.[0] || null)} />
          <button
            className="ml-2 bg-green-500 text-white px-4 py-1 rounded"
            onClick={handleVideoAnalysis}
            disabled={!videoSample}
            type="button"
          >Analyze Video</button>
        </div>
      </div>

      <button
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-bold text-lg mt-8"
        onClick={() => navigate('/pricing')}
      >
        Upgrade to Pro
      </button>
    </div>
  );
}
