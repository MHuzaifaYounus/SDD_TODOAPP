import React, { useState, useEffect, useMemo } from 'react';
import { User, Task, Priority, Recurrence } from '../types.ts';
import TaskCard from '../components/TaskCard.tsx';
import { geminiService } from '../services/geminiService.ts';
import { dbService } from '../services/dbService.ts';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [recurrence, setRecurrence] = useState<Recurrence>(Recurrence.NONE);
  const [dueDate, setDueDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'CREATED' | 'DUE' | 'PRIORITY' | 'TITLE'>('CREATED');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const dbTasks = await dbService.getTasks(user.id);
        setTasks(dbTasks);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchTasks();
  }, [user.id]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setRecurrence(task.recurrence);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
      setReminderTime(task.reminderTime ? new Date(task.reminderTime).toISOString().slice(0, 16) : '');
      setTagsInput(task.tags.join(', '));
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setPriority(Priority.MEDIUM);
      setRecurrence(Recurrence.NONE);
      setDueDate('');
      setReminderTime('');
      setTagsInput('');
    }
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
    
    let updatedTask: Task;
    const now = new Date().toISOString();

    if (editingTask) {
      updatedTask = {
        ...editingTask,
        title, 
        description, 
        priority, 
        recurrence, 
        tags,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        reminderTime: reminderTime ? new Date(reminderTime).toISOString() : null
      };
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
    } else {
      updatedTask = {
        id: Math.random().toString(36).substr(2, 9),
        title, 
        description, 
        priority, 
        recurrence, 
        tags,
        isCompleted: false,
        createdAt: now,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        reminderTime: reminderTime ? new Date(reminderTime).toISOString() : null
      };
      setTasks(prev => [updatedTask, ...prev]);
    }

    try {
      await dbService.saveTask(user.id, updatedTask);
    } catch (err) {
      console.error("DB Sync Error", err);
    }
    setIsModalOpen(false);
  };

  const calculateNextDate = (currentDateStr: string | null, rec: Recurrence): string | null => {
    if (!currentDateStr || rec === Recurrence.NONE) return null;
    const date = new Date(currentDateStr);
    if (rec === Recurrence.DAILY) date.setDate(date.getDate() + 1);
    else if (rec === Recurrence.WEEKLY) date.setDate(date.getDate() + 7);
    else if (rec === Recurrence.MONTHLY) date.setMonth(date.getMonth() + 1);
    return date.toISOString();
  };

  const toggleTask = async (id: string) => {
    setTasks(prev => {
      const updatedList = [...prev];
      const taskIndex = updatedList.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      
      const task = updatedList[taskIndex];
      const willBeCompleted = !task.isCompleted;
      updatedList[taskIndex] = { ...task, isCompleted: willBeCompleted };
      
      if (willBeCompleted && task.recurrence !== Recurrence.NONE) {
        const nextDue = calculateNextDate(task.dueDate || new Date().toISOString(), task.recurrence);
        const nextReminder = calculateNextDate(task.reminderTime, task.recurrence);
        const recurringTask: Task = {
          ...task,
          id: Math.random().toString(36).substr(2, 9),
          isCompleted: false,
          dueDate: nextDue,
          reminderTime: nextReminder,
          createdAt: new Date().toISOString()
        };
        updatedList.unshift(recurringTask);
        // We handle the DB sync outside the state setter or in a separate effect
        dbService.saveTask(user.id, updatedList[taskIndex]);
        dbService.saveTask(user.id, recurringTask);
      } else {
        dbService.saveTask(user.id, updatedList[taskIndex]);
      }
      
      return updatedList;
    });
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await dbService.deleteTask(id);
    } catch (err) {
      console.error("DB Delete Error", err);
    }
  };

  const handleAiSuggest = async () => {
    if (!title) return;
    setIsAiLoading(true);
    try {
      const [subtasks, tags] = await Promise.all([
        geminiService.suggestSubtasks(title),
        geminiService.suggestTags(title, description)
      ]);
      
      if (subtasks.length > 0) {
        setDescription(prev => `${prev}\n\n✨ AI Action Items:\n- ${subtasks.join('\n- ')}`.trim());
      }
      if (tags.length > 0) {
        const currentTags = tagsInput.split(',').map(t => t.trim().toLowerCase());
        const newTags = tags.filter(tag => !currentTags.includes(tag.toLowerCase()));
        if (newTags.length > 0) {
          setTagsInput(prev => prev ? `${prev}, ${newTags.join(', ')}` : newTags.join(', '));
        }
      }
    } catch (err) {
      console.error("AI Assistant unreachable", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' ? true : 
                              statusFilter === 'ACTIVE' ? !t.isCompleted : t.isCompleted;
        const matchesPriority = priorityFilter === 'ALL' ? true : t.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
        if (sortBy === 'PRIORITY') {
          const pMap = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
          return pMap[b.priority] - pMap[a.priority];
        }
        if (sortBy === 'DUE') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-800/40 bg-[#020617]/50 backdrop-blur-xl">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-bolt text-white text-xl"></i>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">NovaTask</span>
        </div>

        <div className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Workspace</p>
            <nav className="space-y-1">
              {[
                { id: 'ALL', label: 'Dashboard', icon: 'fa-house', color: 'indigo' },
                { id: 'ACTIVE', label: 'In Progress', icon: 'fa-spinner', color: 'amber' },
                { id: 'COMPLETED', label: 'Completed', icon: 'fa-check-double', color: 'emerald' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setStatusFilter(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    statusFilter === item.id 
                      ? `bg-${item.color}-500/10 text-${item.color}-400 ring-1 ring-${item.color}-500/20` 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-5 text-sm`}></i>
                  <span className="font-semibold">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Quick Filters</p>
             <div className="space-y-1">
                {Object.values(Priority).map(p => (
                   <button 
                    key={p}
                    onClick={() => setPriorityFilter(priorityFilter === p ? 'ALL' : p)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      priorityFilter === p ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800/30'
                    }`}
                   >
                     <div className={`w-2 h-2 rounded-full ${p === Priority.HIGH ? 'bg-rose-500' : p === Priority.MEDIUM ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                     <span className="text-sm font-medium capitalize">{p.toLowerCase()} Priority</span>
                   </button>
                ))}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/40">
          <div className="flex items-center space-x-3 p-3 bg-slate-900/50 rounded-2xl border border-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-100">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="px-8 py-6 border-b border-slate-800/40 flex items-center justify-between backdrop-blur-md bg-[#020617]/40 z-10">
          <div className="flex-1 max-w-xl relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="text" 
              placeholder="Deep search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800/50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
            />
          </div>

          <div className="flex items-center space-x-4 ml-4">
            <div className="hidden sm:flex bg-slate-900/80 p-1 rounded-xl border border-slate-800/50">
               {['CREATED', 'DUE', 'PRIORITY'].map((s) => (
                 <button 
                  key={s}
                  onClick={() => setSortBy(s as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    sortBy === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
                 >
                   {s === 'CREATED' ? 'Newest' : s}
                 </button>
               ))}
            </div>
            
            <button 
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
            >
              <i className="fa-solid fa-plus"></i>
              <span>New Task</span>
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isInitialLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Nodes</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  onEdit={handleOpenModal}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-32 h-32 bg-slate-900 rounded-[3rem] flex items-center justify-center text-5xl text-slate-700 border border-slate-800">
                <i className="fa-solid fa-ghost"></i>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-400 tracking-tight">Ethereal Silence</h3>
                <p className="text-sm text-slate-500 max-w-xs">No tasks match your current temporal frequency.</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800/80 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                  <i className={`fa-solid ${editingTask ? 'fa-pen-nib' : 'fa-sparkles'}`}></i>
                </div>
                <h2 className="text-xl font-black tracking-tight">{editingTask ? 'Update Protocol' : 'Initiate Task'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white transition-all flex items-center justify-center">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Primary Objective</label>
                   <button 
                    onClick={handleAiSuggest}
                    disabled={!title || isAiLoading}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase rounded-lg border border-indigo-500/20 transition-all disabled:opacity-20"
                   >
                     <i className={`fa-solid ${isAiLoading ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                     <span>AI Augmented Strategy</span>
                   </button>
                </div>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full text-3xl font-black bg-transparent border-none outline-none placeholder:text-slate-800 text-white"
                />
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context and strategic notes..."
                  className="w-full bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 outline-none focus:border-indigo-500/50 transition-all resize-none text-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority Index</label>
                  <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                    {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(p => (
                      <button 
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                          priority === p ? 'bg-slate-800 text-white ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Cycle</label>
                   <select 
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-bold outline-none text-slate-400"
                   >
                     <option value={Recurrence.NONE}>Single Instance</option>
                     <option value={Recurrence.DAILY}>Daily Cycle</option>
                     <option value={Recurrence.WEEKLY}>Weekly Rhythm</option>
                     <option value={Recurrence.MONTHLY}>Monthly Pulse</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deadline</label>
                  <input 
                    type="datetime-local" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-bold outline-none text-slate-300"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Proximity Alert</label>
                  <input 
                    type="datetime-local" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-bold outline-none text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identifiers</label>
                <input 
                  type="text" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="work, deep-focus, health..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-bold outline-none text-slate-300"
                />
              </div>
            </div>

            <div className="p-8 border-t border-slate-800/50 bg-[#020617]/50 flex items-center justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">Abort</button>
              <button 
                onClick={handleSaveTask}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                {editingTask ? 'Commit Changes' : 'Execute Creation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;