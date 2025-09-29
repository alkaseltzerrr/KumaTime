import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFocusMode } from '../contexts/FocusModeContext';
import { useNotification } from '../contexts/NotificationContext';
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
  BellOff,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { focusMode } = useFocusMode();
  const { permission, requestPermission, showNotification, isSupported } = useNotification();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const notificationPanelRef = useRef(null);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setShowNotificationPanel(false);
      }
    };

    if (showNotificationPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotificationPanel]);

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
      className="sticky top-0 z-50 kawaii-border bg-gradient-to-r from-pink-50/90 via-purple-50/90 to-blue-50/90 backdrop-blur-md border-b-4 border-dashed border-pink-300 shadow-lg sketch-shadow"
      style={{ 
        fontFamily: 'Kalam, cursive'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer animate-wiggle kawaii-heart"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigation('/')}
          >
            <div className="w-12 h-12 sketch-button flex items-center justify-center animate-float">
              <span className="text-2xl">🐻</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold sketch-text" style={{ fontFamily: 'Caveat, cursive' }}>
                ✨ KumaTime ✨
              </h1>
              <p className="text-sm text-purple-400 -mt-1" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                🌸 Focus & Flow 🌸
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`sketch-button flex items-center gap-2 px-4 py-2 kawaii-star animate-kawaii-shake transition-all duration-300 group ${
                  window.location.pathname === item.path ? 'kawaii-gradient shadow-lg scale-105' : ''
                }`}
                whileHover={{ scale: 1.1, rotate: index % 2 ? 2 : -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontFamily: 'Kalam, cursive',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <item.icon size={20} className={`${item.color} group-hover:scale-125 animate-wiggle transition-transform`} />
                <span className="text-sm font-bold text-purple-600 group-hover:text-pink-500">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="sketch-button p-3 animate-wiggle"
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDarkMode ? (
                <Sun size={22} className="text-yellow-400 animate-sparkle" />
              ) : (
                <Moon size={22} className="text-purple-500 animate-float" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative kawaii-heart">
              <motion.button
                className={`sketch-button p-3 relative animate-kawaii-shake ${
                  permission === 'granted' ? 'text-green-500' : 
                  permission === 'denied' ? 'text-red-400' : 'text-purple-500'
                }`}
                whileHover={{ scale: 1.15, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              >
                {permission === 'granted' ? (
                  <Bell size={22} className="animate-wiggle" />
                ) : permission === 'denied' ? (
                  <BellOff size={22} className="animate-kawaii-shake" />
                ) : (
                  <Bell size={22} className="animate-float" />
                )}
                {permission !== 'granted' && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-pulse shadow-lg">
                    <span className="text-xs">!</span>
                  </div>
                )}
              </motion.button>

              {/* Notification Panel */}
              <AnimatePresence>
                {showNotificationPanel && (
                  <motion.div
                    ref={notificationPanelRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0.5 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95, rotate: 2 }}
                    className="absolute right-0 top-14 w-80 kawaii-border kawaii-gradient backdrop-blur-sm sketch-shadow p-6 z-50"
                    style={{ fontFamily: 'Kalam, cursive' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">🔔 Notifications</h3>
                        <button 
                          onClick={() => setShowNotificationPanel(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {!isSupported ? (
                        <p className="text-sm text-gray-600">
                          Notifications are not supported in your browser
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white/40 rounded-lg">
                            <div className="flex items-center gap-2">
                              {permission === 'granted' ? (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              ) : permission === 'denied' ? (
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              ) : (
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                              )}
                              <span className="text-sm text-gray-700">
                                {permission === 'granted' ? 'Enabled' : 
                                 permission === 'denied' ? 'Blocked' : 'Disabled'}
                              </span>
                            </div>
                            {permission !== 'granted' && (
                              <button
                                onClick={async () => {
                                  const result = await requestPermission()
                                  if (result === 'granted') {
                                    showNotification('🎉 Notifications Enabled!', {
                                      body: 'You\'ll now receive notifications when your focus sessions complete!'
                                    })
                                  }
                                }}
                                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300"
                              >
                                Enable
                              </button>
                            )}
                          </div>

                          {permission === 'granted' && (
                            <div className="space-y-2">
                              <button
                                onClick={() => showNotification('🧪 Test Notification', {
                                  body: 'Notifications are working perfectly! 🎉'
                                })}
                                className="w-full px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300"
                              >
                                Test Notification
                              </button>
                              <p className="text-xs text-gray-600 text-center">
                                You'll receive notifications when your focus sessions complete
                              </p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 border-t pt-2">
                            Browser: {'Notification' in window ? '✅' : '❌'} | 
                            HTTPS: {window.isSecureContext ? '✅' : '❌'}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                className="sketch-button px-6 py-3 kawaii-star animate-kawaii-shake font-bold"
                whileHover={{ scale: 1.1, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                🌟 Login 🌟
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