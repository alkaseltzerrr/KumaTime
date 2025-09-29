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
  const notificationButtonRef = useRef(null);

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
            whileHover={{ scale: 1.05, rotate: 2 }}
            onClick={() => handleNavigation('/')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg relative">
              <span className="text-2xl">🐻</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">✨</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                🌸 KumaTime 🌸
              </h1>
              <p className="text-sm text-pink-400 -mt-1">
                ♡ Focus & Cuteness ♡
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
              ref={notificationButtonRef}
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
      {showNotificationPanel && notificationButtonRef.current && (
        <motion.div
          ref={notificationPanelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed w-80 bg-white rounded-lg border border-gray-200 shadow-xl p-4 z-40"
          style={{
            top: notificationButtonRef.current ? 
              notificationButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 8 : 
              '80px',
            left: notificationButtonRef.current ? 
              notificationButtonRef.current.getBoundingClientRect().right - 320 + window.scrollX : 
              'calc(100vw - 336px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button 
                onClick={() => setShowNotificationPanel(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {!isSupported ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  Notifications are not supported in your browser
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Permission Status Card */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        permission === 'granted' ? 'bg-green-100' : 
                        permission === 'denied' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {permission === 'granted' ? (
                          <Bell size={20} className="text-green-600" />
                        ) : permission === 'denied' ? (
                          <BellOff size={20} className="text-red-600" />
                        ) : (
                          <Bell size={20} className="text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {permission === 'granted' ? 'Notifications Enabled' : 
                           permission === 'denied' ? 'Notifications Blocked' : 'Enable Notifications'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {permission === 'granted' ? 'You\'ll receive focus session alerts' : 
                           permission === 'denied' ? 'Please enable in browser settings' : 'Get notified when sessions complete'}
                        </p>
                      </div>
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
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </div>

                {/* Test Notification Card */}
                {permission === 'granted' && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">🧪</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Test Notification</p>
                          <p className="text-xs text-gray-500">Send a test notification to verify it's working</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showNotification('🧪 Test Notification', {
                          body: 'Notifications are working perfectly! 🎉'
                        })}
                        className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                )}

                {/* System Info */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Browser Support: {'Notification' in window ? '✅ Supported' : '❌ Not Supported'}</span>
                    <span>HTTPS: {window.isSecureContext ? '✅ Secure' : '❌ Required'}</span>
                  </div>
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