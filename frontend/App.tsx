
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import { ViewState, User, Task } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    dbService.init();
    const savedUser = localStorage.getItem('nova_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('DASHBOARD');
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('nova_user', JSON.stringify(userData));
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nova_user');
    setView('LANDING');
  };

  const navigateTo = (newView: ViewState) => setView(newView);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user || view !== 'DASHBOARD') return;
      
      try {
        const tasks = await dbService.getTasks(user.id);
        const now = new Date();
        
        tasks.forEach(task => {
          if (!task.isCompleted && task.reminderTime) {
            const reminderDate = new Date(task.reminderTime);
            const diff = now.getTime() - reminderDate.getTime();
            if (diff >= 0 && diff < 60000) {
              if (Notification.permission === 'granted') {
                new Notification('NovaTask Reminder', {
                  body: `Don't forget: ${task.title}`,
                  icon: 'https://cdn-icons-png.flaticon.com/512/2098/2098402.png'
                });
              }
            }
          }
        });
      } catch (err) {
        console.error("Reminder checker failed", err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [view, user]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {view === 'LANDING' && <LandingPage onNavigate={navigateTo} />}
      {view === 'LOGIN' && <LoginPage onNavigate={navigateTo} onLogin={handleLogin} />}
      {view === 'SIGNUP' && <SignupPage onNavigate={navigateTo} onSignup={handleLogin} />}
      {view === 'DASHBOARD' && user && (
        <DashboardPage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
