
import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { dbService } from '../services/dbService';

interface LoginPageProps {
  onNavigate: (view: ViewState) => void;
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await dbService.getUserByEmail(email);
      if (user && user.password === password) {
        onLogin({ id: user.id, email: user.email, name: user.name });
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div 
            onClick={() => onNavigate('LANDING')}
            className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto cursor-pointer mb-6"
          >
            <i className="fa-solid fa-bolt text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-slate-400 mt-2">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-100 placeholder:text-slate-500"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot?</button>
            </div>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-100 placeholder:text-slate-500"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-400">
          Don't have an account? 
          <button 
            onClick={() => onNavigate('SIGNUP')}
            className="ml-2 text-indigo-400 font-semibold hover:text-indigo-300"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
