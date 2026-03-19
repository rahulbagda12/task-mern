import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  CheckSquare, Clock, AlertTriangle, TrendingUp, ArrowUpRight, ArrowRight,
  MoreHorizontal, Users, UserCheck, CalendarDays, Briefcase, BarChart2, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const priorityColors = {
  Low:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  Medium: 'bg-blue-100    text-blue-700    dark:bg-blue-500/20    dark:text-blue-400',
  High:   'bg-amber-100   text-amber-700   dark:bg-amber-500/20   dark:text-amber-400',
  Urgent: 'bg-rose-100    text-rose-700    dark:bg-rose-500/20    dark:text-rose-400',
};

const statusColors = {
  'Todo':        'text-slate-500 dark:text-slate-400',
  'In Progress': 'text-blue-600 dark:text-blue-400',
  'In Review':   'text-amber-600 dark:text-amber-400',
  'Completed':   'text-emerald-600 dark:text-emerald-400',
};

// ─── Admin Dashboard ────────────────────────────────────────────────────────
const AdminDashboard = ({ firstName, greeting, stats, recentTasks, teamMembers, chartData }) => {
  const statCards = [
    { label: 'Total Tasks',  value: stats.total, icon: CheckSquare },
    { label: 'In Progress',  value: stats.inProgress, icon: Clock },
    { label: 'Completed',    value: stats.completed, icon: TrendingUp },
    { label: 'Team Size',    value: teamMembers.length, icon: Users },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{greeting}, {firstName} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Welcome back to your workspace overview.</p>
        </div>
        <Link to="/dashboard/tasks" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 text-sm">
          View Kanban Board <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6">Task Activity (Last 7 Days)</h3>
           <div className="h-64 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9', fontSize: 12 }} />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Tasks</h3>
            <Link to="/dashboard/tasks" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">View all <ArrowUpRight size={12} /></Link>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {recentTasks.slice(-5).reverse().map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                   {task.title.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${priorityColors[task.priority]}`}>{task.priority}</span>
                    <span className={`text-xs font-medium ${statusColors[task.status]}`}>{task.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentTasks.length === 0 && <p className="text-center text-slate-400 py-10">No tasks found</p>}
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 dark:text-white">Team Members</h3>
          <Link to="/dashboard/team" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Manage team →</Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all cursor-default">
              <div className="relative">
                <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`} className="w-7 h-7 rounded-full" alt="" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${member.isActive ? 'bg-emerald-400' : 'bg-slate-300'} border border-white dark:border-slate-800`}></span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{member.name}</p>
            </div>
          ))}
          {teamMembers.length === 0 && <p className="text-slate-400 text-sm">No members yet</p>}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Overview component — renders based on role ─────────────────────────
const Overview = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([
          axios.get('/api/tasks'),
          axios.get('/api/auth/users')
        ]);
        setTasks(tasksRes.data);
        setTeamMembers(usersRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  const firstName = user?.name?.split(' ')[0] || 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    todo: tasks.filter(t => t.status === 'Todo').length,
  };

  // Process data for the chart (last 7 days)
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const chartData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = days[d.getDay()];
    const count = tasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate.toDateString() === d.toDateString();
    }).length;
    return { name: dayName, tasks: count };
  });

  return <AdminDashboard 
    firstName={firstName} 
    greeting={greeting} 
    stats={stats} 
    recentTasks={tasks} 
    teamMembers={teamMembers} 
    chartData={chartData}
  />;
};

export default Overview;
