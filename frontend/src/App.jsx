import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FocusModeProvider } from './contexts/FocusModeContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }
  
  // Allow guest access to dashboard, but they won't see personalized data
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <FocusModeProvider>
          <div className="font-cute min-h-screen">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </FocusModeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
