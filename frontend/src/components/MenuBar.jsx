import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFocusMode } from '../contexts/FocusModeContext';
import { 
  Home, 
  User, 
  Settings, 
  Trophy, 
  Clock, 
  LogOut, 
  Menu, 
  X,
  Moon,
  Sun,
  Bell,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { focusMode } = useFocusMode();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Hide menu bar in focus mode
  if (focusMode) return null;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', color: 'text-blue-500' },
    { icon: BarChart3, label: 'Statistics', path: '/stats', color: 'text-green-500' },
    { icon: Trophy, label: 'Achievements', path: '/achievements', color: 'text-yellow-500' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-gray-500' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement actual dark mode logic
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigation('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🐻</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                KumaTime
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Focus & Flow</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-white/60 group ${
                  window.location.pathname === item.path ? 'bg-white/60 shadow-sm' : ''
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={18} className={`${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-white/60 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button
              className="p-2 rounded-xl hover:bg-white/60 transition-all duration-300 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} className="text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </motion.button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/40 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-500">Level {user?.buddy_level || 1}</p>
                  </div>
                </div>
                <motion.button
                  onClick={logout}
                  className="p-2 rounded-xl hover:bg-red-100 text-red-500 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut size={20} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => handleNavigation('/login')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/60 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/90 backdrop-blur-md border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/60 ${
                    window.location.pathname === item.path ? 'bg-white/60' : ''
                  }`}
                >
                  <item.icon size={20} className={item.color} />
                  <span className="font-medium text-gray-700">{item.label}</span>
                </motion.button>
              ))}
              
              {/* Mobile User Section */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 border-t border-white/20"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user?.username || 'User'}</p>
                        <p className="text-sm text-gray-500">Level {user?.buddy_level || 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 rounded-xl hover:bg-red-100 text-red-500 transition-all duration-300"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MenuBar;