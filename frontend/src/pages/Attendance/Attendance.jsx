import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Seeded random-ish attendance
const getStatus = (memberIdx, dayIdx) => {
  const seed = (memberIdx * 7 + dayIdx) % 10;
  if (dayIdx >= 5) return 'weekend';
  if (seed < 6) return 'present';
  if (seed < 8) return 'late';
  return 'absent';
};

const statusConfig = {
  Present: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/15', label: 'Present' },
  Late:    { icon: AlertCircle,  color: 'text-amber-500',   bg: 'bg-amber-100 dark:bg-amber-500/15',   label: 'Late'    },
  Absent:  { icon: XCircle,      color: 'text-rose-500',    bg: 'bg-rose-100 dark:bg-rose-500/15',     label: 'Absent'  },
};

const Attendance = () => {
  const [view, setView] = useState('weekly');
  const [members, setMembers] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate last 7 dates
  const dates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, recordsRes] = await Promise.all([
        axios.get('/api/auth/users'),
        axios.get('/api/attendance/all')
      ]);
      setMembers(membersRes.data);
      setRecords(recordsRes.data);
    } catch (err) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  // Lookup for quick access
  const recordMap = {};
  records.forEach(r => {
    const userId = r.user?._id || r.user; // handle populated or ID
    recordMap[`${userId}_${r.date}`] = r;
  });

  const presentToday = records.filter(r => r.date === today && (r.status === 'Present' || r.status === 'Late')).length;
  const lateToday = records.filter(r => r.date === today && r.status === 'Late').length;
  const absentToday = members.length - presentToday;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Live workforce tracking enabled — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm" onClick={fetchData}>
            Refresh Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Present Today', value: presentToday, icon: CheckCircle2, color: 'emerald' },
          { label: 'Late Arrivals', value: lateToday, icon: AlertCircle, color: 'amber' },
          { label: 'Absent Today',  value: absentToday > 0 ? absentToday : 0, icon: XCircle, color: 'rose' },
          { label: 'Active Staff',  value: members.length, icon: Clock, color: 'indigo' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                <Icon size={18} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900 dark:text-white">User Activity Log (Last 7 Days)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Employee</th>
                {dates.map(d => {
                  const dateObj = new Date(d);
                  return (
                    <th key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-4">
                       {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}<br/>
                       <span className="font-normal opacity-60">{dateObj.getDate()}</span>
                    </th>
                  );
                })}
                <th className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-4">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {members.map((m) => {
                const memberRecords = dates.map(d => recordMap[`${m._id}_${d}`]).filter(Boolean);
                const rate = dates.length > 0 ? Math.round((memberRecords.length / dates.length) * 100) : 0;

                return (
                  <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} className="w-9 h-9 rounded-full border border-white dark:border-slate-800 shadow-sm" alt="" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.role}</p>
                        </div>
                      </div>
                    </td>
                    {dates.map((d) => {
                      const record = recordMap[`${m._id}_${d}`];
                      const cfg = record ? statusConfig[record.status] : null;
                      
                      return (
                        <td key={d} className="px-2 py-4">
                          {record ? (
                            <div className={`w-10 h-10 mx-auto rounded-xl flex flex-col items-center justify-center transition-all ${cfg.bg} border border-transparent hover:border-slate-200 dark:hover:border-slate-600 relative group/cell hover:z-10`}>
                              <cfg.icon size={16} className={cfg.color} />
                              <span className="text-[8px] font-bold text-slate-500 mt-1">
                                {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/cell:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                                Out: {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 mx-auto rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center opacity-30">
                              <span className="text-slate-300 dark:text-slate-600 text-lg font-light">—</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center">
                      <div className={`text-sm font-black p-1.5 rounded-lg inline-block min-w-[45px] ${rate >= 80 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : rate >= 50 ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'}`}>
                        {rate}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-6 bg-slate-50/50 dark:bg-slate-900/40">
           {Object.entries(statusConfig).map(([key, cfg]) => (
             <div key={key} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
               <cfg.icon size={13} className={cfg.color} />
               <span>{cfg.label}</span>
             </div>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Attendance;
