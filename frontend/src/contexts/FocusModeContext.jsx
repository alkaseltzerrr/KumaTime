import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FocusModeContext = createContext();

const defaultFocusSessionSettings = {
  duration: 25,
  breakDuration: 5,
  sessionType: 'Pomodoro',
  autoStartBreaks: true,
  soundEnabled: true
};

export const useFocusMode = () => {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};

export const FocusModeProvider = ({ children }) => {
  const [focusMode, setFocusMode] = useState(false);
  const [focusSessionSettings, setFocusSessionSettings] = useState(defaultFocusSessionSettings);
  const [focusSessionLaunchId, setFocusSessionLaunchId] = useState(0);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  const enterFocusMode = useCallback((settings) => {
    if (settings) {
      setFocusSessionSettings((prev) => ({ ...prev, ...settings }));
      setFocusSessionLaunchId((prev) => prev + 1);
    }
    setFocusMode(true);
  }, []);

  const exitFocusMode = useCallback(() => {
    setFocusMode(false);
  }, []);

  // Keyboard shortcuts for focus mode
  useEffect(() => {
    const handleKeyDown = (event) => {
      // F11 or Ctrl+Shift+F to toggle focus mode
      if (event.key === 'F11' || (event.ctrlKey && event.shiftKey && event.key === 'F')) {
        event.preventDefault();
        toggleFocusMode();
      }
      // Escape to exit focus mode
      if (event.key === 'Escape' && focusMode) {
        exitFocusMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleFocusMode, exitFocusMode, focusMode]);

  const value = {
    focusMode,
    toggleFocusMode,
    enterFocusMode,
    exitFocusMode,
    focusSessionSettings,
    focusSessionLaunchId
  };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
};