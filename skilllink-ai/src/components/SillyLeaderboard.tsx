import React from 'react';
import { Trophy } from 'lucide-react';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  total_points: number;
  games_completed: number;
  favorite_coach: string;
  streak_days: number;
  avatar: string;
  rank: number;
}

interface SillyLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  title?: string;
}

const SillyLeaderboard: React.FC<SillyLeaderboardProps> = ({ leaderboard, title = 'Leaderboard' }) => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
      <Trophy className="w-5 h-5 text-yellow-500" />
      <span>{title}</span>
    </h3>
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-gray-700">
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">User</th>
            <th className="px-4 py-2 text-left">Points</th>
            <th className="px-4 py-2 text-left">Games</th>
            <th className="px-4 py-2 text-left">Favorite Coach</th>
            <th className="px-4 py-2 text-left">Streak</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.id} className="border-t">
              <td className="px-4 py-2 font-bold text-purple-600">#{entry.rank}</td>
              <td className="px-4 py-2 flex items-center space-x-2">
                <span className="bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 text-xs font-bold">{entry.avatar}</span>
                <span>{entry.username}</span>
              </td>
              <td className="px-4 py-2">{entry.total_points}</td>
              <td className="px-4 py-2">{entry.games_completed}</td>
              <td className="px-4 py-2">{entry.favorite_coach}</td>
              <td className="px-4 py-2">{entry.streak_days} days</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default SillyLeaderboard;
