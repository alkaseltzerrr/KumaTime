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
  BarChart3,
  Focus,
  Play,
  Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { focusMode, enterFocusMode } = useFocusMode();
  const { permission, requestPermission, showNotification, isSupported } = useNotification();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showFocusPopup, setShowFocusPopup] = useState(false);
  const [focusSettings, setFocusSettings] = useState({
    duration: 25,
    breakDuration: 5,
    sessionType: 'Pomodoro',
    autoStartBreaks: true,
    soundEnabled: true
  });
  const notificationPanelRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const focusPopupRef = useRef(null);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setShowNotificationPanel(false);
      }
      if (focusPopupRef.current && !focusPopupRef.current.contains(event.target)) {
        setShowFocusPopup(false);
      }
    };

    if (showNotificationPanel || showFocusPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotificationPanel, showFocusPopup]);

  const handleQuickFocus = () => {
    // Show customization popup first
    setShowFocusPopup(true);
    // Don't start focus mode yet - wait for user to configure and click "Start Focus"
  };

  const applyFocusSettings = () => {
    setShowFocusPopup(false);
    // NOW start focus mode after settings are applied
    enterFocusMode();
    // Send notification if enabled
    if (focusSettings.soundEnabled) {
      showNotification('🎯 Focus Mode Started!', {
        body: `${focusSettings.sessionType} session for ${focusSettings.duration} minutes`
      });
    }
  };

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
            
            {/* Quick Focus Mode Button */}
            <motion.button
              onClick={handleQuickFocus}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Focus size={18} />
              <span className="text-sm font-medium">Quick Focus</span>
            </motion.button>
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
              } ${showNotificationPanel ? 'bg-gray-100' : ''}`}
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
              
              {/* Mobile Quick Focus Button */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleQuickFocus}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 text-white font-medium shadow-md"
              >
                <Focus size={20} />
                <span className="font-medium">Quick Focus</span>
              </motion.button>
              
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

    {/* Focus Mode Customization Popup */}
    <AnimatePresence>
      {showFocusPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFocusPopup(false)}
        >
          <motion.div
            ref={focusPopupRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Focus className="text-orange-500" size={24} />
                Focus Mode Settings
              </h3>
              <button
                onClick={() => setShowFocusPopup(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pomodoro', 'Custom'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFocusSettings(prev => ({ ...prev, sessionType: type }))}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        focusSettings.sessionType === type
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Duration: {focusSettings.duration} minutes
                </label>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={focusSettings.duration}
                  onChange={(e) => setFocusSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 min</span>
                  <span>90 min</span>
                </div>
              </div>

              {/* Break Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Duration: {focusSettings.breakDuration} minutes
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={focusSettings.breakDuration}
                  onChange={(e) => setFocusSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Auto-start breaks</span>
                  <button
                    onClick={() => setFocusSettings(prev => ({ ...prev, autoStartBreaks: !prev.autoStartBreaks }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      focusSettings.autoStartBreaks ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        focusSettings.autoStartBreaks ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sound notifications</span>
                  <button
                    onClick={() => setFocusSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      focusSettings.soundEnabled ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        focusSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowFocusPopup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFocusSettings}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Start Focus
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
};

export default MenuBar;