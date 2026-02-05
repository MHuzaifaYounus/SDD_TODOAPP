
import React, { useState, useEffect, useMemo } from 'react';
import { User, Task, Priority, Recurrence } from '../types';
import TaskCard from '../components/TaskCard';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/dbService';

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

  // Sync with DB on mount
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
      setDueDate(task.dueDate?.slice(0, 16) || '');
      setReminderTime(task.reminderTime?.slice(0, 16) || '');
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
    if (editingTask) {
      updatedTask = {
        ...editingTask,
        title, description, priority, recurrence, tags,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        reminderTime: reminderTime ? new Date(reminderTime).toISOString() : null
      };
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
    } else {
      updatedTask = {
        id: Math.random().toString(36).substr(2, 9),
        title, description, priority, recurrence, tags,
        isCompleted: false,
        createdAt: new Date().toISOString(),
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

  const calculateNextDate = (currentDateStr: string | null, recurrence: Recurrence): string | null => {
    if (!currentDateStr || recurrence === Recurrence.NONE) return null;
    const date = new Date(currentDateStr);
    if (recurrence === Recurrence.DAILY) date.setDate(date.getDate() + 1);
    else if (recurrence === Recurrence.WEEKLY) date.setDate(date.getDate() + 7);
    else if (recurrence === Recurrence.MONTHLY) date.setMonth(date.getMonth() + 1);
    return date.toISOString();
  };

  const toggleTask = async (id: string) => {
    const updatedList = [...tasks];
    const taskIndex = updatedList.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    const task = updatedList[taskIndex];
    const willBeCompleted = !task.isCompleted;
    updatedList[taskIndex] = { ...task, isCompleted: willBeCompleted };
    
    let recurringTask: Task | null = null;
    if (willBeCompleted && task.recurrence !== Recurrence.NONE) {
      const nextDue = calculateNextDate(task.dueDate || new Date().toISOString(), task.recurrence);
      const nextReminder = calculateNextDate(task.reminderTime, task.recurrence);
      recurringTask = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        isCompleted: false,
        dueDate: nextDue,
        reminderTime: nextReminder,
        createdAt: new Date().toISOString()
      };
      updatedList.unshift(recurringTask);
    }
    
    setTasks(updatedList);
    
    try {
      await dbService.saveTask(user.id, updatedList[updatedList.findIndex(t => t.id === id)]);
      if (recurringTask) {
        await dbService.saveTask(user.id, recurringTask);
      }
    } catch (err) {
      console.error("DB Toggle Sync Error", err);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await dbService.deleteTask(id);
    } catch (err) {
      console.error("DB Delete Sync Error", err);
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
        setDescription(prev => `${prev}\n\nAI Roadmap:\n- ${subtasks.join('\n- ')}`.trim());
      }
      if (tags.length > 0) {
        const newTags = tags.filter(tag => !tagsInput.includes(tag));
        if (newTags.length > 0) {
          setTagsInput(prev => prev ? `${prev}, ${newTags.join(', ')}` : newTags.join(', '));
        }
      }
    } catch (err) {
      console.error("AI service error", err);
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
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-950 border-r border-slate-800/60 p-6 flex flex-col z-20">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-bolt text-white text-lg"></i>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">NovaTask</span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Workspace</p>
          <button 
            onClick={() => setStatusFilter('ALL')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${statusFilter === 'ALL' ? 'bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <i className="fa-solid fa-layer-group w-5"></i>
            <span className="font-semibold">All Tasks</span>
            <span className="ml-auto text-xs bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">{tasks.length}</span>
          </button>
          <button 
            onClick={() => setStatusFilter('ACTIVE')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${statusFilter === 'ACTIVE' ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <i className="fa-solid fa-circle-dot w-5 text-xs"></i>
            <span className="font-semibold">Active</span>
            <span className="ml-auto text-xs bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">{tasks.filter(t => !t.isCompleted).length}</span>
          </button>
          <button 
            onClick={() => setStatusFilter('COMPLETED')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${statusFilter === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <i className="fa-solid fa-circle-check w-5 text-xs"></i>
            <span className="font-semibold">Completed</span>
            <span className="ml-auto text-xs bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">{tasks.filter(t => t.isCompleted).length}</span>
          </button>
        </nav>

        <div className="pt-6 mt-6 border-t border-slate-800/60">
          <div className="flex items-center space-x-4 px-4 py-4 bg-slate-900/40 rounded-3xl border border-slate-800/40">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700" alt="Avatar" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-100">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-xl transition-all"
              title="Logout"
            >
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-slate-900/30 relative overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-slate-800/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 backdrop-blur-sm bg-slate-900/10">
          <div className="flex-1 max-w-2xl relative group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Search across all your tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/30 border border-slate-700/50 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-slate-800/50 transition-all text-slate-100 placeholder:text-slate-600 shadow-inner"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-800/50 border border-slate-700/50 p-1 rounded-xl">
               <button 
                  onClick={() => setSortBy('CREATED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'CREATED' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-200'}`}
                >Newest</button>
                <button 
                  onClick={() => setSortBy('DUE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'DUE' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-200'}`}
                >Due</button>
            </div>

            <button 
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <i className="fa-solid fa-plus text-sm"></i>
              <span>Create Task</span>
            </button>
          </div>
        </header>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isInitialLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
              <p className="text-slate-400 font-medium">Syncing with database...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
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
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6">
              <div className="w-24 h-24 bg-slate-800/50 rounded-[2rem] flex items-center justify-center text-4xl border border-slate-700">
                <i className="fa-solid fa-inbox text-slate-500"></i>
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-slate-400">Your cloud-synced task list is empty</p>
                <p className="text-sm text-slate-500">Break your big goals into small, manageable tasks.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800/60 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                  <i className={`fa-solid ${editingTask ? 'fa-edit' : 'fa-plus'}`}></i>
                </div>
                <h2 className="text-xl font-black text-white">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Core Information</label>
                  <button 
                    onClick={handleAiSuggest}
                    disabled={!title || isAiLoading}
                    className="group px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-30 flex items-center space-x-2"
                  >
                    <i className={`fa-solid ${isAiLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles text-indigo-300'}`}></i>
                    <span>AI Breakdown</span>
                  </button>
                </div>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full text-3xl font-black bg-transparent border-none outline-none placeholder:text-slate-800 text-white selection:bg-indigo-500/30"
                />
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details, notes, or AI suggested subtasks..."
                  className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 outline-none focus:border-indigo-500/50 transition-all resize-none text-slate-300 text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(p => (
                      <button 
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${
                          priority === p 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recurrence</label>
                  <div className="relative">
                    <select 
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value as any)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 text-sm font-semibold outline-none cursor-pointer appearance-none text-slate-300 hover:border-slate-500 transition-all"
                    >
                      <option value={Recurrence.NONE}>No Recurrence</option>
                      <option value={Recurrence.DAILY}>Repeats Daily</option>
                      <option value={Recurrence.WEEKLY}>Repeats Weekly</option>
                      <option value={Recurrence.MONTHLY}>Repeats Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</label>
                  <input 
                    type="datetime-local" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-4 pr-4 py-3.5 text-sm font-semibold outline-none text-slate-300 hover:border-slate-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reminder Alert</label>
                  <input 
                    type="datetime-local" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-4 pr-4 py-3.5 text-sm font-semibold outline-none text-slate-300 hover:border-slate-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tags (Separated by commas)</label>
                <input 
                  type="text" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Work, Urgent, Personal"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-4 pr-4 py-3.5 text-sm font-semibold outline-none text-slate-300 hover:border-slate-500 transition-all"
                />
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-950/50 border-t border-slate-800/60 flex justify-end items-center space-x-6">
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 font-bold transition-colors text-sm">Discard</button>
              <button 
                onClick={handleSaveTask}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-white transition-all shadow-xl shadow-indigo-600/40"
              >
                {editingTask ? 'Update Task' : 'Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
