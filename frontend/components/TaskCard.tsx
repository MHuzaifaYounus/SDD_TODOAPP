
import React from 'react';
import { Task, Priority, Recurrence } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const priorityColor = {
    [Priority.LOW]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [Priority.MEDIUM]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [Priority.HIGH]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }[task.priority];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`group p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-300 ${task.isCompleted ? 'opacity-50 grayscale-[20%]' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <button 
            onClick={() => onToggle(task.id)}
            aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
            className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
              task.isCompleted 
                ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]' 
                : 'border-slate-600 hover:border-indigo-500 bg-slate-900/50'
            }`}
          >
            {task.isCompleted && <i className="fa-solid fa-check text-[10px] text-white"></i>}
          </button>
          
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className={`font-semibold text-lg truncate transition-all ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {task.title}
            </h3>
            {task.description && !task.isCompleted && (
              <p className="text-slate-400 text-sm line-clamp-1 group-hover:line-clamp-none transition-all">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${priorityColor}`}>
                {task.priority}
              </span>
              
              {task.dueDate && (
                <span className="flex items-center text-[10px] font-medium text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                  <i className="fa-regular fa-calendar mr-1.5"></i>
                  {formatDate(task.dueDate)}
                </span>
              )}

              {task.recurrence !== Recurrence.NONE && (
                <span className="flex items-center text-[10px] font-medium text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md border border-indigo-400/20">
                  <i className="fa-solid fa-repeat mr-1.5"></i>
                  {task.recurrence}
                </span>
              )}

              {task.tags.map(tag => (
                <span key={tag} className="text-[10px] font-medium text-slate-500 bg-slate-900/30 px-2 py-0.5 rounded-md border border-slate-800">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors"
            title="Edit Task"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
            title="Delete Task"
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
