import React, { useState } from 'react';
import { ViewState, User } from '../types.ts';
import { dbService } from '../services/dbService.ts';

interface SignupPageProps {
  onNavigate: (view: ViewState) => void;
  onSignup: (user: User) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onNavigate, onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser) {
        setError('An account with this email already exists.');
        setIsLoading(false);
        return;
      }

      const newUser: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        email, 
        name 
      };

      await dbService.createUser({ ...newUser, password });
      onSignup(newUser);
    } catch (err) {
      console.error("Signup component error:", err);
      setError('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div 
            onClick={() => onNavigate('LANDING')}
            className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto cursor-pointer mb-6 transform hover:scale-105 transition-transform"
          >
            <i className="fa-solid fa-bolt text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Join NovaTask</h2>
          <p className="text-slate-400 mt-2">Create your account to start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-100 placeholder:text-slate-500"
              placeholder="John Doe"
            />
          </div>
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
            <label className="text-sm font-medium text-slate-300">Password</label>
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
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-400">
          Already have an account? 
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="ml-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;