import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFocusMode } from '../contexts/FocusModeContext';
import VirtualBuddy from '../components/VirtualBuddy';
import PomodoroTimer from '../components/PomodoroTimer';
import { Trophy, Flame, Clock, User, Target } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout, isAuthenticated, fetchProfile } = useAuth();
  const { focusMode } = useFocusMode();
  const [buddyMood, setBuddyMood] = useState('idle');
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [idleTimeout, setIdleTimeout] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);

  // Study tips collection
  const studyTips = [
    {
      icon: "🧠",
      title: "Brain Break",
      tip: "Take a 5-minute walk between study sessions to boost memory retention and creativity!"
    },
    {
      icon: "💧",
      title: "Stay Hydrated",
      tip: "Drink water regularly! Dehydration can reduce concentration by up to 12%."
    },
    {
      icon: "🌱",
      title: "The 2-Minute Rule",
      tip: "If a task takes less than 2 minutes, do it immediately instead of adding it to your todo list."
    },
    {
      icon: "🎯",
      title: "Active Recall",
      tip: "Test yourself without looking at notes. It's more effective than re-reading material!"
    },
    {
      icon: "🌙",
      title: "Sleep Smart",
      tip: "Get 7-9 hours of sleep. Your brain consolidates memories while you rest!"
    },
    {
      icon: "🍃",
      title: "Fresh Air",
      tip: "Study near a window or in a well-ventilated room. Fresh air improves focus and alertness."
    },
    {
      icon: "📱",
      title: "Phone Freedom",
      tip: "Put your phone in another room while studying. Even its presence can be distracting!"
    },
    {
      icon: "🎵",
      title: "Music Magic",
      tip: "Try instrumental music or nature sounds. Lyrics can interfere with reading comprehension."
    },
    {
      icon: "⏰",
      title: "Time Blocking",
      tip: "Schedule specific time slots for different subjects. Your brain loves routine!"
    },
    {
      icon: "🏃",
      title: "Exercise Boost",
      tip: "20 minutes of exercise before studying can improve focus for up to 2 hours!"
    },
    {
      icon: "🍎",
      title: "Brain Food",
      tip: "Eat blueberries, nuts, or dark chocolate for a natural cognitive boost!"
    },
    {
      icon: "📝",
      title: "Write by Hand",
      tip: "Taking notes by hand improves learning and memory better than typing."
    },
    {
      icon: "🌅",
      title: "Morning Power",
      tip: "Your brain is sharpest 2-4 hours after waking up. Schedule tough subjects then!"
    },
    {
      icon: "🔄",
      title: "Spaced Repetition",
      tip: "Review material after 1 day, 3 days, 1 week, and 1 month for long-term retention."
    },
    {
      icon: "🎨",
      title: "Visual Learning",
      tip: "Create mind maps or diagrams. Visual representations help remember complex information."
    },
    {
      icon: "🤝",
      title: "Study Buddy",
      tip: "Explain concepts to someone else. Teaching others is one of the best ways to learn!"
    },
    {
      icon: "🎪",
      title: "Change Scenery",
      tip: "Study in different locations. Your brain creates stronger memories with varied environments."
    },
    {
      icon: "🍋",
      title: "Scent Power",
      tip: "Try peppermint or lemon scents while studying. They can improve alertness and memory!"
    }
  ];

  // Get random tip on component mount and when needed
  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * studyTips.length);
    return studyTips[randomIndex];
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
    // Set a random tip on component mount
    setCurrentTip(getRandomTip());
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
    <div className={`min-h-screen transition-all duration-500 ${focusMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'p-4 md:p-8 pt-8'}`}>
      <div className={`max-w-7xl mx-auto ${focusMode ? 'h-screen flex items-center justify-center' : 'grid grid-cols-1 xl:grid-cols-4 gap-8'}`}>
        {/* Left Sidebar - Stats Only */}
        {!focusMode && (
          <div className="xl:col-span-1 space-y-6">
            {/* User Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
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
          </div>
        )}

        {/* Main Content */}
        <div className={focusMode ? 'w-full max-w-4xl' : 'xl:col-span-2 space-y-8'}>
          {/* Virtual Buddy Card - Hidden in focus mode */}
          {!focusMode && (
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
          )}

          {/* Timer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: focusMode ? 0 : 0.1 }}
            className={focusMode ? 'w-full h-full' : 'bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8'}
          >
            <PomodoroTimer 
              onSessionComplete={handleSessionComplete}
              onMoodChange={setBuddyMood}
            />
          </motion.div>
        </div>

        {/* Right Sidebar - Badges and Tips */}
        {!focusMode && (
          <div className="xl:col-span-1 space-y-6">
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  {currentTip?.icon} {currentTip?.title || "Study Tip"}
                </h3>
                <button 
                  onClick={() => setCurrentTip(getRandomTip())}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-300 text-sm hover:scale-110 transform"
                  title="Get new tip"
                >
                  🔄
                </button>
              </div>
              <p className="text-sm text-gray-700">
                {currentTip?.tip || "Loading tip..."}
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;