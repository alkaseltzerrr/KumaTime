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
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => handleNavigation('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🐻</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-800">
                KumaTime
              </h1>
              <p className="text-sm text-gray-500 -mt-1">
                Focus & Flow
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 ${
                  window.location.pathname === item.path ? 'bg-gray-100 text-purple-600' : 'text-gray-600 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon size={18} className={window.location.pathname === item.path ? 'text-purple-600' : 'text-gray-500'} />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-500" />
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors relative ${
                permission === 'granted' ? 'text-green-500' : 
                permission === 'denied' ? 'text-red-400' : 'text-gray-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowNotificationPanel(!showNotificationPanel);
              }}
            >
              {permission === 'granted' ? (
                <Bell size={20} />
              ) : permission === 'denied' ? (
                <BellOff size={20} />
              ) : (
                <Bell size={20} />
              )}
              {permission !== 'granted' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full">
                  <span className="sr-only">Notification permission needed</span>
                </div>
              )}
            </motion.button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
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
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => handleNavigation('/login')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-md transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X size={24} className="text-gray-600" /> : <Menu size={24} className="text-gray-600" />}
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
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                    window.location.pathname === item.path ? 'bg-gray-100 text-purple-600' : 'text-gray-600'
                  }`}
                >
                  <item.icon size={20} className={window.location.pathname === item.path ? 'text-purple-600' : 'text-gray-500'} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
              
              {/* Mobile User Section */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 border-t border-gray-200"
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
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all duration-200"
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

    {/* Notification Panel - Outside Header */}
    <AnimatePresence>
      {showNotificationPanel && (
        <motion.div
          ref={notificationPanelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed top-20 right-4 w-80 bg-white rounded-lg border border-gray-200 shadow-xl p-4 z-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">🔔 Notifications</h3>
              <button 
                onClick={() => setShowNotificationPanel(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
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
                      className="w-full px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200"
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
  </>
  );
};

export default MenuBar;