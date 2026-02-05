
import React from 'react';
import { ViewState } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden bg-slate-950">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/50">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-bolt text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight">NovaTask</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => onNavigate('LOGIN')}
              className="px-5 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('SIGNUP')}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center md:text-left lg:flex lg:items-center">
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Now with Gemini Pro AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Task Management.
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
            Stop juggling complicated tools. NovaTask uses agentic AI to break down your goals, suggest smarter paths, and automate the mundane.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => onNavigate('SIGNUP')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-indigo-600/30"
            >
              Start Crushing Goals
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 border border-slate-700">
              <i className="fa-solid fa-play text-sm text-indigo-400"></i>
              <span>Watch the Agent in Action</span>
            </button>
          </div>
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <img 
                  key={i} 
                  src={`https://i.pravatar.cc/150?u=${i}`} 
                  className="w-10 h-10 rounded-full border-2 border-slate-950 grayscale-[20%] hover:grayscale-0 transition-all cursor-pointer" 
                  alt="User" 
                />
              ))}
            </div>
            <p className="text-sm text-slate-400 font-medium">Trusted by 12,000+ early adopters</p>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="relative z-10 p-4 bg-gradient-to-tr from-slate-800/50 to-slate-900/50 rounded-[40px] border border-slate-700/50 shadow-2xl backdrop-blur-sm transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000" 
              alt="Task Dashboard" 
              className="rounded-[32px] w-full h-[500px] object-cover"
            />
            {/* Overlay badge */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Productivity</p>
                <p className="text-lg font-bold text-emerald-400">+42% this week</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Core Features Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Everything you need to <span className="text-indigo-400">scale</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">One platform for your personal habits, team projects, and AI-assisted workflows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-indigo-500/50 transition-all hover:bg-slate-900/60">
              <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-brain"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Agentic Suggestions</h3>
              <p className="text-slate-400 leading-relaxed">Let Gemini analyze your task titles and suggest actionable subtasks automatically. Breakdown big goals in seconds.</p>
            </div>
            <div className="group p-8 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-purple-500/50 transition-all hover:bg-slate-900/60">
              <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-repeat"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Recurring Engines</h3>
              <p className="text-slate-400 leading-relaxed">Automation that actually works. Custom schedules for daily standups, weekly reviews, or monthly bills.</p>
            </div>
            <div className="group p-8 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-emerald-500/50 transition-all hover:bg-slate-900/60">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-bell"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Reminders</h3>
              <p className="text-slate-400 leading-relaxed">Browser notifications that cut through the noise. Never miss a deadline with precise time-based alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (Visual Steps) */}
      <section id="how-it-works" className="py-24 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000" 
                alt="Code and Workflow" 
                className="rounded-3xl shadow-2xl border border-slate-800"
              />
            </div>
            <div className="lg:w-1/2 space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">Simplify your workflow in <span className="text-indigo-400">3 steps</span></h2>
                <p className="text-slate-400">We've removed the friction between thought and action.</p>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center font-bold text-indigo-400">1</div>
                  <div>
                    <h4 className="text-xl font-bold">Brain-dump Tasks</h4>
                    <p className="text-slate-400">Just type. Our smart parser handles dates, priorities, and categories from your natural language.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center font-bold text-indigo-400">2</div>
                  <div>
                    <h4 className="text-xl font-bold">Let AI Orchestrate</h4>
                    <p className="text-slate-400">Tap "AI Suggest" to let our agentic stack define the roadmap for your complex tasks.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center font-bold text-indigo-400">3</div>
                  <div>
                    <h4 className="text-xl font-bold">Execute & Automate</h4>
                    <p className="text-slate-400">Focus on doing. NovaTask handles the recurring schedules and reminds you exactly when it matters.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent <span className="text-indigo-400">pricing</span></h2>
            <p className="text-slate-400">No hidden fees. Start free, scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
            {/* Free Plan */}
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <p className="mt-4 text-slate-400 text-sm">Perfect for individuals starting out.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center space-x-3 text-sm">
                  <i className="fa-solid fa-check text-emerald-500"></i>
                  <span>Unlimited Tasks</span>
                </li>
                <li className="flex items-center space-x-3 text-sm">
                  <i className="fa-solid fa-check text-emerald-500"></i>
                  <span>Priority & Tags</span>
                </li>
                <li className="flex items-center space-x-3 text-sm">
                  <i className="fa-solid fa-check text-emerald-500"></i>
                  <span>Basic Reminders</span>
                </li>
              </ul>
              <button 
                onClick={() => onNavigate('SIGNUP')}
                className="w-full py-3 border border-slate-700 hover:bg-slate-800 rounded-xl font-bold transition-all"
              >
                Join Free
              </button>
            </div>
            {/* Pro Plan */}
            <div className="p-8 bg-indigo-600/10 border-2 border-indigo-600 rounded-3xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Recommended</div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Nova Pro</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-extrabold">$12</span>
                  <span className="text-indigo-400/70 font-medium">/mo</span>
                </div>
                <p className="mt-4 text-slate-300 text-sm font-medium">For power users who want AI everything.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center space-x-3 text-sm">
                  <i className="fa-solid fa-check text-indigo-400"></i>
                  <span className="font-bold">Everything in Basic</span>
                </li>
                <li className="flex items-center space-x-3 text-sm">
                  <i className="fa-solid fa-star text-indigo-400"></i>
                  <span className="font-bold text-indigo-100">AI Task Breakdown (Gemini)</span>
                </li>
                <li className="flex items-center space-x-3 text-sm">
                  <i className="fa-solid fa-repeat text-indigo-400"></i>
                  <span>Advanced Recurring Rules</span>
                </li>
                <li className="flex items-center space-x-3 text-sm">
                  <i className="fa-solid fa-shield text-indigo-400"></i>
                  <span>Cloud Backup & Sync</span>
                </li>
              </ul>
              <button 
                onClick={() => onNavigate('SIGNUP')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
              >
                Go Pro Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Built for <span className="text-indigo-400">Action Takers</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Product Manager", text: "NovaTask actually understands what I'm trying to do. The AI breakdown is a game changer for my complex projects.", img: "https://i.pravatar.cc/150?u=sarah" },
              { name: "Alex Rivera", role: "Freelance Designer", text: "Finally a dark-themed todo app that isn't clunky. Fast, beautiful, and the recurring tasks are seamless.", img: "https://i.pravatar.cc/150?u=alex" },
              { name: "Marcus Thorne", role: "Engineering Lead", text: "The agentic features saved me hours this week. It feels like having a junior PM helping you organize your day.", img: "https://i.pravatar.cc/150?u=marcus" }
            ].map((t, idx) => (
              <div key={idx} className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <p className="text-slate-300 italic mb-6">"{t.text}"</p>
                <div className="flex items-center space-x-4">
                  <img src={t.img} className="w-12 h-12 rounded-full border border-slate-600" alt={t.name} />
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 -z-10"></div>
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold">Ready to reclaim <br /> your <span className="text-indigo-400">focus</span>?</h2>
          <p className="text-xl text-slate-400 leading-relaxed">Join thousands of people who are already managing their lives with more clarity and speed.</p>
          <div className="pt-4">
            <button 
              onClick={() => onNavigate('SIGNUP')}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-xl transition-all shadow-2xl shadow-indigo-600/40 transform hover:scale-105 active:scale-95"
            >
              Get Started for Free
            </button>
            <p className="mt-6 text-slate-500 text-sm">No credit card required • Instant access</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-bolt text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold">NovaTask</span>
            </div>
            <p className="text-slate-500 text-sm">Intelligence at the speed of thought. The last productivity tool you'll ever need.</p>
            <div className="flex space-x-4 text-slate-400">
              <a href="#" className="hover:text-indigo-400 transition-colors"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><i className="fa-brands fa-github"></i></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><i className="fa-brands fa-linkedin"></i></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Roadmap</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-slate-500 mb-4">Get productivity tips delivered to your inbox.</p>
            <div className="flex space-x-2">
              <input type="email" placeholder="email@example.com" className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm flex-1 outline-none focus:border-indigo-500" />
              <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs">
          <p>© 2024 NovaTask. All rights reserved. Built with Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
