import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AnimationIcon from '@mui/icons-material/Animation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-12 py-6 bg-white shadow">
        <motion.div 
          className="text-2xl font-bold text-indigo-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          SkillLink AI
        </motion.div>
        <motion.div 
          className="space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/login">
            <Button variant="outlined" className="text-indigo-600 border-indigo-600">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="contained" className="bg-indigo-600 text-white">
              Sign Up
            </Button>
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 py-20 bg-white">
        <motion.div 
          className="max-w-xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-indigo-700 mb-6">
            Master Skills, Get Feedback, Grow with AI
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            SkillLink AI is your all-in-one platform for coaching, skill bartering, and personal growth powered by artificial intelligence.
          </p>
          <Link to="/signup">
            <Button variant="contained" size="large" className="bg-indigo-600 text-white">
              Get Started
            </Button>
          </Link>
        </motion.div>

        {/* Video */}
        <motion.div
          className="mt-12 lg:mt-0 w-full max-w-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="aspect-w-16 aspect-h-9">
            <video className="rounded-xl shadow-lg" controls autoPlay muted loop>
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <motion.section 
        className="w-full py-20 bg-gray-100"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="text-4xl font-bold text-center text-indigo-700 mb-16">
          Why SkillLink AI?
        </h3>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6">
          {features.map(({ icon, title, desc }, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-indigo-500 text-4xl mb-4">{icon}</div>
              <h4 className="text-xl font-semibold mb-2">{title}</h4>
              <p className="text-gray-600">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="bg-indigo-600 text-white text-center py-16 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl md:text-4xl font-bold mb-6">Join thousands growing with SkillLink AI</h3>
        <p className="mb-8 text-lg">
          Start coaching, get real feedback, and grow in confidence — for free.
        </p>
        <Link to="/signup">
          <Button
            variant="contained"
            size="large"
            className="bg-white text-indigo-600 hover:bg-gray-200"
            endIcon={<PlayArrowIcon />}
          >
            Get Started
          </Button>
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-600 border-t">
        © {new Date().getFullYear()} SkillLink AI. Built for Bolt.New by{' '}
        <span className="text-indigo-600 font-semibold">Team Hackaholics</span>.
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <SmartDisplayIcon fontSize="inherit" />,
    title: 'AI Video Coaching',
    desc: 'Get real-time feedback on your presentation skills using advanced AI analysis.',
  },
  {
    icon: <Diversity3Icon fontSize="inherit" />,
    title: 'Skill Barter Network',
    desc: 'Exchange your talents with others in the community without spending a dime.',
  },
  {
    icon: <TrendingUpIcon fontSize="inherit" />,
    title: 'Progress Analytics',
    desc: 'Track your growth with detailed insights and performance charts.',
  },
  {
    icon: <PublicIcon fontSize="inherit" />,
    title: 'Global Learning Hub',
    desc: 'Join a thriving global network of learners, teachers, and mentors.',
  },
  {
    icon: <EmojiObjectsIcon fontSize="inherit" />,
    title: 'Creative Prompts',
    desc: 'Generate ideas and unlock new learning paths through AI creativity tools.',
  },
  {
    icon: <PsychologyIcon fontSize="inherit" />,
    title: 'Personalized Coaching',
    desc: 'Get coaching and suggestions based on your learning patterns and mood.',
  },
  {
    icon: <WorkspacePremiumIcon fontSize="inherit" />,
    title: 'Skill Verification',
    desc: 'Earn AI-verified badges and grow your credibility as a learner and coach.',
  },
  {
    icon: <AnimationIcon fontSize="inherit" />,
    title: 'Engaging Learning Experience',
    desc: 'Interactive lessons and gamified challenges to keep you motivated.',
  },
];
// This component renders the landing page for SkillLink AI, showcasing its features and encouraging users to sign up.