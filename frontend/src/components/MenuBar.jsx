import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFocusMode } from '../contexts/FocusModeContext';
import { useNotification } from '../contexts/NotificationContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { 
  Home, 
  User, 
  Settings, 
  Trophy, 
  LogOut, 
  Menu, 
  X,
  Moon,
  Sun,
  Bell,
  BellOff,
  BarChart3,
  Focus,
  Play
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const MenuBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { focusMode, enterFocusMode, focusSessionSettings, updateFocusSessionSettings } = useFocusMode();
  const { permission, requestPermission, showNotification, isSupported } = useNotification();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const idPrefix = useId();
  const notificationPanelId = `${idPrefix}-notification-panel`;
  const mobileMenuId = `${idPrefix}-mobile-menu`;
  const focusSettingsTitleId = `${idPrefix}-focus-settings-title`;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showFocusPopup, setShowFocusPopup] = useState(false);
  const [panelAnchorTick, setPanelAnchorTick] = useState(0);
  const focusSettings = focusSessionSettings;
  const notificationPanelRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const focusPopupRef = useRef(null);
  const wasNotificationPanelOpenRef = useRef(false);
  const focusPopupTriggerRef = useRef(null);
  const wasFocusPopupOpenRef = useRef(false);

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

  // Return keyboard focus to the trigger when the notification panel closes.
  useEffect(() => {
    if (!showNotificationPanel && wasNotificationPanelOpenRef.current) {
      notificationButtonRef.current?.focus();
    }

    wasNotificationPanelOpenRef.current = showNotificationPanel;
  }, [showNotificationPanel]);

  // Return keyboard focus to the trigger when the focus settings popup closes.
  useEffect(() => {
    if (!showFocusPopup && wasFocusPopupOpenRef.current && !focusMode) {
      focusPopupTriggerRef.current?.focus?.();
    }

    wasFocusPopupOpenRef.current = showFocusPopup;
  }, [showFocusPopup, focusMode]);

  // Escape key closes open overlays for keyboard accessibility
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key !== 'Escape') return;

      if (showNotificationPanel) {
        setShowNotificationPanel(false);
      }
      if (showFocusPopup) {
        setShowFocusPopup(false);
      }
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showNotificationPanel, showFocusPopup, isMenuOpen]);

  // Re-anchor the notification panel while scrolling/resizing.
  useEffect(() => {
    if (!showNotificationPanel) return undefined;

    const refreshPanelAnchor = () => setPanelAnchorTick((prev) => prev + 1);

    window.addEventListener('resize', refreshPanelAnchor);
    window.addEventListener('scroll', refreshPanelAnchor, true);

    return () => {
      window.removeEventListener('resize', refreshPanelAnchor);
      window.removeEventListener('scroll', refreshPanelAnchor, true);
    };
  }, [showNotificationPanel]);

  // Ensure transient overlays are closed after route changes.
  useEffect(() => {
    setIsMenuOpen(false);
    setShowNotificationPanel(false);
    setShowFocusPopup(false);
  }, [location.pathname]);

  // Lock page scrolling while the focus settings modal is open.
  useEffect(() => {
    if (!showFocusPopup) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showFocusPopup]);

  const handleQuickFocus = (triggerElement) => {
    setIsMenuOpen(false);
    setShowNotificationPanel(false);
    if (triggerElement instanceof HTMLElement) {
      focusPopupTriggerRef.current = triggerElement;
    }
    // Show customization popup first
    setShowFocusPopup(true);
    // Don't start focus mode yet - wait for user to configure and click "Start Focus"
  };

  const applyFocusSettings = () => {
    setShowFocusPopup(false);
    // NOW start focus mode after settings are applied
    enterFocusMode(focusSettings);
    // Send notification if enabled
    if (focusSettings.soundEnabled) {
      showNotification('🎯 Focus Mode Started!', {
        body: `${focusSettings.sessionType} session for ${focusSettings.duration} minutes`
      });
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    setShowNotificationPanel(false);
    setShowFocusPopup(false);
    logout();
  };

  // Hide menu bar in focus mode
  if (focusMode) return null;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', color: 'text-blue-500' },
    { icon: Focus, label: 'Quick Focus', action: 'focus', color: 'text-pink-500', special: true },
    { icon: BarChart3, label: 'Statistics', path: '/stats', color: 'text-green-500' },
    { icon: Trophy, label: 'Achievements', path: '/achievements', color: 'text-yellow-500' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-gray-500' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => location.pathname === path;

  const getNotificationPanelStyle = () => {
    // Access tick so style is recalculated on scroll/resize updates.
    void panelAnchorTick;

    if (!notificationButtonRef.current) {
      return {
        top: '80px',
        left: '8px',
        width: 'min(20rem, calc(100vw - 1rem))',
        maxHeight: 'calc(100vh - 1rem)'
      };
    }

    const rect = notificationButtonRef.current.getBoundingClientRect();
    const panelWidth = Math.min(320, Math.max(220, window.innerWidth - 16));
    const estimatedPanelHeight = 420;
    const minLeft = window.scrollX + 8;
    const maxLeft = window.scrollX + window.innerWidth - panelWidth - 8;
    const desiredLeft = rect.right - panelWidth + window.scrollX;
    const minTop = window.scrollY + 8;
    const maxTop = window.scrollY + window.innerHeight - estimatedPanelHeight - 8;
    const desiredTop = rect.bottom + window.scrollY + 8;
    const clampedTop = Math.min(Math.max(desiredTop, minTop), Math.max(minTop, maxTop));

    return {
      top: `${clampedTop}px`,
      left: `${Math.min(Math.max(desiredLeft, minLeft), maxLeft)}px`,
      width: `${panelWidth}px`,
      maxHeight: 'calc(100vh - 1rem)'
    };
  };

  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300"
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
              <p className="text-sm text-pink-400 dark:text-pink-300 -mt-1 transition-colors duration-300">
                ♡ Focus & Cuteness ♡
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path || item.action}
                onClick={(e) => item.action === 'focus' ? handleQuickFocus(e.currentTarget) : handleNavigation(item.path)}
                aria-current={item.path && isActivePath(item.path) ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  item.special 
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md hover:shadow-lg hover:from-pink-500 hover:to-purple-500' 
                    : `hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      isActivePath(item.path) 
                          ? 'bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                      }`
                }`}
                whileHover={{ scale: item.special ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon size={18} className={
                  item.special 
                    ? 'text-white' 
                    : isActivePath(item.path) 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-500 dark:text-gray-400'
                } />
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
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-500 dark:text-gray-400" />
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button
              ref={notificationButtonRef}
              aria-label={showNotificationPanel ? 'Close notifications panel' : 'Open notifications panel'}
              aria-expanded={showNotificationPanel}
              aria-controls={notificationPanelId}
              aria-haspopup="dialog"
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 relative ${
                permission === 'granted' ? 'text-green-500' : 
                permission === 'denied' || permission === 'unsupported' ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'
              } ${showNotificationPanel ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(false);
                setShowFocusPopup(false);
                setShowNotificationPanel((prev) => !prev);
              }}
            >
              {permission === 'granted' ? (
                <Bell size={20} />
              ) : permission === 'denied' || permission === 'unsupported' ? (
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
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Level {user?.buddy_level || 1}</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-all duration-200"
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
              onClick={() => {
                setShowNotificationPanel(false);
                setShowFocusPopup(false);
                setIsMenuOpen((prev) => !prev);
              }}
              aria-label={isMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMenuOpen}
              aria-controls={mobileMenuId}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? (
                <X size={24} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu size={24} className="text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id={mobileMenuId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300"
          >
            <div className="px-4 py-4 space-y-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.path || item.action}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={(e) => item.action === 'focus' ? handleQuickFocus(e.currentTarget) : handleNavigation(item.path)}
                  aria-current={item.path && isActivePath(item.path) ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    item.special 
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md hover:from-pink-500 hover:to-purple-500' 
                      : `hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          isActivePath(item.path) 
                            ? 'bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`
                  }`}
                >
                  <item.icon size={20} className={
                    item.special 
                      ? 'text-white' 
                      : isActivePath(item.path) 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-gray-500 dark:text-gray-400'
                  } />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
              
              {/* Mobile User Section */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">{user?.username || 'User'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Level {user?.buddy_level || 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      aria-label="Log out"
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-all duration-200"
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
          id={notificationPanelId}
          role="dialog"
          aria-modal="false"
          aria-label="Notifications"
          ref={notificationPanelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed overflow-y-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl p-4 z-40 transition-colors duration-300"
          style={getNotificationPanelStyle()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">Notifications</h3>
              <button 
                onClick={() => setShowNotificationPanel(false)}
                aria-label="Close notifications panel"
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              >
                <X size={18} />
              </button>
            </div>

            {!isSupported ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Notifications are not supported in your browser
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Permission Status Card */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        permission === 'granted' ? 'bg-green-100' : 
                        permission === 'denied' || permission === 'unsupported' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {permission === 'granted' ? (
                          <Bell size={20} className="text-green-600" />
                        ) : permission === 'denied' || permission === 'unsupported' ? (
                          <BellOff size={20} className="text-red-600" />
                        ) : (
                          <Bell size={20} className="text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                          {permission === 'granted' ? 'Notifications Enabled' : 
                           permission === 'denied' ? 'Notifications Blocked' :
                           permission === 'unsupported' ? 'Notifications Unsupported' : 'Enable Notifications'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          {permission === 'granted' ? 'You\'ll receive focus session alerts' : 
                           permission === 'denied' ? 'Please enable in browser settings' :
                           permission === 'unsupported' ? 'Your browser does not support notifications' : 'Get notified when sessions complete'}
                        </p>
                      </div>
                    </div>
                    {permission !== 'granted' && permission !== 'unsupported' && (
                      <button
                        onClick={async () => {
                          const result = await requestPermission()
                          if (result === 'granted') {
                            showNotification('🎉 Notifications Enabled!', {
                              body: 'You\'ll now receive notifications when your focus sessions complete!'
                            })
                          }
                        }}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </div>

                {/* Test Notification Card */}
                {permission === 'granted' && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center transition-colors duration-300">
                          <span className="text-lg">🧪</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">Test Notification</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Send a test notification to verify it's working</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showNotification('🧪 Test Notification', {
                          body: 'Notifications are working perfectly! 🎉'
                        })}
                        className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                )}

                {/* System Info */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
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
          role="dialog"
          aria-modal="true"
          aria-labelledby={focusSettingsTitleId}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFocusPopup(false)}
        >
          <motion.div
            ref={focusPopupRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 id={focusSettingsTitleId} className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-colors duration-300">
                <Focus className="text-orange-500" size={24} />
                Focus Mode Settings
              </h3>
              <button
                onClick={() => setShowFocusPopup(false)}
                aria-label="Close focus settings"
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Session Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pomodoro', 'Custom'].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateFocusSessionSettings({ sessionType: type })}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        focusSettings.sessionType === type
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Focus Duration: {focusSettings.duration} minutes
                </label>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={focusSettings.duration}
                  onChange={(e) => updateFocusSessionSettings({ duration: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-colors duration-300"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  <span>5 min</span>
                  <span>90 min</span>
                </div>
              </div>

              {/* Break Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Break Duration: {focusSettings.breakDuration} minutes
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={focusSettings.breakDuration}
                  onChange={(e) => updateFocusSessionSettings({ breakDuration: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-colors duration-300"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Auto-start breaks</span>
                  <button
                    onClick={() => updateFocusSessionSettings({ autoStartBreaks: !focusSettings.autoStartBreaks })}
                    role="switch"
                    aria-checked={focusSettings.autoStartBreaks}
                    aria-label="Toggle auto-start breaks"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      focusSettings.autoStartBreaks ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Sound notifications</span>
                  <button
                    onClick={() => updateFocusSessionSettings({ soundEnabled: !focusSettings.soundEnabled })}
                    role="switch"
                    aria-checked={focusSettings.soundEnabled}
                    aria-label="Toggle sound notifications"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      focusSettings.soundEnabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors duration-300"
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