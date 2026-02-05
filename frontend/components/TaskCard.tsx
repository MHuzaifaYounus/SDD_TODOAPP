import React from 'react';
import { Task, Priority, Recurrence } from '../types.ts';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const priorityStyle = {
    [Priority.LOW]: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    [Priority.MEDIUM]: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    [Priority.HIGH]: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  }[task.priority];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className={`group relative p-6 bg-slate-900/40 border border-slate-800/60 rounded-[1.5rem] hover:bg-slate-900/60 hover:border-slate-700/80 transition-all duration-300 ${task.isCompleted ? 'opacity-40 grayscale' : ''}`}
    >
      <div className="flex items-start space-x-4">
        {/* Toggle Checkbox */}
        <button 
          onClick={() => onToggle(task.id)}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            task.isCompleted 
              ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/20' 
              : 'border-slate-700 hover:border-indigo-500 bg-slate-950/50'
          }`}
        >
          {task.isCompleted && <i className="fa-solid fa-check text-[10px] text-white"></i>}
        </button>
        
        <div className="flex-1 min-w-0 space-y-3">
          <div className="space-y-1">
            <h3 className={`text-lg font-bold tracking-tight transition-all ${task.isCompleted ? 'line-through text-slate-600' : 'text-slate-100'}`}>
              {task.title}
            </h3>
            {task.description && !task.isCompleted && (
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${priorityStyle}`}>
              {task.priority}
            </span>
            
            {task.dueDate && (
              <span className="flex items-center text-[9px] font-bold text-slate-500 bg-slate-950/50 px-2 py-0.5 rounded-md border border-slate-800">
                <i className="fa-regular fa-calendar-check mr-1.5 opacity-60"></i>
                {formatDate(task.dueDate)}
              </span>
            )}

            {task.recurrence !== Recurrence.NONE && (
              <span className="flex items-center text-[9px] font-bold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10">
                <i className="fa-solid fa-rotate mr-1.5"></i>
                {task.recurrence}
              </span>
            )}
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map(tag => (
                <span key={tag} className="text-[10px] text-slate-600 font-medium">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
          <button 
            onClick={() => onEdit(task)}
            className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-500 hover:text-white rounded-xl transition-all"
          >
            <i className="fa-solid fa-sliders text-xs"></i>
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2 bg-rose-500/5 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-xl transition-all"
          >
            <i className="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;