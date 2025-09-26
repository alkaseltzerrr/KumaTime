import React from 'react';
import { motion } from 'framer-motion';

const VirtualBuddy = ({ mood = 'idle', level = 1, happiness = 50 }) => {
  const getBearExpression = () => {
    if (happiness >= 80) return '🐻'; // Very happy
    if (happiness >= 60) return '🐻'; // Happy
    if (happiness >= 40) return '🐻'; // Normal
    if (happiness >= 20) return '🐻'; // Sad
    return '🐻'; // Very sad
  };

  const getBearSize = () => {
    const baseSize = 100;
    const growth = level * 10;
    return Math.min(baseSize + growth, 200);
  };

  const animations = {
    idle: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    happy: {
      rotate: [-5, 5, -5],
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: 3
      }
    },
    sleepy: {
      y: [0, 5, 0],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    celebrating: {
      y: [-20, -40, -20],
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        repeat: 2
      }
    },
    working: {
      x: [-2, 2, -2],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const getMoodAnimation = () => {
    return animations[mood] || animations.idle;
  };

  const size = getBearSize();

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="relative pt-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Bear shadow */}
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-black/10 rounded-full blur-md"
          style={{ width: `${size * 0.75}px` }}
        />
        
        {/* Bear body */}
        <motion.div
          className="text-center select-none pb-2"
          style={{ fontSize: `${size}px` }}
          animate={getMoodAnimation()}
        >
          <span role="img" aria-label="Bear buddy">{getBearExpression()}</span>
        </motion.div>

        {/* Happiness indicator */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            {happiness >= 80 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-xl"
              >
                ❤️
              </motion.span>
            )}
            {mood === 'celebrating' && (
              <>
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 45 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg"
                >
                  🎉
                </motion.span>
                <motion.span
                  initial={{ scale: 0, rotate: 45 }}
                  animate={{ scale: 1, rotate: -45 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg"
                >
                  ✨
                </motion.span>
              </>
            )}
            {mood === 'sleepy' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg"
              >
                💤
              </motion.span>
            )}
          </div>
        </div>

        {/* Level badge */}
  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <motion.div
            className="bg-pastel-peach px-3 py-1 rounded-full shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-sm font-bold text-gray-700">Lv.{level}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Speech bubble for special moods */}
      {(mood === 'happy' || mood === 'celebrating') && (
        <motion.div
          className="mt-12 bg-white p-3 rounded-lg shadow-lg relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
          <p className="text-sm font-medium text-gray-700">
            {mood === 'celebrating' ? "Great job! 🎉" : "Let's focus! 💪"}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VirtualBuddy;