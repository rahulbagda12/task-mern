import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Calendar, Clock, Paperclip, MessageSquare, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import socket from '../../utils/socket';

const priorityColors = {
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  Urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
};

const statusMapping = {
  'Todo': 'Todo',
  'In Progress': 'In Progress',
  'In Review': 'In Review',
  'Completed': 'Completed'
};

const KanbanBoard = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', assignees: [] });
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [filterUser, setFilterUser] = useState('all');

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    // Listen for real-time updates from other users
    socket.on('taskUpdated', (updatedTask) => {
      setTasks((prev) => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    });

    return () => {
      socket.off('taskUpdated');
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/api/tasks');
      setTasks(data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/auth/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const taskToUpdate = tasks.find(t => t._id === draggedTaskId);
    if (taskToUpdate.status === newStatus) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t._id === draggedTaskId ? { ...t, status: newStatus } : t));

    try {
      const { data } = await axios.put(`/api/tasks/${draggedTaskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === draggedTaskId ? data : t));
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      setTasks(previousTasks);
      toast.error('Failed to update task status');
    } finally {
      setDraggedTaskId(null);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/tasks', newTask);
      setTasks([...tasks, data]);
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'Todo', assignees: [] });
      toast.success('Task created successfully');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const deleteTask = async (id) => {
    if(!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  }

  const columns = [
    { id: 'Todo', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'In Review', title: 'In Review' },
    { id: 'Completed', title: 'Done' }
  ];

  const filteredTasks = tasks.filter(task => {
    if (filterUser === 'all') return true;
    return task.assignees?.some(a => a._id === filterUser);
  });

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Sprint</h1>
          <p className="text-slate-500 text-sm mt-1">Manage team tasks and assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <select 
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">Alt Assignees</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>Only: {u.name}</option>
              ))}
            </select>
          )}
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x">
        {columns.map((col) => (
          <div 
            key={col.id} 
            className="flex-shrink-0 w-80 min-h-[500px] flex flex-col snap-center rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 p-2 border border-dashed border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex justify-between items-center px-1 mb-4 pt-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.id === 'Completed' ? 'bg-emerald-500' : col.id === 'In Progress' ? 'bg-blue-500' : col.id === 'In Review' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                {col.title}
                <span className="text-xs font-normal text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-1">
                  {filteredTasks.filter(t => t.status === col.id).length}
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <AnimatePresence>
                {filteredTasks.filter(t => t.status === col.id).map((task) => (
                  <motion.div
                    key={task._id}
                    layoutId={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow mb-3 group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </div>
                      <button 
                         onClick={() => deleteTask(task._id)}
                         className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5 leading-tight">{task.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-2">
                           {task.assignees?.map((a, i) => (
                             <img key={i} className="w-6 h-6 rounded-full border border-white dark:border-slate-800" src={a.avatar || `https://ui-avatars.com/api/?name=${a.name}`} alt={a.name} title={a.name} />
                           ))}
                        </div>
                        {task.assignees?.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium ml-1 truncate max-w-[80px]">{task.assignees[0].name}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                         <Clock size={10} />
                         Recently
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Task</h2>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Task title..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" rows="3" placeholder="Description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none capitalize">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})} className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none capitalize">
                    <option value="Todo">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Done</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign To</label>
                <select 
                  className="w-full px-4 py-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none"
                  value={newTask.assignees[0] || ''}
                  onChange={e => setNewTask({...newTask, assignees: e.target.value ? [e.target.value] : []})}
                >
                  <option value="">Select Member</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all mt-4">Create Task</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
