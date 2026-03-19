import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Sun, Moon, LogOut, ChevronDown, Play, Square, Timer } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import socket from '../utils/socket';

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState(null);
  
  const [darkMode, setDarkMode] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    try {
      const { data } = await axios.get('/api/attendance/my-status');
      if (data?._id) setAttendance(data);
    } catch (err) {
      console.error('Failed to fetch attendance');
    }
  };

  const handleCheckIn = async () => {
    try {
      const { data } = await axios.post('/api/attendance/check-in');
      setAttendance(data);
      toast.success('Workday started! Good luck.');
    } catch (err) {
      toast.error('Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    if (!window.confirm('Ready to check out for the day?')) return;
    try {
      const { data } = await axios.post('/api/attendance/check-out');
      setAttendance(data);
      toast.success('Workday ended! Have a great evening.');
    } catch (err) {
      toast.error('Check-out failed');
    }
  };

  useEffect(() => {
    // Socket listener for new tasks
    const handleTaskCreated = (task) => {
      const isAssignee = task.assignees?.some(a => a._id === user?._id);
      if (isAssignee || user?.role === 'admin') {
        const newNotif = {
          id: Date.now(),
          type: 'new_task',
          title: 'New assignment',
          message: `Task: ${task.title}`,
          time: 'Just now'
        };
        setNotifications(prev => [newNotif, ...prev]);
        toast.info(`🔔 ${task.title} assigned to you!`);
      }
    };

    const handleTaskUpdated = (task) => {
      const isAssignee = task.assignees?.some(a => a._id === user?._id);
      if (isAssignee || user?.role === 'admin') {
         const newNotif = {
           id: Date.now(),
           type: 'task_update',
           title: 'Task updated',
           message: `${task.title} is now ${task.status}`,
           time: 'Just now'
         };
         setNotifications(prev => [newNotif, ...prev]);
         if (task.status === 'Completed') {
            toast.success(`🎉 ${task.title} was completed!`);
         }
      }
    };

    socket.on('taskCreated', handleTaskCreated);
    socket.on('taskUpdated', handleTaskUpdated);

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
    };
  }, [user]);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    setDarkMode(isDark);
  };
  
  // existing handleLogout...
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (_) {}
    logout();
    toast.info('Logged out.');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">

      {/* Search */}
      <div className="flex-1 max-w-xl hidden md:flex">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search tasks, people..."
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto">

        {/* New Task Link */}
        {['admin', 'manager'].includes(user?.role) && (
          <Link to="/dashboard/tasks" className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
            <Plus size={16} />
            <span>Task Board</span>
          </Link>
        )}

        {/* Attendance widget */}
        <div className="hidden sm:flex items-center gap-2 mr-2">
          {attendance?.checkIn ? (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-start leading-none">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shift Start</span>
                 <span className="text-xs font-black text-slate-700 dark:text-slate-200">{new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {!attendance.checkOut ? (
                <button 
                  onClick={handleCheckOut}
                  className="p-1.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-600 hover:text-white transition-all ml-1"
                  title="Check Out"
                >
                  <Square size={14} fill="currentColor" />
                </button>
              ) : (
                <div className="flex flex-col items-start leading-none ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shift End</span>
                   <span className="text-xs font-black text-slate-700 dark:text-slate-200">{new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleCheckIn}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl text-sm font-bold transition-all border border-emerald-200/50 dark:border-emerald-500/20"
            >
              <Play size={14} fill="currentColor" />
              Check In
            </button>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors relative"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
            )}
          </button>
          
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Alerts</h4>
                  <button onClick={() => setNotifications([])} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Clear all</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                      <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">{n.time}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-12 text-center">
                       <Bell className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={24} />
                       <p className="text-xs text-slate-400">Everything up to date</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 cursor-pointer group rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'employee'}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
