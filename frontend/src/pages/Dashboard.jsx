import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import VirtualBuddy from '../components/VirtualBuddy';
import PomodoroTimer from '../components/PomodoroTimer';
import { Trophy, Flame, Clock, LogOut, User, Target } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout, isAuthenticated, fetchProfile } = useAuth();
  const [buddyMood, setBuddyMood] = useState('idle');
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [idleTimeout, setIdleTimeout] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  // Set buddy to sleepy after 5 minutes of idle
  useEffect(() => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    
    if (buddyMood === 'idle') {
      const timeout = setTimeout(() => {
        setBuddyMood('sleepy');
      }, 5 * 60 * 1000); // 5 minutes
      setIdleTimeout(timeout);
    }
    
    return () => {
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, [buddyMood]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/sessions/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSessionComplete = async (sessionType, duration) => {
    setBuddyMood('celebrating');
    
    // Reset to happy after celebration
    setTimeout(() => {
      setBuddyMood('happy');
      setTimeout(() => setBuddyMood('idle'), 3000);
    }, 3000);

    // Refresh stats and profile
    if (isAuthenticated) {
      await fetchStats();
      await fetchProfile();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isAuthenticated ? `Welcome back, ${user?.username}!` : 'Welcome to KumaTime!'}
            </h1>
            <p className="text-gray-600">Let's focus together with your study buddy 🐻</p>
          </div>
          
          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Virtual Buddy Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8"
          >
            <VirtualBuddy 
              mood={buddyMood}
              level={user?.buddy_level || 1}
              happiness={user?.buddy_happiness || 50}
            />
          </motion.div>

          {/* Timer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8"
          >
            <PomodoroTimer 
              onSessionComplete={handleSessionComplete}
              onMoodChange={setBuddyMood}
            />
          </motion.div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* User Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} />
              Your Progress
            </h2>
            
            <div className="space-y-4">
              {/* Today's Stats */}
              <div className="p-4 bg-pastel-lemon/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Today</span>
                  <Target size={16} className="text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.today?.sessions || 0} sessions
                </p>
                <p className="text-sm text-gray-600">
                  {Math.round((stats?.today?.duration || 0) / 60)} minutes focused
                </p>
              </div>

              {/* Streak */}
              <div className="p-4 bg-pastel-peach/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <Flame size={16} className="text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.overall?.current_streak || 0} days
                </p>
                <p className="text-sm text-gray-600">
                  Best: {stats?.overall?.longest_streak || 0} days
                </p>
              </div>

              {/* Total Time */}
              <div className="p-4 bg-pastel-blue/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Focus Time</span>
                  <Clock size={16} className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round((stats?.overall?.total_focus_time || 0) / 60)}h
                </p>
                <p className="text-sm text-gray-600">
                  {stats?.overall?.total_sessions || 0} total sessions
                </p>
              </div>
            </div>
          </motion.div>

          {/* Badges Card */}
          {isAuthenticated && user?.badges && user.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold mb-4">🏆 Achievements</h2>
              <div className="grid grid-cols-3 gap-3">
                {user.badges.slice(0, 6).map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex flex-col items-center p-2 bg-gradient-to-br from-pastel-lavender/50 to-pastel-pink/50 rounded-lg"
                    title={badge.description}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-xs text-center mt-1 text-gray-700">{badge.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-pastel-mint/50 to-pastel-blue/50 rounded-3xl shadow-xl p-6"
          >
            <h3 className="font-bold mb-2">💡 Study Tip</h3>
            <p className="text-sm text-gray-700">
              Take short breaks between focus sessions. Your buddy will keep you company!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;