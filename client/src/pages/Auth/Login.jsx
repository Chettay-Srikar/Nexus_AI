import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('admin@nexusai.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        const status = res?.status;
        const msg = res?.message || 'Authentication failed';
        if (status === 401) {
          setError('Incorrect credentials. Please check your email and password.');
        } else if (status === 400) {
          setError(msg || 'Email and password are required.');
        } else if (status === 403) {
          setError('Access forbidden. Your account does not have permission.');
        } else if (status === 404) {
          setError('Authentication service route not found.');
        } else if (status === 500) {
          setError(`Server Error (500): ${msg}`);
        } else {
          setError(msg);
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error?.message || err.message;
      if (status === 401) {
        setError('Incorrect credentials. Please check your email and password.');
      } else {
        setError(`Server Error (${status || 500}): ${msg || 'Authentication error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword(roleEmail.startsWith('admin') ? 'admin123' : 'user123');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-gray-800 space-y-6 relative z-10 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-gray-100 tracking-tight">NexusAI Enterprise</h2>
          <p className="text-xs text-gray-400">One AI Brain. Every Department. Every Decision.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold text-center">
            {error}
          </div>
        )}

        {/* Demo Quick Logins */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-1">Select Demo User Role</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin@nexusai.com')}
              className="p-2 rounded-lg bg-gray-900 hover:bg-indigo-600/20 border border-gray-800 text-gray-300 font-medium transition text-left"
            >
              👑 Administrator
            </button>
            <button
              onClick={() => handleQuickLogin('exec@nexusai.com')}
              className="p-2 rounded-lg bg-gray-900 hover:bg-indigo-600/20 border border-gray-800 text-gray-300 font-medium transition text-left"
            >
              💼 Executive
            </button>
            <button
              onClick={() => handleQuickLogin('manager@nexusai.com')}
              className="p-2 rounded-lg bg-gray-900 hover:bg-indigo-600/20 border border-gray-800 text-gray-300 font-medium transition text-left"
            >
              📊 Manager
            </button>
            <button
              onClick={() => handleQuickLogin('employee@nexusai.com')}
              className="p-2 rounded-lg bg-gray-900 hover:bg-indigo-600/20 border border-gray-800 text-gray-300 font-medium transition text-left"
            >
              🧑‍💻 Employee
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Corporate Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"
          >
            {loading ? 'Authenticating...' : 'Sign In to Enterprise Workspace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
