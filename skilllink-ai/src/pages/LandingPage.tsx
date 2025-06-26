import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Star, 
  Users, 
  Brain, 
  Video, 
  MessageSquare, 
  TrendingUp,
  Award,
  Globe,
  Zap,
  Shield,
  Heart,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import BoltBadge from '../components/BoltBadge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Animated Bolt Badge floating above hero */}
      <BoltBadge variant="float" />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SkillLink AI</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link 
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  🚀 AI-Powered Learning
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✨ Skill Bartering
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Master Skills with
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> AI Coaching</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join the future of learning with real-time AI feedback, skill bartering, and personalized coaching. 
                Practice, improve, and connect with learners worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Learning Free</span>
                </Link>
                <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-gray-50">
                  <Video className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">4.9/5</span>
                  <span>from 2,000+ users</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="font-medium">50k+</span>
                  <span>active learners</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Coaching Session</h3>
                      <p className="text-sm text-gray-600">Real-time feedback & analysis</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                      <span className="text-sm font-bold text-green-600">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Excellent eye contact</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Clear speech delivery</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-700">Try varying your pace</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to master any skill
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered coaching to peer skill exchange, we've built the complete platform for modern learning
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by learners worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who are already transforming their skills
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to transform your learning?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
              Join thousands of learners who are already using AI to master new skills faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup"
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start Learning Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors">
                Schedule Demo
              </button>
            </div>
            <p className="text-indigo-200 text-sm mt-4">
              No credit card required • Free forever plan available
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SkillLink AI</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The future of learning is here. Master any skill with AI-powered coaching and peer collaboration.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Coaching</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Skill Exchange</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Progress Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <BoltBadge variant="footer" className="mb-2" />
            <p>&copy; 2025 SkillLink AI. All rights reserved. Built with ⚡Bolt.new for the Worlds Largest Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Coaching',
    description: 'Get real-time feedback on your presentation skills, body language, and speech patterns with advanced AI analysis.',
    color: 'bg-indigo-500'
  },
  {
    icon: Users,
    title: 'Skill Bartering Network',
    description: 'Exchange your expertise with others in the community. Teach what you know, learn what you need.',
    color: 'bg-purple-500'
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Track your improvement with detailed insights, performance charts, and personalized learning recommendations.',
    color: 'bg-green-500'
  },
  {
    icon: Video,
    title: 'Live Video Sessions',
    description: 'Practice with AI coaches or connect with peers through high-quality video calls and screen sharing.',
    color: 'bg-blue-500'
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Join learners from around the world. Practice languages, share cultures, and build international connections.',
    color: 'bg-orange-500'
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your learning data is protected with enterprise-grade security and privacy controls.',
    color: 'bg-red-500'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    quote: 'SkillLink AI helped me overcome my fear of public speaking. The AI feedback was incredibly detailed and helped me improve faster than I ever thought possible.'
  },
  {
    name: 'Marcus Johnson',
    role: 'Marketing Manager',
    quote: 'The skill bartering feature is amazing! I taught design skills and learned Spanish in return. It\'s like having a global classroom at your fingertips.'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Teacher',
    quote: 'As an educator, I\'m impressed by the quality of AI coaching. It provides insights that would take human coaches hours to identify.'
  }
];