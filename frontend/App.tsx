import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import { ViewState, User, Task } from './types.ts';
import { dbService } from './services/dbService.ts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Attempt database initialization
    dbService.init().catch(err => {
      console.error("Database connection could not be established:", err);
    });

    const savedUser = localStorage.getItem('nova_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setView('DASHBOARD');
      } catch (e) {
        localStorage.removeItem('nova_user');
      }
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

  // Notification logic
  useEffect(() => {
    if (!user || view !== 'DASHBOARD') return;

    const interval = setInterval(async () => {
      try {
        const tasks = await dbService.getTasks(user.id);
        const now = new Date();
        
        tasks.forEach(task => {
          if (!task.isCompleted && task.reminderTime) {
            const reminderDate = new Date(task.reminderTime);
            const diff = now.getTime() - reminderDate.getTime();
            // Check if reminder is within the current minute
            if (diff >= 0 && diff < 60000) {
              if (Notification.permission === 'granted') {
                new Notification('NovaTask', {
                  body: `Action Required: ${task.title}`,
                  icon: 'https://cdn-icons-png.flaticon.com/512/2098/2098402.png'
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission();
              }
            }
          }
        });
      } catch (err) {
        console.warn("Silent failure in reminder loop:", err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [view, user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
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