import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WelcomePopup = () => {
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if welcome popup has been shown before
    const welcomeShown = localStorage.getItem('kumatime-welcome-shown');
    
    if (!welcomeShown && !hasShown) {
      let showTimer, hideTimer;
      
      // Show popup after a brief delay for a nice entrance
      showTimer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
        
        // Set auto-hide timer after popup becomes visible
        hideTimer = setTimeout(() => {
          setIsVisible(false);
          localStorage.setItem('kumatime-welcome-shown', 'true');
        }, 7000); // 7 seconds visible after it shows
        
      }, 1000); // 1 second initial delay

      return () => {
        if (showTimer) clearTimeout(showTimer);
        if (hideTimer) clearTimeout(hideTimer);
      };
    }
  }, []); // Remove hasShown dependency to prevent re-runs

  const handleClose = () => {
    setIsVisible(false);
    // Mark as shown so it won't appear again this session
    localStorage.setItem('kumatime-welcome-shown', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Popup */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.5 
              }}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-60 animate-float"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-200 to-green-200 rounded-full opacity-40 animate-pulse-slow"></div>
              
              {/* Close Button */}
              <motion.button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200/60 transition-all duration-300 z-10"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-gray-600" />
              </motion.button>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Bear and Sparkles */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-6 relative inline-block"
                >
                  <div className="text-6xl mb-2 animate-bounce">🐻</div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles size={24} className="text-yellow-400" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -bottom-1 -left-2"
                  >
                    <Heart size={20} className="text-pink-400 fill-current" />
                  </motion.div>
                </motion.div>

                {/* Welcome Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                    Welcome to KumaTime!
                  </h1>
                  <p className="text-lg text-gray-700 mb-1">
                    {isAuthenticated 
                      ? `Hey ${user?.username}! Ready to focus?` 
                      : "Let's focus together with your study buddy!"
                    }
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Your cute companion for productive study sessions ✨
                  </p>
                </motion.div>

                {/* Features Preview */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  <div className="p-3 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl">
                    <div className="text-2xl mb-1">⏰</div>
                    <div className="text-sm font-medium text-gray-700">Pomodoro Timer</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-sm font-medium text-gray-700">Focus Mode</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-sm font-medium text-gray-700">Achievements</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                    <div className="text-2xl mb-1">🐻</div>
                    <div className="text-sm font-medium text-gray-700">Study Buddy</div>
                  </div>
                </motion.div>

                {/* Call to Action */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={handleClose}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Let's Start Focusing! 🚀
                </motion.button>

                {/* Auto-close indicator */}
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-xs text-gray-400 mt-4"
                >
                  This will close automatically in a few seconds...
                </motion.p>
              </div>

              {/* Progress bar showing auto-close timer */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 7, ease: "linear", delay: 1 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;