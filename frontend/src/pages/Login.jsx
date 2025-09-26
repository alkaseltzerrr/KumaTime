import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Heart } from 'lucide-react';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let success;
    if (isSignup) {
      success = await signup(username, email, password);
    } else {
      success = await login(email, password);
    }
    
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md"
      >
        {/* Bear Logo */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="text-6xl mb-2"
          >
            🐻
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pastel-peach to-pastel-pink bg-clip-text text-transparent">
            KumaTime
          </h1>
          <p className="text-gray-600 text-sm mt-1">Your Virtual Study Buddy</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignup}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-blue focus:border-transparent"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-blue focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-blue focus:border-transparent"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-pastel-peach to-pastel-pink text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Log In'}
          </motion.button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <span className="font-semibold text-pastel-blue hover:underline">
              {isSignup ? 'Log in' : 'Sign up'}
            </span>
          </button>
        </div>

        {/* Guest Mode */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1 mx-auto"
          >
            <Heart size={16} />
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;