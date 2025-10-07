import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, Star } from 'lucide-react';

const MascotEncouragement = ({ isVisible, onClose, sessionType = 'focus' }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const encouragementMessages = {
    focus: [
      "🐻 You're doing amazing! Keep that focus flowing! ✨",
      "🌸 Great job staying on track! Your dedication is inspiring! 💪",
      "🎯 Wow! Look at you crushing those goals! Keep it up! 🚀",
      "💖 Your focus is incredible! The bear is so proud of you! 🐻",
      "🌟 You're in the zone! Nothing can stop you now! ⚡",
      "🎀 Such determination! You're making excellent progress! 📈",
      "✨ Keep shining! Your hard work is paying off beautifully! 🌺",
      "🦋 Breathe, focus, achieve! You've got this completely! 🧘‍♀️",
      "🌈 Your concentration is superpower level! Amazing work! 🎪",
      "🍃 Stay strong! Every minute of focus brings you closer! 🎊"
    ],
    break: [
      "🐻 Time for a well-deserved break! You've earned it! 🎉",
      "🌸 Rest those brain muscles! You've been working so hard! 😴",
      "💖 Take a moment to appreciate how awesome you are! ⭐",
      "🎀 Stretch, breathe, relax! Your break time is precious! 🧘‍♀️",
      "✨ Even bears need honey breaks! Enjoy yours! 🍯",
      "🌺 You're doing fantastic! A little rest makes you stronger! 💪",
      "🦋 Flutter around, get some fresh air! Break time magic! 🌟",
      "🌈 Your dedication deserves this peaceful moment! 🕊️",
      "🎪 Recharge those creative batteries! Almost ready for more! 🔋",
      "🍃 Gentle break vibes coming your way! You're incredible! 💫"
    ]
  };

  const messages = encouragementMessages[sessionType] || encouragementMessages.focus;

  // Pick a random message when component appears, don't cycle through them
  const [selectedMessage] = useState(() => 
    messages[Math.floor(Math.random() * messages.length)]
  );

  // Auto-close after 10 seconds - force close
  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      console.log('Auto-closing mascot encouragement'); // Debug log
      onClose();
    }, 10000); // 10 seconds

    return () => {
      clearTimeout(timeout);
    };
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 300, opacity: 0, scale: 0.8 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <motion.div
            className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl shadow-2xl p-6 border-3 border-pink-300 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            initial={{ rotate: -2 }}
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute top-2 left-2 text-pink-300"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles size={16} />
              </motion.div>
              <motion.div
                className="absolute top-4 right-4 text-purple-300"
                animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              >
                <Star size={14} />
              </motion.div>
              <motion.div
                className="absolute bottom-3 left-4 text-pink-400"
                animate={{ scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                <Heart size={12} />
              </motion.div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white/50 transition-all"
            >
              <X size={16} />
            </button>

            {/* Mascot bear */}
            <div className="flex items-start gap-3 mb-4">
              <motion.div
                className="text-4xl"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                🐻
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-purple-800 text-sm mb-1 font-kawaii">
                  Kuma says:
                </h3>
                <p className="text-sm text-purple-700 font-medium leading-relaxed">
                  {selectedMessage}
                </p>
              </div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-pink-400 rounded-full"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${30 + i * 20}%`
                  }}
                  animate={{
                    y: [-10, -30, -10],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MascotEncouragement;