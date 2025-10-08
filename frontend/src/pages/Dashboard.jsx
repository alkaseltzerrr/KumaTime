import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFocusMode } from '../contexts/FocusModeContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import VirtualBuddy from '../components/VirtualBuddy';
import PomodoroTimer from '../components/PomodoroTimer';
import { Trophy, Flame, Clock, User, Target } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout, isAuthenticated, fetchProfile } = useAuth();
  const { focusMode } = useFocusMode();
  const { isDarkMode } = useDarkMode();
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
    },
    {
      icon: "🌸",
      title: "Cherry Blossom Method",
      tip: "Study for 25 minutes, then take a 5-minute nature break. Fresh perspectives bloom with rest!"
    },
    {
      icon: "🎭",
      title: "Feynman Technique",
      tip: "Explain concepts in simple terms as if teaching a child. If you can't, you don't truly understand it yet."
    },
    {
      icon: "🌈",
      title: "Color Coding",
      tip: "Use different colors for different topics. Your brain processes colors faster than text!"
    },
    {
      icon: "🧘",
      title: "Mindful Moments",
      tip: "Take 3 deep breaths before starting each study session. It primes your brain for focus."
    },
    {
      icon: "🔥",
      title: "Energy Management",
      tip: "Study your hardest subjects when you have the most energy, not necessarily in the morning."
    },
    {
      icon: "🎲",
      title: "Random Review",
      tip: "Shuffle your flashcards or topics randomly. Your brain learns better with unpredictable patterns!"
    },
    {
      icon: "🌊",
      title: "Wave Learning",
      tip: "Alternate between focused learning and relaxed review. Like waves, learning comes in cycles."
    },
    {
      icon: "🎪",
      title: "The 50/10 Rule",
      tip: "For every 50 minutes of study, take a 10-minute break. Your focus will thank you!"
    },
    {
      icon: "🌟",
      title: "Reward System",
      tip: "Give yourself small rewards after completing study goals. Positive reinforcement works!"
    },
    {
      icon: "🦋",
      title: "Butterfly Effect",
      tip: "Small, consistent daily study habits create massive long-term learning results."
    },
    {
      icon: "🎯",
      title: "Target Practice",
      tip: "Set specific, measurable study goals. 'Read Chapter 5' is better than 'study biology'."
    },
    {
      icon: "🌱",
      title: "Growth Mindset",
      tip: "Replace 'I can't do this' with 'I can't do this YET'. Your brain is always growing!"
    },
    {
      icon: "🎪",
      title: "Circus Method",
      tip: "Juggle 3 different subjects in one session. Variety keeps your brain engaged and alert."
    },
    {
      icon: "🌙",
      title: "Sleep Learning",
      tip: "Review material right before bed. Your brain processes information while you sleep!"
    },
    {
      icon: "🎨",
      title: "Doodle Power",
      tip: "Doodling while listening can actually improve focus and information retention by 29%!"
    },
    {
      icon: "🎵",
      title: "Rhythm Study",
      tip: "Try studying to a metronome or rhythmic background. Rhythm can enhance memory formation."
    },
    {
      icon: "🌈",
      title: "Rainbow Notes",
      tip: "Use highlighters strategically: Yellow for key concepts, Pink for definitions, Blue for examples."
    },
    {
      icon: "🎪",
      title: "Teaching Theater",
      tip: "Act out historical events or scientific processes. Physical movement enhances memory!"
    },
    {
      icon: "🌸",
      title: "Blossom Breaks",
      tip: "During breaks, do something completely different from studying. Let your mind wander and reset."
    },
    {
      icon: "🎯",
      title: "Laser Focus",
      tip: "Use the 'One Tab Rule' - close all browser tabs except what you're studying. Digital clutter hurts focus."
    },
    {
      icon: "🌊",
      title: "Flow State",
      tip: "Find your optimal challenge level - not too easy (boring) or too hard (overwhelming)."
    },
    {
      icon: "🎭",
      title: "Multiple Perspectives",
      tip: "Study the same topic from different angles or sources. Multiple viewpoints strengthen understanding."
    },
    {
      icon: "🌟",
      title: "Star Student",
      tip: "Create a 'learning journal' - write down what you learned each day. Reflection deepens knowledge."
    },
    {
      icon: "🎪",
      title: "Memory Palace",
      tip: "Link information to familiar places in your mind. Your spatial memory is incredibly powerful!"
    },
    {
      icon: "🌸",
      title: "Soft Focus",
      tip: "Sometimes let your mind wander. Diffuse thinking helps connect ideas in creative ways."
    },
    {
      icon: "🎵",
      title: "Study Symphony",
      tip: "Create different playlists for different subjects. Music can trigger subject-specific memory recall."
    },
    {
      icon: "🌱",
      title: "Seed Questions",
      tip: "Start each study session by writing down questions you want answered. Curiosity drives learning!"
    }
  ];

  // Enhanced random tip selection with shuffling
  const [usedTipIndices, setUsedTipIndices] = useState(new Set());
  
  const getRandomTip = () => {
    // If we've used all tips, reset the used indices
    if (usedTipIndices.size >= studyTips.length) {
      setUsedTipIndices(new Set());
    }
    
    // Get available tip indices
    const availableIndices = studyTips
      .map((_, index) => index)
      .filter(index => !usedTipIndices.has(index));
    
    // Select random index from available ones
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    
    // Mark this tip as used
    setUsedTipIndices(prev => new Set([...prev, randomIndex]));
    
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
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 transition-colors duration-300"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200 transition-colors duration-300">
                <Trophy className="text-yellow-500" size={24} />
                Your Progress
              </h2>
              
              <div className="space-y-4">
                {/* Today's Stats */}
                <div className="p-4 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-xl transition-colors duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Today</span>
                    <Target size={16} className="text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                    {stats?.today?.sessions || 0} sessions
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {Math.round((stats?.today?.duration || 0) / 60)} minutes focused
                  </p>
                </div>

                {/* Streak */}
                <div className="p-4 bg-orange-100/50 dark:bg-orange-900/30 rounded-xl transition-colors duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Current Streak</span>
                    <Flame size={16} className="text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                    {stats?.overall?.current_streak || 0} days
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Best: {stats?.overall?.longest_streak || 0} days
                  </p>
                </div>

                {/* Total Time */}
                <div className="p-4 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl transition-colors duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Focus Time</span>
                    <Clock size={16} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                    {Math.round((stats?.overall?.total_focus_time || 0) / 60)}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
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
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 transition-colors duration-300"
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
            className={focusMode ? 'w-full h-full' : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 transition-colors duration-300'}
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
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 transition-colors duration-300"
              >
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 transition-colors duration-300">🏆 Achievements</h2>
                <div className="grid grid-cols-3 gap-3">
                  {user.badges.slice(0, 6).map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex flex-col items-center p-2 bg-gradient-to-br from-purple-100/50 to-pink-100/50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg transition-colors duration-300"
                      title={badge.description}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-xs text-center mt-1 text-gray-700 dark:text-gray-300 transition-colors duration-300">{badge.name}</span>
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
              className="bg-gradient-to-br from-green-100/50 to-blue-100/50 dark:from-green-900/30 dark:to-blue-900/30 rounded-3xl shadow-xl p-6 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200 transition-colors duration-300">
                  {currentTip?.icon} {currentTip?.title || "Study Tip"}
                </h3>
                <button 
                  onClick={() => setCurrentTip(getRandomTip())}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 text-sm hover:scale-[1.05] transform"
                  title="Get new tip"
                >
                  🔄
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
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