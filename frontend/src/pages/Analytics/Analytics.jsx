import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ${className}`}>
    {title && <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-5">{title}</h3>}
    {children}
  </div>
);

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/auth/users')
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'Todo').length;
  const inReviewTasks = tasks.filter(t => t.status === 'In Review').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    { name: 'In Progress', value: inProgressTasks, color: '#6366f1' },
    { name: 'Review', value: inReviewTasks, color: '#f59e0b' },
    { name: 'Todo', value: todoTasks, color: '#94a3b8' },
  ];

  // Simple team performance: count tasks per user
  const teamPerf = users.map(user => {
    const userTasks = tasks.filter(t => t.assignees?.includes(user._id) || t.createdBy === user._id);
    return {
      name: user.name,
      tasks: userTasks.length,
      score: Math.min(100, (userTasks.length * 10) + 50), // Dummy score logic
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}`
    };
  }).sort((a, b) => b.tasks - a.tasks).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Insights</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Performance based on real workspace data.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Completion Rate', value: `${completionRate}%`, sub: 'Overall efficiency', color: 'emerald' },
          { label: 'Total Tasks', value: totalTasks, sub: 'Active in workspace', color: 'indigo' },
          { label: 'In Progress', value: inProgressTasks, sub: 'Current workload', color: 'amber' },
          { label: 'Team Size', value: users.length, sub: 'Active members', color: 'rose' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{kpi.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
            <p className={`text-xs mt-1 font-medium text-slate-400`}>{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Status Breakdown" className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }}></span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.name} <span className="font-semibold text-slate-700 dark:text-white">{item.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Team Activity Feed" className="lg:col-span-2">
           <div className="space-y-4">
             {tasks.slice(0, 6).map((task, i) => (
               <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 dark:border-slate-700/50">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 text-xs font-bold">
                    {task.title.charAt(0)}
                 </div>
                 <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{task.title}</p>
                    <p className="text-xs text-slate-400">Status changed to {task.status}</p>
                 </div>
                 <span className="text-[10px] text-slate-400 font-medium">Recently</span>
               </div>
             ))}
             {tasks.length === 0 && <p className="text-center text-slate-400 py-10">No recent task activity</p>}
           </div>
        </Card>
      </div>

      <Card title="Team Performance Leaderboard">
        <div className="space-y-4">
          {teamPerf.map((member, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-amber-400' : 'text-slate-400'}`}>#{i + 1}</span>
              <img src={member.avatar} className="w-8 h-8 rounded-full" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{member.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${member.score}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-8">{member.score}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium shrink-0">{member.tasks} tasks</span>
            </div>
          ))}
          {teamPerf.length === 0 && <p className="text-center text-slate-400 py-5">No member data available</p>}
        </div>
      </Card>
    </motion.div>
  );
};

export default Analytics;
