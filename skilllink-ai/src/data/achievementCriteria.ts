// Achievement criteria for SkillLink AI
// Each achievement should have a unique key, a description, and the criteria logic (in plain English or pseudocode)

// Define a type for the user object expected by achievement checks
export interface AchievementUser {
  sessions: Array<{ type: string; status: string; skill?: string }>,
  streakData?: { dailyStreak: number },
  aiFeedbackCount?: number,
  feedbackGivenCount?: number,
  created_at?: string,
}

export const achievementCriteria = [
  {
    key: 'first_ai_coaching',
    title: 'First Steps',
    description: 'Complete your first AI coaching session',
    // Earned by: Completing at least 1 AI coaching session
    check: (user: AchievementUser) => user.sessions.filter(s => s.type === 'ai_coaching' && s.status === 'completed').length >= 1
  },
  {
    key: 'skill_sharer',
    title: 'Skill Sharer',
    description: 'Teach 5 different skills',
    // Earned by: Teaching 5 different skills in skill exchange sessions
    check: (user: AchievementUser) => new Set(user.sessions.filter(s => s.type === 'skill_exchange' && s.status === 'completed').map(s => s.skill)).size >= 5
  },
  {
    key: 'community_builder',
    title: 'Community Builder',
    description: 'Help 10 learners improve their skills',
    // Earned by: Completing 10 skill exchange sessions
    check: (user: AchievementUser) => user.sessions.filter(s => s.type === 'skill_exchange' && s.status === 'completed').length >= 10
  },
  {
    key: 'week_warrior',
    title: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    // Earned by: Maintaining a 7-day daily streak
    check: (user: AchievementUser) => (user.streakData?.dailyStreak ?? 0) >= 7
  },
  {
    key: 'monthly_master',
    title: 'Monthly Master',
    description: 'Practice for 30 days in a row',
    // Earned by: Maintaining a 30-day daily streak
    check: (user: AchievementUser) => (user.streakData?.dailyStreak ?? 0) >= 30
  },
  {
    key: 'ai_feedback_guru',
    title: 'AI Feedback Guru',
    description: 'Receive 10 pieces of AI feedback',
    // Earned by: Getting 10 feedback messages from the AI coach
    check: (user: AchievementUser) => (user.aiFeedbackCount || 0) >= 10
  },
  {
    key: 'session_marathon',
    title: 'Session Marathon',
    description: 'Complete 20 sessions of any type',
    // Earned by: Completing 20 sessions (any type)
    check: (user: AchievementUser) => user.sessions.filter(s => s.status === 'completed').length >= 20
  },
  {
    key: 'streak_enthusiast',
    title: 'Streak Enthusiast',
    description: 'Maintain a daily streak for 3 days',
    // Earned by: Practicing 3 days in a row
    check: (user: AchievementUser) => (user.streakData?.dailyStreak ?? 0) >= 3
  },
  {
    key: 'group_leader',
    title: 'Group Leader',
    description: 'Host or complete 3 group sessions',
    // Earned by: Completing 3 group sessions
    check: (user: AchievementUser) => user.sessions.filter((s) => s.type === 'group_session' && s.status === 'completed').length >= 3
  },
  {
    key: 'feedback_friend',
    title: 'Feedback Friend',
    description: 'Give feedback to 5 peers',
    // Earned by: Giving feedback to 5 different users (requires feedback tracking)
    check: (user: AchievementUser) => (user.feedbackGivenCount || 0) >= 5
  },
  {
    key: 'early_adopter',
    title: 'Early Adopter',
    description: 'Join SkillLink AI in the first month',
    // Earned by: Account created within 30 days of platform launch
    check: (user: AchievementUser) => {
      const launchDate = new Date('2025-06-01');
      return user.created_at && new Date(user.created_at) < new Date(launchDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  // Add more as needed
];
