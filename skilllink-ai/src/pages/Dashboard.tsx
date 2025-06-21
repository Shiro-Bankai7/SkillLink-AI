import React from 'react';
import AICoachingSession from '../components/AICoachingSession';
import SkillExchange from '../components/SkillExchange';
import SmartMatchMaking from '../components/SmartMatchMaking';
import SillySkillMode from '../components/SillySkillMode';
import SessionReplays from '../components/SessionReplays';
import VideoAnalysis from '../components/VideoAnalysis';

export default function Dashboard() {
  return (
    <div className="space-y-12 p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">SkillLink AI Dashboard</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">AI Coaching Session</h2>
        <AICoachingSession />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Skill Exchange</h2>
        <SkillExchange />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Smart Matchmaking</h2>
        <SmartMatchMaking />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Silly Skill Mode</h2>
        <SillySkillMode />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Session Replays</h2>
        <SessionReplays />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Video Analysis</h2>
        <VideoAnalysis />
      </section>
    </div>
  );
}
